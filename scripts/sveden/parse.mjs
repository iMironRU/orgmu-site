#!/usr/bin/env node
// Универсальный парсер раздела /sveden/ — работает с ЛЮБЫМ сайтом ОО, размеченным
// по Приказу Рособрнадзора № 1493 (та же микроразметка itemprop, что описана в
// standards/sveden/vocab/base.yaml). Ничего не знает про конкретную организацию —
// весь список полей и групп берёт из словаря, а не зашивает в код.
//
// Использование:
//   node parser/parse.mjs https://example-oo.ru [data/parsed.sveden.json]
//   node parser/parse.mjs ./saved-pages [data/parsed.sveden.json]
//
// Источник — либо базовый URL сайта (подразделы читаются по своим /sveden/<slug>/
// адресам из словаря), либо локальная папка с сохранёнными страницами вида
// <раздел>.html (common.html, struct.html, ...) — удобно для офлайн-разбора и тестов
// без обращения к реальному сайту.
import fs from "node:fs";
import path from "node:path";
import { load } from "cheerio";
import { loadVocab, listSectionKeys, sectionFields, sectionGroups } from "./vocab.mjs";

// Немало старых сайтов ОО (в т.ч. реальные вузовские CMS) отдают кириллицу не в
// UTF-8, а в KOI8-R/windows-1251/cp1251 — и HTTP-заголовок Content-Type при этом
// часто врёт (наблюдалось: charset=iso-8859-1 по заголовку при фактическом
// KOI8-R в <meta>). Поэтому кодировку определяем по телу страницы (её
// декларация всегда в ASCII, читается независимо от реальной кодировки), а
// заголовок — только запасной вариант.
function detectCharset(buffer, headerContentType) {
  const asciiPrefix = buffer.subarray(0, 2048).toString("latin1");
  const metaMatch = asciiPrefix.match(/<meta[^>]+charset=["']?\s*([\w-]+)/i);
  if (metaMatch) return metaMatch[1].toLowerCase();
  const headerMatch = headerContentType?.match(/charset=([\w-]+)/i);
  if (headerMatch) return headerMatch[1].toLowerCase();
  return "utf-8";
}

function decodeHtml(buffer, headerContentType) {
  const charset = detectCharset(buffer, headerContentType);
  try {
    return new TextDecoder(charset).decode(buffer);
  } catch {
    console.warn(`  ⚠ неизвестная кодировка "${charset}", читаю как UTF-8`);
    return new TextDecoder("utf-8").decode(buffer);
  }
}

// Один сетевой запрос, с таймаутом (по умолчанию агрессивные таймауты fetch на
// старых/перегруженных серверах вузов дают ложный "недоступен" раньше времени).
async function fetchOnce(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const buffer = Buffer.from(await res.arrayBuffer());
    return { ok: true, html: decodeHtml(buffer, res.headers.get("content-type")) };
  } catch (err) {
    const reason = err.name === "AbortError" ? `таймаут ${timeoutMs}мс` : err.cause?.message || err.message;
    return { ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}

// Провал уровня соединения (таймаут/сброс/DNS) отличаем от HTTP-статуса: статус
// (даже 404/403) означает, что сервер вообще отвечает — а вот таймаут/обрыв на
// первом же разделе — сильный сигнал, что недоступен весь хост целиком, а не
// одна страница.
function isConnectionLevelFailure(reason) {
  return typeof reason === "string" && !reason.startsWith("HTTP ");
}

// Максимальная живучесть по сети: короткая попытка → более долгий повтор →
// если и HTTPS полностью недоступен (не просто TLS-нюанс, а обрыв/таймаут
// соединения) — пробуем HTTP тем же путём (реальный случай: старые вузовские
// сайты нередко держат рабочий HTTP при сломанном/медленном HTTPS).
//
// fastMode — включается после того, как на ПРЕДЫДУЩЕМ разделе весь хост уже
// не ответил ни по HTTPS, ни по HTTP: тратить по 45с полной лестницы на каждый
// из оставшихся 13 разделов бессмысленно — раз в разделах остаётся шанс, что
// именно этот путь на сайте всё же жив, делаем одну короткую попытку вместо
// полного повтора.
async function fetchWithFallback(url, fastMode) {
  if (fastMode) {
    return fetchOnce(url, 6_000);
  }

  let attempt = await fetchOnce(url, 10_000);
  if (attempt.ok) return attempt;

  attempt = await fetchOnce(url, 20_000);
  if (attempt.ok) return attempt;

  if (url.startsWith("https://")) {
    const httpUrl = "http://" + url.slice("https://".length);
    const httpAttempt = await fetchOnce(httpUrl, 15_000);
    if (httpAttempt.ok) return httpAttempt;
    return { ok: false, reason: `${attempt.reason} (https); ${httpAttempt.reason} (http)` };
  }
  return attempt;
}

async function fetchHtml(source, sectionKey, sectionUrl, fastMode) {
  if (/^https?:\/\//.test(source)) {
    const url = new URL(sectionUrl, source).toString();
    const result = await fetchWithFallback(url, fastMode);
    if (!result.ok) {
      return { html: null, reason: result.reason, connectionLevel: isConnectionLevelFailure(result.reason) };
    }
    return { html: result.html, reason: null, connectionLevel: false };
  }
  const file = path.join(source, `${sectionKey}.html`);
  if (!fs.existsSync(file)) return { html: null, reason: "файл не найден", connectionLevel: false };
  try {
    return { html: decodeHtml(fs.readFileSync(file), null), reason: null, connectionLevel: false };
  } catch (err) {
    return { html: null, reason: err.message, connectionLevel: false };
  }
}

// Значение поля: если размечен элемент со ссылкой (сам <a> или содержит <a href>) —
// сохраняем текст и href отдельно (нужно для *DocLink/*El полей — это гиперссылки на
// документы, а не просто текст); иначе — только нормализованный текст.
function extractValue($, el) {
  const $el = $(el);
  const tag = el.tagName?.toLowerCase();
  const href = tag === "a" ? $el.attr("href") : $el.find("a[href]").first().attr("href");
  const text = $el.text().trim().replace(/\s+/g, " ");
  if (href) return { text, href };
  return text || null;
}

// Реальная находка (orgma.ru, разделы managers/vacant/education): один и тот же
// itemprop нередко стоит ДВАЖДЫ — на строке заголовка таблицы (<thead>, с текстом
// подписи столбца вместо значения) и на строке данных (<tbody>, с настоящим
// значением). По порядку в DOM <thead> идёт первым — наивный ".first()" вместо
// значения возвращает подпись. Правило общее, не завязано на один сайт: если
// среди совпадений есть хоть одно вне <thead>, совпадения внутри <thead>
// отбрасываются как заведомо заголовочные.
function preferTbody($, elements) {
  const bodyEls = elements.filter((el) => $(el).closest("thead").length === 0);
  return bodyEls.length > 0 ? bodyEls : elements;
}

// Максимальная живучесть при разборе: реальные сайты дают неожиданную вложенность,
// оборванные теги, нестандартные структуры. Одно поле/группа не должны обрушивать
// разбор всего раздела — каждое читается независимо, ошибка на одном не должна
// стоить остальных уже извлечённых значений.
function safeExtract(fn, onErrorLabel) {
  try {
    return fn();
  } catch (err) {
    console.warn(`  ⚠ ${onErrorLabel}: ${err.message}`);
    return undefined;
  }
}

function extractItemHref($, itemEl) {
  const $item = $(itemEl);
  const tag = itemEl.tagName?.toLowerCase();
  return tag === "a" ? $item.attr("href") : $item.find("a[href]").first().attr("href");
}

// --- Запасной путь: страница разбита по ссылкам (orgma.ru/sveden/employees —
// itemprop стоит не на преподавателе, а на ссылке-программе, реальная таблица
// преподавателей — на отдельной связанной странице БЕЗ микроразметки вообще).
// Официальный словарь такого сценария не описывает под конкретные ключевые
// слова — сопоставление заголовков таблицы с полями группы держим здесь, не
// в vocab/base.yaml, это эвристика поверх произвольной вёрстки, не часть
// контракта микроразметки.
const FIELD_LABEL_KEYWORDS = {
  fio: [["фио"], ["ф.и.о"], ["фамили", "имя"]],
  post: [["должност"]],
  teachingDiscipline: [["дисциплин"], ["предмет"], ["курс"]],
  teachingLevel: [["уровень", "образован"]],
  degree: [["учен", "степен"]],
  academStat: [["учен", "звани"]],
  qualification: [["повышен", "квалифика"]],
  profDevelopment: [["переподготов"]],
  specExperience: [["стаж"], ["опыт", "работ"]],
  teachingOp: [["образовательных программ"], ["реализац"]],
};

// Строка "1 | 2 | 3 ..." (нумерация столбцов) или пустая — служебная, не данные.
function isServiceRow(cellsText) {
  return cellsText.every((t) => t === "" || /^\d{1,3}$/.test(t));
}

// Ищет в таблице строку заголовков и пытается сопоставить её ячейки с полями
// группы по ключевым словам. Возвращает { colIndex → field.key } или null,
// если совпадений мало (значит это не таблица преподавателей, а что-то ещё).
function matchTableColumns($, $table, fields) {
  const headerCells = $table.find("tr").first().find("th, td").toArray()
    .map((c) => $(c).text().trim().toLowerCase());
  const columnMap = {};
  headerCells.forEach((text, colIndex) => {
    for (const f of fields) {
      if (Object.values(columnMap).includes(f.key)) continue;
      const groups = FIELD_LABEL_KEYWORDS[f.key];
      if (!groups) continue;
      if (groups.some((kws) => kws.every((kw) => text.includes(kw)))) {
        columnMap[colIndex] = f.key;
        break;
      }
    }
  });
  const matched = Object.values(columnMap);
  if (!matched.includes("fio") || matched.length < 2) return null;
  return columnMap;
}

function findDataTable($, fields) {
  for (const table of $("table").toArray()) {
    const columnMap = matchTableColumns($, $(table), fields);
    if (columnMap) return { table, columnMap };
  }
  return null;
}

function extractTableRows($, table, columnMap) {
  const rows = $(table).find("tr").toArray();
  const records = [];
  // rows[0] — уже опознанная строка заголовков, данные начинаются с rows[1].
  for (const row of rows.slice(1)) {
    const cellsText = $(row).find("th, td").toArray()
      .map((c) => $(c).text().trim().replace(/[ \t]*\n[ \t]*/g, "\n").replace(/[ \t]{2,}/g, " "));
    if (!cellsText.length || isServiceRow(cellsText)) continue;
    const record = {};
    for (const [idx, key] of Object.entries(columnMap)) {
      const val = cellsText[Number(idx)];
      if (val) record[key] = val;
    }
    if (record.fio) records.push(record);
  }
  return records;
}

// Переходит по ссылкам, которые остались без полей при разборе по itemprop
// (пустые элементы группы — сама ссылка на подстраницу, не данные), и на
// каждой связанной странице пытается найти и распознать таблицу нужной формы.
async function followEmptyGroupLinks(groupKey, fields, hrefs, baseUrl) {
  const collected = [];
  const capped = hrefs.slice(0, 30);
  if (hrefs.length > capped.length) {
    console.warn(`  ⚠ ${groupKey}: ссылок больше 30 (${hrefs.length}) — беру первые 30`);
  }
  for (const href of capped) {
    const url = new URL(href, baseUrl).toString();
    const attempt = await fetchOnce(url, 10_000);
    if (!attempt.ok) continue;
    const $$ = load(attempt.html);
    const found = findDataTable($$, fields);
    if (found) collected.push(...extractTableRows($$, found.table, found.columnMap));
  }
  return collected;
}

async function parseSection($, section, baseUrl) {
  const result = { fields: {}, groups: {} };

  for (const f of sectionFields(section)) {
    const value = safeExtract(() => {
      const els = preferTbody($, $(`[itemprop="${f.itemprop}"]`).toArray());
      return els.length ? extractValue($, els[0]) : undefined;
    }, `поле ${f.key}`);
    if (value !== undefined) result.fields[f.key] = value;
  }

  for (const g of sectionGroups(section)) {
    // Соглашение словаря (base.yaml, шапка файла): from оканчивается на "[]" —
    // повторяющийся блок (массив); иначе — одиночный (напр. managers.rucovodstvo).
    const isCollection = typeof g.from === "string" && g.from.endsWith("[]");
    const emptyItemHrefs = [];
    const items = safeExtract(() => {
      const itemEls = preferTbody($, $(`[itemprop="${g.itemprop}"]`).toArray());
      return itemEls.map((itemEl, i) =>
        safeExtract(() => {
          const $item = $(itemEl);
          const item = {};
          for (const f of g.fields) {
            const els = preferTbody($, $item.find(`[itemprop="${f.itemprop}"]`).toArray());
            if (els.length) item[f.key] = extractValue($, els[0]);
          }
          if (Object.keys(item).length === 0) {
            const href = extractItemHref($, itemEl);
            if (href) emptyItemHrefs.push(href);
          }
          return item;
        }, `группа ${g.key}[${i}]`) ?? {}
      );
    }, `группа ${g.key}`) ?? [];
    result.groups[g.key] = isCollection ? items : (items[0] ?? null);

    // Запасной путь только когда прямое чтение вообще ничего не дало (а не
    // просто часть элементов) — при частичном успехе доверяем основным данным
    // и не рискуем подменять их эвристикой по заголовкам таблиц.
    if (baseUrl && emptyItemHrefs.length && items.every((it) => Object.keys(it).length === 0)) {
      const found = await safeExtractAsync(
        () => followEmptyGroupLinks(g.key, g.fields, emptyItemHrefs, baseUrl),
        `группа ${g.key} (переход по ссылкам)`,
      );
      if (found?.length) {
        console.warn(`  ✓ ${g.key}: найдено ${found.length} строк на связанных страницах (без itemprop)`);
        result.groups[g.key] = isCollection ? found : found[0];
      }
    }
  }

  return result;
}

async function safeExtractAsync(fn, onErrorLabel) {
  try {
    return await fn();
  } catch (err) {
    console.warn(`  ⚠ ${onErrorLabel}: ${err.message}`);
    return undefined;
  }
}

async function main() {
  const [, , source, outArg] = process.argv;
  if (!source) {
    console.error("Использование: node parser/parse.mjs <base-url-или-папка-с-html> [выходной.json]");
    console.error("  base-url — сайт с подразделами /sveden/<slug>/ по стандартной микроразметке Приказа №1493");
    console.error("  папка    — локальные сохранённые страницы <раздел>.html (common.html, struct.html, ...)");
    process.exit(1);
  }

  const vocab = loadVocab();
  const data = {};
  const skipped = [];
  const outPath = outArg ?? "data/parsed.sveden.json";

  // Каждый раздел — независимая попытка. Сбой одного (сеть, разметка, что угодно)
  // не должен стоить уже собранных остальных 13 — ни разу не даём исключению
  // выйти из тела цикла наружу.
  //
  // hostSuspectedDown: если на каком-то разделе не ответили ни HTTPS, ни HTTP
  // (полный обрыв соединения, не HTTP-статус) — весь хост, скорее всего, лежит
  // целиком. Дальше не тратим полную лестницу повторов (~45с) на каждый из
  // оставшихся разделов, а быстро проверяем каждый по одной короткой попытке.
  let hostSuspectedDown = false;

  for (const key of listSectionKeys()) {
    try {
      const section = vocab[key];
      const { html, reason, connectionLevel } = await fetchHtml(source, key, section.url, hostSuspectedDown);
      if (!html) {
        console.warn(`  ⚠ ${key}: пропущен — ${reason}`);
        skipped.push({ key, reason });
        if (connectionLevel && !hostSuspectedDown) {
          hostSuspectedDown = true;
          console.warn("  ⚠ хост не отвечает ни по HTTPS, ни по HTTP — дальше проверяю разделы в быстром режиме");
        }
        continue;
      }
      const $ = load(html);
      const baseUrl = /^https?:\/\//.test(source) ? new URL(section.url, source).toString() : null;
      data[key] = await parseSection($, section, baseUrl);
    } catch (err) {
      console.warn(`  ⚠ ${key}: пропущен — неожиданная ошибка: ${err.message}`);
      skipped.push({ key, reason: `неожиданная ошибка: ${err.message}` });
    }
  }

  // Пишем результат в любом случае — даже 1 успешный раздел из 14 лучше,
  // чем ничего из-за одного сбойного.
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");

  console.log(`Разобрано разделов: ${Object.keys(data).length}/${listSectionKeys().length} → ${outPath}`);
  if (skipped.length) {
    console.log("Пропущено:");
    for (const { key, reason } of skipped) {
      console.log(`  ${key}: ${reason}`);
    }
  }
}

main().catch((err) => {
  // Сюда мы дойти не должны (см. try/catch в цикле выше) — если всё же дошли,
  // это ошибка до начала разбора (например, битый словарь), а не сайта.
  console.error("Ошибка до начала разбора разделов:", err);
  process.exit(1);
});
