#!/usr/bin/env node
/**
 * Машинный перевод контента в память переводов content/i18n/<язык>.json.
 *
 *   node scripts/i18n/translate.mjs --locale en          # перевести недостающее
 *   node scripts/i18n/translate.mjs --locale en --dry    # только показать объём
 *   node scripts/i18n/translate.mjs                      # все языки
 *
 * Требует переменные окружения YANDEX_TRANSLATE_KEY и YANDEX_FOLDER_ID
 * (в CI — из секретов репозитория). Ключ нигде не печатается.
 *
 * Как устроено
 * ------------
 * Исходники остаются чисто русскими: скрипт их только читает. Переводы лежат
 * отдельно, ключ — хеш русского оригинала. Поэтому:
 *   • правка русского текста делает перевод недействительным сама собой
 *     (хеш другой → записи нет → на сайте покажется оригинал с пометкой);
 *   • одинаковые строки («Подробнее», «Все новости») переводятся один раз;
 *   • записи со status:"human" НИКОГДА не перезаписываются — вычитанное
 *     человеком важнее любого автоперевода.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { load as parseYaml } from "js-yaml";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "content", "i18n");
const API = "https://translate.api.cloud.yandex.net/translate/v2/translate";

// Что переводим. Порядок = приоритет пилота: сначала то, что видит каждый.
const SOURCES = [
  "content/navigation/main.yml",
  "content/navigation/footer.yml",
  "content/navigation/apps.yml",
  "content/navigation/sitemap.yml",
  "content/navigation/subsites.yml",
  "content/banners.yml",
  "content/announcements.yml",
  "content/mesta.yml",
  "content/pages/**/*.yml",
  "content/i18n/ui.yml",
  // Подписи разделов и полей sveden — это СТРУКТУРА раздела, её переводим.
  // Сами юридические значения лежат в sveden.json и в источники не входят.
  "content/sveden/labels.json",
];

// Новости лежат по-своему (JSON, тело — разметка), поэтому собираются отдельно.
// Переводим заголовок, лид, тело и подпись автора; адреса, даты и слаги — нет.
const NEWS_DIR = "content/news";
const NEWS_TEXT = ["title", "excerpt", "author"];

// Правила отбора — общие с сайтом (src/lib/i18n/rules.json). Держим в одном
// месте: если разойдутся, скрипт переведёт одно, а страница спросит другое.
const RULES = JSON.parse(fs.readFileSync(path.join(ROOT, "src/lib/i18n/rules.json"), "utf8"));
const SKIP_KEYS = new Set(RULES.skipKeys);
const DOC_EXT = new RegExp(RULES.docExt, "i");
const DOC_FIELDS = new Set(RULES.docFields);
const SKIP_STRINGS = RULES.skipStrings.map((r) => new RegExp(r));
const TECHNICAL = RULES.technical.map((r) => new RegExp(r, "i"));

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const LIST = args.includes("--list"); // показать, что попало в перевод
const only = args.includes("--locale") ? args[args.indexOf("--locale") + 1] : null;
const LOCALES = only ? [only] : ["en", "kk"];

const normalize = (s) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();
const keyOf = (s) => createHash("sha1").update(normalize(s)).digest("hex").slice(0, 12);

// Строку берём в перевод, только если в ней есть кириллица и она не техническая.
function translatable(v) {
  if (typeof v !== "string") return false;
  const s = normalize(v);
  if (s.length < 2 || !/[А-Яа-яЁё]/.test(s)) return false;
  if (s === "—" || s === "-") return false;
  if (SKIP_STRINGS.some((re) => re.test(s))) return false;
  return !TECHNICAL.some((re) => re.test(s));
}

function walk(node, key, out) {
  if (Array.isArray(node)) {
    for (const v of node) walk(v, key, out);
  } else if (node && typeof node === "object") {
    // Объект вида { name, href: "…/акт.pdf" } — это карточка файла: подпись
    // относится к документу и остаётся на языке документа.
    const isDoc = typeof node.href === "string" && DOC_EXT.test(node.href);
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k) || k.startsWith("_")) continue;
      if (isDoc && DOC_FIELDS.has(k)) continue;
      walk(v, k, out);
    }
  } else if (translatable(node)) {
    out.add(normalize(node));
  }
}

function expand(pattern) {
  if (!pattern.includes("*")) return fs.existsSync(path.join(ROOT, pattern)) ? [pattern] : [];
  const [base] = pattern.split("**");
  const dir = path.join(ROOT, base);
  if (!fs.existsSync(dir)) return [];
  const found = [];
  const rec = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) rec(p);
      else if (/\.(yml|json)$/.test(e.name)) found.push(path.relative(ROOT, p));
    }
  };
  rec(dir);
  return found;
}

function collectNews(map) {
  const dir = path.join(ROOT, NEWS_DIR);
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json") || f.startsWith("_")) continue;
    const n = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const k of NEWS_TEXT) {
      if (translatable(n[k])) map.set(normalize(n[k]), false);
    }
    // Тело — разметка. Отправляем с format:"HTML", иначе переводчик съест теги.
    const body = (n.body_html || "").trim();
    if (body && /[А-Яа-яЁё]/.test(body)) map.set(body, true);
  }
}

function collect() {
  const strings = new Set();
  for (const pattern of SOURCES) {
    for (const rel of expand(pattern)) {
      const raw = fs.readFileSync(path.join(ROOT, rel), "utf8");
      let data;
      try {
        data = rel.endsWith(".json") ? JSON.parse(raw) : parseYaml(raw);
      } catch (e) {
        console.error(`  ! пропускаю ${rel}: ${e.message.split("\n")[0]}`);
        continue;
      }
      walk(data, null, strings);
    }
  }
  // map: строка → это разметка? Дедупликация заодно.
  const map = new Map([...strings].map((s) => [s, false]));
  collectNews(map);
  return [...map.entries()].map(([src, html]) => ({ src, html }));
}

async function translateBatch(texts, locale, key, folder, format = "PLAIN_TEXT") {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Api-Key ${key}` },
    body: JSON.stringify({
      folderId: folder,
      texts,
      sourceLanguageCode: "ru",
      targetLanguageCode: locale,
      format,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  return json.translations.map((t) => t.text);
}

async function run(locale, strings) {
  const file = path.join(OUT_DIR, `${locale}.json`);
  const mem = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};

  const live = new Set(strings.map((e) => keyOf(e.src)));
  let pruned = 0;
  for (const [k, e] of Object.entries(mem)) {
    if (e.status !== "human" && !live.has(k)) {
      delete mem[k];
      pruned++;
    }
  }

  const todo = strings.filter((e) => !mem[keyOf(e.src)]);
  const human = Object.values(mem).filter((e) => e.status === "human").length;
  const chars = todo.reduce((n, e) => n + e.src.length, 0);

  console.log(
    `\n[${locale}] всего строк: ${strings.length} | в памяти: ${Object.keys(mem).length}` +
      ` (вычитано человеком: ${human}) | убрано устаревших: ${pruned}` +
      ` | к переводу: ${todo.length} (${chars.toLocaleString("ru")} зн.)`,
  );
  if (DRY) return;
  if (todo.length === 0 && pruned === 0) return;

  if (todo.length > 0) {
    // Ключ спрашиваем только здесь: уборка устаревших записей работает и без него.
    const key = process.env.YANDEX_TRANSLATE_KEY;
    const folder = process.env.YANDEX_FOLDER_ID;
    if (!key || !folder) {
      console.error("  ! нет YANDEX_TRANSLATE_KEY / YANDEX_FOLDER_ID");
      process.exit(1);
    }
  // Пачками: у API лимит ~10 000 знаков на запрос, берём с запасом.
  const LIMIT = 8000;
  const at = new Date().toISOString().slice(0, 10);
  let done = 0;
  const remember = (src, text, html) => {
    mem[keyOf(src)] = { src, text, status: "machine", at, ...(html ? { html: true } : {}) };
  };

  // Разметку и обычный текст нельзя слать вместе: format задаётся на весь
  // запрос. Тело новости уходит отдельным запросом с format:"HTML" — иначе
  // переводчик выбросил бы теги и абзацы схлопнулись бы в сплошную простыню.
  const htmlItems = todo.filter((e) => e.html);
  const textItems = todo.filter((e) => !e.html);

  for (const e of htmlItems) {
    const [out] = await translateBatch([e.src], locale, key, folder, "HTML");
    remember(e.src, out, true);
    process.stdout.write(`\r  переведено ${++done}/${todo.length}`);
  }

  for (let i = 0; i < textItems.length; ) {
    const batch = [];
    let size = 0;
    while (i < textItems.length && batch.length < 100 && size + textItems[i].src.length < LIMIT) {
      size += textItems[i].src.length;
      batch.push(textItems[i++].src);
    }
    const out = await translateBatch(batch, locale, key, folder);
    batch.forEach((src, j) => remember(src, out[j], false));
    done += batch.length;
    process.stdout.write(`\r  переведено ${done}/${todo.length}`);
  }
  console.log();
  }

  // Сортируем по ключу — иначе каждый прогон давал бы шумный diff.
  const sorted = Object.fromEntries(Object.entries(mem).sort(([a], [b]) => a.localeCompare(b)));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + "\n", "utf8");
  console.log(`  записано: content/i18n/${locale}.json`);
}

const strings = collect();
console.log(`Источники: ${SOURCES.length} шаблонов → уникальных строк: ${strings.length}`);
if (LIST) {
  for (const e of strings) console.log(e.html ? "  html·" : "  ·", e.src.length > 90 ? e.src.slice(0, 90) + "…" : e.src);
  process.exit(0);
}
for (const l of LOCALES) await run(l, strings);
