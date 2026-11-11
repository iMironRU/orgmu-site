#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
orgma_k2_scrape.py — выгрузка новостей ОрГМУ (Joomla + K2) в файлы репозитория.

Адаптация исходного скрапера под сайт orgmu-site:
  * вывод — по одному файлу на новость: content/news/{item_id}.json
    (git-история = журнал правок; правка новости перезаписывает её файл);
  * картинки по умолчанию НЕ качаются, а хранятся как hotlink-ссылки на
    orgma.ru (media=hotlink) — в JSON лежат абсолютные URL, бинарников в репо нет;
  * ссылки внутри lead_html/body_html абсолютизируются на https://www.orgma.ru,
    чтобы контент был самодостаточным при рендере на другом домене.

Водяная метка инкремента — в content/news/_state.json (файлы с '_' загрузчик
сайта игнорирует).

Режимы (--mode):
  full         Полная выгрузка всей ленты (первичная миграция).
  incremental  Только новости новее сохранённой метки max_item_id. Быстро — для cron.
  refresh      Сверка правок первых --refresh-pages страниц по полю modified.

Ключевые факты о сайте (обнаружены эмпирически, из исходного скрапера):
  - Лента отдаёт JSON только с завершающим слэшем перед '?':
        https://www.orgma.ru/ru/novosti/?page=1&limit=10&format=json
  - ВАЖНО: пагинация работает через page (с 1) + limit, а НЕ через start/limitstart —
    параметр start сервер молча игнорирует и всегда отдаёт последние N элементов
    (по умолчанию 100). Раньше скрапер листал через start и из-за этого бесконечно
    перечитывал одну и ту же страницу, пока CI не убивал шаг по таймауту.
  - В списочном JSON fulltext="" — полный текст берётся из карточки item'а:
        https://www.orgma.ru/ru/novosti/item/{id}-{alias}?format=json
  - item_id в K2 — автоинкремент; лента свежими вперёд → инкремент по id надёжен.
  - Обложка (hotlink): imageXLarge (всегда .jpg, ~800px) — гарантированно существует.
  - Галерея (hotlink): ссылки /media/k2/galleries/{id}/... из поля gallery.
  - Лента тяжёлая и медленная (около 1 МБ, несколько секунд на запрос), поэтому
    прогон ограничен по времени (--max-seconds) и числу страниц (--max-pages).

Зависимости: requests  (pip install -r requirements.txt)
"""

import argparse
import html
import json
import os
import re
import sys
import time
from urllib.parse import urljoin

import requests

# ------------------------------------------------------------------ конфиг
BASE      = "https://www.orgma.ru"
LIST_URL  = BASE + "/ru/novosti/"     # слэш обязателен
PAGE_SIZE = 10                        # limit: по 10 элементов на страницу
TIMEOUT   = (10, 20)                  # (connect, read) сек; read — между чанками
RETRIES   = 3                         # попытки для ленты (критично)
CARD_RETRIES = 1                      # карточку item'а лишний раз не долбим
DEFAULT_MAX_SECONDS = 480.0           # предохранитель: 8 мин (запас под CI ~10 мин)

GALLERY_RE = re.compile(r'href="(/media/k2/galleries/[^"]+)"')
# root-relative src/href в теле статьи -> абсолютный URL на orgma.ru
HTML_URL_RE = re.compile(r'(\b(?:src|href)=")(/[^"]*)"')

session = requests.Session()
session.headers.update({
    "User-Agent": "orgma-migration/1.0 (+internal OrGMU content migration)"
})


class ScrapeError(Exception):
    """Фатальная ошибка скрапинга — не временная, ретраи не помогут."""


class DeadlineExpired(Exception):
    """Исчерпан общий лимит времени прогона."""


class Deadline:
    """Стена: проверяем в циклах, чтобы CI не убивал нас молча по таймауту."""

    def __init__(self, seconds):
        self.end = time.monotonic() + max(0.0, float(seconds))

    def remaining(self):
        return max(0.0, self.end - time.monotonic())

    def expired(self):
        return time.monotonic() >= self.end


# ------------------------------------------------------------------ утилиты
def get_json(url, params=None, retries=RETRIES, timeout=TIMEOUT):
    last = None
    for attempt in range(retries):
        try:
            r = session.get(url, params=params, timeout=timeout)
            r.raise_for_status()
            return json.loads(r.text.strip())
        except (requests.RequestException, json.JSONDecodeError) as e:
            last = e
            if attempt + 1 < retries:
                time.sleep(min(5.0, 1.5 * (attempt + 1)))
    raise ScrapeError(f"{url}: {last!r}")


def iso(dt):
    """K2 отдаёт '2026-07-13 07:16:27' или '0000-00-00 00:00:00'."""
    if not dt or dt.startswith("0000"):
        return None
    return dt.replace(" ", "T")


def absolutize_html(text):
    """Root-relative ссылки/картинки внутри HTML -> абсолютные на orgma.ru."""
    if not text:
        return text
    return HTML_URL_RE.sub(lambda m: f'{m.group(1)}{BASE}{m.group(2)}"', text)


def abs_url(rel):
    if not rel:
        return None
    return rel if rel.startswith("http") else urljoin(BASE, rel)


# ------------------------------------------------------------------ медиа (hotlink)
def cover_of(item, cfg):
    if cfg.media == "none":
        return None
    remote = abs_url(item.get("imageXLarge") or item.get("image") or "")
    return {"remote": remote} if remote else None


def gallery_of(item, cfg):
    if cfg.media == "none":
        return []
    out, seen = [], []
    for rel in GALLERY_RE.findall(item.get("gallery") or ""):
        rel = html.unescape(rel)
        if rel in seen:
            continue
        seen.append(rel)
        out.append({"remote": abs_url(rel)})
    return out


# ------------------------------------------------------------------ текст
# У этого K2 весь текст статьи лежит в introtext (fulltext, как правило, пуст),
# НО в ленте introtext урезан (~600 симв. + «…»); полный — только в карточке item.
def fetch_body(item, cfg, deadline):
    """Полный HTML статьи (introtext + fulltext) из карточки item.
    Фолбэк — усечённый introtext из ленты (если карточка недоступна или --no-fulltext)."""
    list_intro = item.get("introtext") or ""
    if cfg.no_fulltext:
        return list_intro
    url = urljoin(BASE, item.get("link") or "")
    for variant in (url, url.rstrip("/") + "/"):   # с/без слэша перед ?
        if deadline.expired():
            break
        try:
            data = get_json(variant, params={"format": "json"},
                            retries=CARD_RETRIES, timeout=cfg.timeout)
        except ScrapeError:
            continue
        it = data.get("item") or (data.get("items") or [{}])[0]
        if it:
            return (it.get("introtext") or "") + (it.get("fulltext") or "")
    return list_intro


def text_excerpt(html_str, limit=220):
    """Короткий plain-text анонс из HTML для карточек ленты."""
    if not html_str:
        return ""
    text = re.sub(r"<[^>]+>", " ", html_str)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip().rstrip("…").strip()
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0].rstrip(",.;:—-")
    return cut + "…"


# ------------------------------------------------------------------ схема
def normalize(item, cfg, deadline):
    """K2 item -> нормализованная новость (self-contained, ссылки абсолютные)."""
    body = absolutize_html(fetch_body(item, cfg, deadline))
    return {
        "source": {
            "system": "orgma-k2",
            "item_id": int(item["id"]),
            "catid": int(item.get("catid") or 0),
            "url": urljoin(BASE, item.get("link") or ""),
            "hits": int(item.get("hits") or 0),
        },
        "title": html.unescape(item.get("title") or "").strip(),
        "slug": item.get("alias") or str(item["id"]),
        "published_at": iso(item.get("created")),
        "modified_at": iso(item.get("modified")),
        "author": ((item.get("author") or {}).get("name") or "").strip() or None,
        "excerpt": text_excerpt(body),
        "body_html": body,
        "cover": cover_of(item, cfg),
        "gallery": gallery_of(item, cfg),
        "tags": [t.get("name") for t in (item.get("tags") or []) if isinstance(t, dict)],
        "language": item.get("language") or "*",
    }


# ------------------------------------------------------------------ state / вывод
def state_path(cfg):
    return os.path.join(cfg.out, "_state.json")


def load_state(cfg):
    p = state_path(cfg)
    if os.path.exists(p):
        try:
            with open(p, encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            raise ScrapeError(f"повреждён {p}: {e}; почините или удалите файл") from e
    return {"max_item_id": 0, "modified": {}}


def save_state(cfg, state):
    os.makedirs(cfg.out, exist_ok=True)
    with open(state_path(cfg), "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
        f.write("\n")


def write_item(cfg, rec):
    os.makedirs(cfg.out, exist_ok=True)
    path = os.path.join(cfg.out, f"{rec['source']['item_id']}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rec, f, ensure_ascii=False, indent=2)
        f.write("\n")


# ------------------------------------------------------------------ ядро
def process_item(item, cfg, state, deadline):
    if deadline.expired():
        raise DeadlineExpired()
    iid = int(item["id"])
    rec = normalize(item, cfg, deadline)
    write_item(cfg, rec)
    state["max_item_id"] = max(state["max_item_id"], iid)
    if rec["modified_at"]:
        state["modified"][str(iid)] = rec["modified_at"]
    print(f"  id={iid:<6} «{rec['title'][:58]}»  "
          f"cover={'y' if rec['cover'] else '-'} gal={len(rec['gallery'])} "
          f"body={'y' if rec['body_html'] else '-'}")
    time.sleep(cfg.delay)


def iter_pages(cfg, max_pages, deadline):
    """Листает ленту постранично.

    K2 на orgma.ru игнорирует start/limitstart и листает только через page (с 1)
    + limit — поэтому здесь page. Дополнительно страхуемся от регрессии сервера:
    если страница вернула только уже виденные id, дальнейшего скролла нет.
    """
    seen = set()
    for page in range(1, max_pages + 1):
        if deadline.expired():
            raise DeadlineExpired()
        try:
            data = get_json(LIST_URL, params={"page": page, "limit": PAGE_SIZE,
                                              "format": "json"})
        except ScrapeError as e:
            print(f"[!] стр. page={page}: {e}")
            if page == 1:
                raise ScrapeError(f"лента недоступна (page=1): {e}") from e
            print("[!] лента отвечает с ошибками — останавливаюсь")
            return
        items = data.get("items") or []
        if not items:
            print(f"[=] пусто на page={page} — конец ленты")
            return
        new_ids = [int(i["id"]) for i in items if int(i["id"]) not in seen]
        if not new_ids:
            print("[=] страница не дала новых id (сервер игнорирует пагинацию) — стоп")
            return
        seen.update(int(i["id"]) for i in items)
        yield page, (page - 1) * PAGE_SIZE, items
        time.sleep(cfg.delay)


def run_full(cfg, deadline):
    state = {"max_item_id": 0, "modified": {}}
    total = 0
    try:
        for page, start, items in iter_pages(cfg, cfg.max_pages, deadline):
            for item in items:
                if cfg.max_items > 0 and total >= cfg.max_items:
                    print(f"[=] достигнут --max-items={cfg.max_items} — стоп")
                    break
                process_item(item, cfg, state, deadline)
                total += 1
            print(f"[page {page}] +{len(items)} (итого {total})")
            if cfg.max_items > 0 and total >= cfg.max_items:
                break
    finally:
        save_state(cfg, state)
    print(f"\nfull готово: {total} новостей, max_item_id={state['max_item_id']}")


def run_incremental(cfg, deadline):
    state = load_state(cfg)
    wm = state["max_item_id"]
    print(f"инкремент от max_item_id={wm}")
    total = 0
    try:
        for page, start, items in iter_pages(cfg, cfg.max_pages, deadline):
            stop = False
            for item in items:
                if int(item["id"]) <= wm:
                    stop = True
                    break
                if cfg.max_items > 0 and total >= cfg.max_items:
                    print(f"[=] достигнут --max-items={cfg.max_items} — стоп")
                    stop = True
                    break
                process_item(item, cfg, state, deadline)
                total += 1
            if stop:
                print("[=] дошли до известной новости — стоп")
                break
    finally:
        save_state(cfg, state)
    print(f"\nincremental готово: +{total}, max_item_id={state['max_item_id']}")


def run_refresh(cfg, deadline):
    """Сверка правок в первых N страницах по полю modified."""
    state = load_state(cfg)
    known = state.get("modified", {})
    total = 0
    try:
        for page, start, items in iter_pages(cfg, cfg.refresh_pages, deadline):
            for item in items:
                if cfg.max_items > 0 and total >= cfg.max_items:
                    print(f"[=] достигнут --max-items={cfg.max_items} — стоп")
                    break
                iid = str(item["id"])
                cur = iso(item.get("modified"))
                if cur and known.get(iid) == cur:
                    continue  # без изменений
                process_item(item, cfg, state, deadline)
                total += 1
            if cfg.max_items > 0 and total >= cfg.max_items:
                break
    finally:
        save_state(cfg, state)
    print(f"\nrefresh готово: перекачано {total} изменённых")


# ------------------------------------------------------------------ CLI
def main():
    ap = argparse.ArgumentParser(description="K2 JSON news scraper for orgma.ru -> content/news")
    ap.add_argument("--mode", choices=["full", "incremental", "refresh"], default="incremental")
    ap.add_argument("--out", default="content/news", help="каталог вывода (per-file JSON)")
    ap.add_argument("--delay", type=float, default=0.7, help="пауза между запросами, сек")
    ap.add_argument("--max-pages", type=int, default=1000, help="предохранитель на число страниц")
    ap.add_argument("--max-items", type=int, default=0,
                    help="предохранитель: максимум новостей за прогон (0 — без лимита)")
    ap.add_argument("--max-seconds", type=float, default=DEFAULT_MAX_SECONDS,
                    help="общий лимит времени прогона, сек (0 — без лимита)")
    ap.add_argument("--refresh-pages", type=int, default=3,
                    help="сколько первых страниц сверять в режиме refresh")
    ap.add_argument("--media", choices=["hotlink", "none"], default="hotlink",
                    help="hotlink — ссылки на orgma.ru (по умолчанию); none — без картинок")
    ap.add_argument("--no-fulltext", action="store_true", help="не тянуть полный текст (только анонсы)")
    cfg = ap.parse_args()
    cfg.timeout = TIMEOUT

    deadline = Deadline(cfg.max_seconds if cfg.max_seconds > 0 else float("inf"))

    print(f"режим={cfg.mode}  out={cfg.out}  delay={cfg.delay}s  "
          f"media={cfg.media}  fulltext={not cfg.no_fulltext}  "
          f"max_seconds={cfg.max_seconds:g}s  max_pages={cfg.max_pages}  "
          f"max_items={cfg.max_items}\n")
    try:
        {"full": run_full,
         "incremental": run_incremental,
         "refresh": run_refresh}[cfg.mode](cfg, deadline)
    except DeadlineExpired:
        print(f"\n[!] превышен лимит времени ({cfg.max_seconds:g}с); "
              f"прогресс сохранён в _state.json — следующий прогон продолжится")
        sys.exit(2)
    except ScrapeError as e:
        print(f"\n[!] ошибка скрапинга: {e}")
        sys.exit(2)
    except KeyboardInterrupt:
        print("\n[!] прервано пользователем; _state.json сохранён на последнем успешном шаге")
        sys.exit(1)


if __name__ == "__main__":
    main()
