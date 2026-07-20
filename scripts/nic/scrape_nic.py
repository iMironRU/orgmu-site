#!/usr/bin/env python3
"""Сборка сайта НИЦ (nic.orgma.ru) в наши типовые страницы.

    python3 scripts/nic/scrape_nic.py

Забирает разделы nic.orgma.ru и раскладывает их в content/pages/nic/<slug>.yml
в том же формате блоков, что и остальные типовые страницы (ContentPage) —
своего рендерера у НИЦ нет и не должно быть.

Что делает с устаревшим (сайт-источник заморожен на 2022 годе):
  * ковидные баннеры главной («ПЦР за 1000 ₽», «путешествие без границ»,
    памятка про QR-код) НЕ переносятся — услуг с такими ценами давно нет;
  * над прайсом ставится callout, что цены требуют актуализации;
  * новости 2021–2022 переносятся с реальными датами — видно, что это архив.

Скрипт идемпотентный: перезапуск переписывает yml заново. Ручные правки в
content/pages/nic/ будут затёрты — правьте после финальной выгрузки.
"""
import html
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

import urllib.parse
import urllib.request

import yaml

BASE = "https://nic.orgma.ru/"
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "content" / "pages" / "nic"

# Разделы источника → наши slug/заголовки. Главная не переносится отдельной
# страницей: это витрина ковидных акций 2022 года, живого содержания там нет.
PAGES = [
    ("Home/About.html", "o-nas", "О Научно-исследовательском центре",
     "Структура центра, лаборатории, направления исследований и контакты."),
    ("Home/PickUpPoints.html", "punkty-zabora", "Пункты забора анализов",
     "Адреса, режим работы и условия приёма биологического материала."),
    ("Home/PriceList.html", "analizy-i-ceny", "Анализы и цены",
     "Перечень лабораторных исследований НИЦ с указанием единиц измерения и стоимости."),
    ("Home/PreparationForAnalyzes.html", "podgotovka-k-analizam", "Подготовка к анализам",
     "Как подготовиться к сдаче биологического материала, чтобы результат был достоверным."),
    ("Home/Patients.html", "pacientam", "Пациентам",
     "Порядок обращения, документы и ответы на частые вопросы."),
    ("Home/Business.html", "organizaciyam", "Организациям",
     "Лабораторные исследования и научные работы по договорам с организациями."),
]

SKIP_RE = re.compile(
    r"ПЦР|COVID|SARS-CoV-2|QR-код|антител[а-я]* \(IgG\)|путешеств", re.I
)


class Blocks(HTMLParser):
    """Разбирает <main> в блоки ContentPage: h2 / text / list / table."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []
        self.stack = []          # открытые теги
        self.buf = ""            # текст текущего элемента
        self.list_items = []
        self.list_has_link = False
        self.li_had_link = False
        self.li_href = ""
        self.li_has_blocks = False
        self.summary = ""        # текущая <summary> — название лаборатории
        self.list_files = []     # [{"name","href"}] — ссылки на документы
        self.table = None        # {"head": [...], "rows": [[...]]}
        self.row = None
        self.in_main = False
        self.depth_main = 0

    # --- служебное ---
    def _flush_text(self, kind):
        t = norm(self.buf)
        self.buf = ""
        if not t or t in {"×", "❯"}:
            return
        if kind == "h":
            self.blocks.append({"type": "h2", "text": t})
        else:
            self.blocks.append({"type": "text", "text": t})

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "main":
            self.in_main = True
        if not self.in_main:
            return
        if tag in ("script", "style", "nav"):
            self.stack.append(tag)
            return
        if self.table is not None and tag in ("ul", "ol", "li", "p", "h1", "h2", "h3", "h4", "h5"):
            self.stack.append(tag)   # текст польётся в буфер текущей ячейки
            return
        if tag in ("p", "ul", "ol", "h1", "h2", "h3", "h4", "h5") and "li" in self.stack:
            # Внутри <li> начался вложенный блок: то, что успело набраться, —
            # это подпись пункта (на «Подготовке к анализам» так размечены
            # названия анализов). Выносим её заголовком, а не теряем.
            if norm(self.buf):
                self.blocks.append({"type": "h2", "text": norm(self.buf)})
                self.buf = ""
            self.li_has_blocks = True
        if tag in ("ul", "ol"):
            self.list_items, self.list_has_link = [], False
        elif tag == "li":
            self.buf, self.li_had_link, self.li_href = "", False, ""
            self.li_has_blocks = False
        elif tag == "table":
            self.table = {"head": [], "rows": []}
        elif tag == "tr":
            self.row = []
        elif tag in ("td", "th"):
            self.buf = ""
        elif tag == "summary":
            self.buf = ""
        elif tag in ("h1", "h2", "h3", "h4", "h5", "p"):
            self.buf = ""
        elif tag == "a" and "li" in self.stack:
            self.li_had_link = True
            self.li_href = a.get("href", "")
        elif tag == "br":
            self.buf += " "
        self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag == "main":
            self.in_main = False
        if not self.in_main and tag != "main":
            return
        while self.stack and self.stack[-1] != tag:
            self.stack.pop()
        if self.stack:
            self.stack.pop()

        if self.table is not None and tag in ("ul", "ol", "li", "p", "h1", "h2", "h3", "h4", "h5"):
            return                   # см. handle_starttag: это содержимое ячейки
        if tag == "summary":
            t = norm(self.buf)
            self.buf = ""
            if t:
                self.summary = t
                self.blocks.append({"type": "h2", "text": t})
            return
        if tag in ("h1", "h2", "h3", "h4", "h5"):
            self._flush_text("h")
        elif tag == "p":
            self._flush_text("p")
        elif tag == "li":
            t = norm(self.buf)
            self.buf = ""
            if self.li_has_blocks:
                # содержимое пункта уже вышло блоками — в список не дублируем
                if t:
                    self.blocks.append({"type": "text", "text": t})
            elif t and t not in {"×", "❯"}:
                self.list_items.append(t)
                if self.li_had_link:
                    self.list_has_link = True
                    if is_file(self.li_href):
                        self.list_files.append({"name": t, "href": abs_url(self.li_href)})
        elif tag in ("ul", "ol"):
            # Список, где каждый пункт — ссылка, это навигация (вкладки,
            # меню разделов), а не содержание. Такие не переносим.
            if self.list_files:
                # Документы выводим карточками (AGENTS.md: только DocCards).
                self.blocks.append({"type": "files", "items": self.list_files})
            elif self.list_items and not self.list_has_link:
                self.blocks.append({"type": "list", "items": self.list_items})
            self.list_items, self.list_has_link, self.list_files = [], False, []
        elif tag in ("td", "th"):
            if self.row is not None:
                self.row.append(norm(self.buf))
            self.buf = ""
        elif tag == "tr":
            if self.table is not None and self.row:
                cells = [c for c in self.row]
                if not self.table["head"]:
                    self.table["head"] = cells
                else:
                    self.table["rows"].append(cells)
            self.row = None
        elif tag == "table":
            if self.table and self.table["rows"]:
                self.blocks.append({"type": "table", "lab": self.summary, **self.table})
            self.table = None

    def handle_data(self, data):
        if not self.in_main:
            return
        if self.stack and self.stack[-1] in ("script", "style", "nav"):
            return
        self.buf += data


DOC_EXT = (".pdf", ".doc", ".docx", ".xls", ".xlsx", ".rtf", ".odt", ".zip")


def is_file(href: str) -> bool:
    return bool(href) and urllib.parse.unquote(href).lower().split("?")[0].endswith(DOC_EXT)


def abs_url(href: str) -> str:
    """Абсолютный адрес на nic.orgma.ru, кириллица — читаемой (AGENTS.md:
    в yml адреса храним раскодированными, кодирует уже рендер)."""
    return urllib.parse.unquote(urllib.parse.urljoin(BASE + "Home/", href))


def norm(s: str) -> str:
    t = re.sub(r"\s+", " ", html.unescape(s or "")).replace("\xa0", " ")
    return t.strip(" .")


def fetch(rel: str) -> str:
    req = urllib.request.Request(BASE + rel, headers={"User-Agent": "orgmu-site/nic-scraper"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def tidy_table(b):
    """Прямоугольная таблица: строки дополняются до ширины шапки (строки-группы
    в источнике занимают одну ячейку через colspan), сплошь пустые колонки —
    убираются (у микробиологии есть лишняя четвёртая)."""
    head = list(b["head"])
    rows = [r for r in b["rows"] if any(c.strip() for c in r)]
    width = max([len(head)] + [len(r) for r in rows]) if rows else len(head)
    head += [""] * (width - len(head))
    rows = [r + [""] * (width - len(r)) for r in rows]
    keep = [i for i in range(width) if head[i].strip() or any(r[i].strip() for r in rows)]
    return {
        "type": "table",
        "lab": b.get("lab", ""),
        "head": [head[i] for i in keep],
        "rows": [[r[i] for i in keep] for r in rows],
    }


# Подписи полей у пунктов забора на сайте-источнике.
FIELD_RE = {
    "address": re.compile(r"^Адрес\s*:\s*(.+)", re.I),
    "phone": re.compile(r"^Телефон[ыа]?\s*:\s*(.+)", re.I),
    "email": re.compile(r"^(?:Эл\.?\s*почта|E-?mail)\s*:\s*(.+)", re.I),
    "hours": re.compile(r"^Режим работы\s*:\s*(.+)", re.I),
}


def fold_contacts(blocks):
    """Заголовок + идущие за ним строки «Адрес/Телефоны/Почта/Режим работы»
    сворачиваются в карточку-контакт (блок contacts). Адреса на сайте
    показываются одним способом — карточкой, а не абзацами (Contacts.dc.html)."""
    out, run, i = [], [], 0

    def flush():
        # Подряд идущие карточки — одной сеткой, на своём месте в потоке
        # (а не в конце страницы, иначе сноски окажутся выше адресов).
        if run:
            out.append({"type": "contacts", "items": list(run)})
            run.clear()

    while i < len(blocks):
        b = blocks[i]
        if b["type"] != "h2":
            flush()
            out.append(b)
            i += 1
            continue
        card, j = {"name": b["text"]}, i + 1
        while j < len(blocks) and blocks[j]["type"] == "text":
            hit = False
            for key, rx in FIELD_RE.items():
                m = rx.match(blocks[j]["text"])
                if m:
                    card[key] = m.group(1).strip()
                    hit = True
                    break
            if not hit:
                break
            j += 1
        # Заголовок без единого поля — обычный раздел, не контакт.
        if len(card) == 1:
            flush()
            out.append(b)
            i += 1
            continue
        run.append(card)
        i = j
    flush()
    return out


def col_index(head):
    """Сопоставляем колонки по смыслу: у трёх лабораторий шапки разные
    (где-то есть код услуги, где-то единица измерения)."""
    idx = {"code": None, "name": None, "unit": None, "price": None}
    for i, h in enumerate(head):
        h = h.lower()
        if idx["code"] is None and "код" in h:
            idx["code"] = i
        elif idx["name"] is None and ("наимен" in h or "вид услуги" in h):
            idx["name"] = i
        elif idx["unit"] is None and "единиц" in h:
            idx["unit"] = i
        elif idx["price"] is None and "цена" in h:
            idx["price"] = i
    return idx


def price_num(v):
    """«170-00» и «5790» → число, чтобы сортировать по цене."""
    m = re.match(r"^\s*(\d+)(?:\s*[-–]\s*(\d{2}))?\s*$", v or "")
    if not m:
        return None
    return int(m.group(1)) + (int(m.group(2)) / 100 if m.group(2) else 0)


def fold_pricelist(blocks):
    """Три таблицы разных лабораторий → один прайс с колонками
    лаборатория/раздел/код/услуга/единица/цена. Так его можно искать и
    сортировать целиком, а не глазами по трём таблицам."""
    out, rows, lab = [], [], ""
    for b in blocks:
        if b["type"] == "h2":
            lab = b["text"]          # заголовок перед таблицей — лаборатория
            continue
        if b["type"] != "table":
            out.append(b)
            continue
        idx = col_index(b["head"])
        section = ""
        for r in b["rows"]:
            filled = [c for c in r if c.strip()]
            if len(filled) == 1:
                section = filled[0]  # строка-группа внутри таблицы
                continue
            name = r[idx["name"]] if idx["name"] is not None and idx["name"] < len(r) else ""
            if not name.strip():
                continue
            price = r[idx["price"]] if idx["price"] is not None and idx["price"] < len(r) else ""
            rows.append({
                "lab": lab,
                "section": section,
                "code": r[idx["code"]] if idx["code"] is not None and idx["code"] < len(r) else "",
                "name": name,
                "unit": r[idx["unit"]] if idx["unit"] is not None and idx["unit"] < len(r) else "",
                "price": price,
                "num": price_num(price),
            })
    if rows:
        out.insert(1 if out and out[0]["type"] == "callout" else 0,
                   {"type": "pricelist", "items": rows})
    return out


def clean_blocks(blocks, slug):
    """Убирает мусор и ковидные фрагменты 2022 года."""
    out = []
    for b in blocks:
        if b["type"] in ("text", "h2"):
            t = b["text"]
            if len(t) < 2 or t in {"×", "❯"}:
                continue
            if b["type"] == "h2" and "❯" in t:
                continue          # подпись группы вкладок, не раздел
            t = t.replace("❯", "").strip(" .")
            b = {**b, "text": t}
            # Ковид переносим только в разделе прайса (там это строка услуги),
            # в текстах — выбрасываем: предложения и цены четырёхлетней давности.
            if slug != "analizy-i-ceny" and SKIP_RE.search(t):
                continue
            out.append(b)
        elif b["type"] == "list":
            items = [i.replace("❯", "").strip(" .") for i in b["items"]]
            items = [i for i in items if len(i) > 1]
            if slug != "analizy-i-ceny":
                items = [i for i in items if not SKIP_RE.search(i)]
            if items:
                out.append({"type": "list", "items": items})
        elif b["type"] == "files":
            out.append(b)
        elif b["type"] == "table":
            out.append(tidy_table(b))
    # схлопываем подряд идущие одинаковые заголовки
    dedup = []
    for b in out:
        if dedup and b == dedup[-1]:
            continue
        dedup.append(b)
    return dedup


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for rel, slug, title, lead in PAGES:
        print(f"  {slug:24} ← {rel}", end="", flush=True)
        p = Blocks()
        p.feed(fetch(rel))
        blocks = clean_blocks(p.blocks, slug)
        if slug == "punkty-zabora":
            blocks = fold_contacts(blocks)
        if slug == "analizy-i-ceny":
            blocks = fold_pricelist(blocks)

        if slug == "analizy-i-ceny":
            # Прайс с сайта-источника не обновлялся с 2022 года. Молча
            # публиковать такие цены нельзя — предупреждаем явно.
            blocks.insert(0, {
                "type": "callout",
                "text": "Цены перенесены с прежнего сайта НИЦ и требуют актуализации. "
                        "Перед обращением уточняйте стоимость по телефону регистратуры.",
            })

        data = {
            "slug": slug,
            "title": title,
            "toc": {"numbered": True},
            "breadcrumb": {"href": "/nic", "label": "Научно-исследовательский центр"},
            "lead": lead,
            "blocks": blocks,
        }
        text = yaml.safe_dump(data, allow_unicode=True, sort_keys=False, width=100)
        header = (
            "# Раздел НИЦ. Собран скриптом scripts/nic/scrape_nic.py с nic.orgma.ru.\n"
            "# ВНИМАНИЕ: сайт-источник заморожен на 2022 годе — тексты и особенно\n"
            "# цены требуют проверки. Перезапуск скрипта затирает ручные правки.\n\n"
        )
        (OUT / f"{slug}.yml").write_text(header + text, encoding="utf-8")
        n_tab = sum(len(b.get("rows", [])) for b in blocks if b["type"] == "table")
        print(f"  блоков: {len(blocks):3}  строк таблиц: {n_tab}")


if __name__ == "__main__":
    main()
