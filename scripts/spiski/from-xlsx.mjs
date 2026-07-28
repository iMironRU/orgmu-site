#!/usr/bin/env node
/**
 * РАЗОВЫЙ конвертер тестовой выгрузки (xlsx из 1С) в целевой spiski.json —
 * тот самый формат, который в бою будет отдавать 1С напрямую. Нужен только
 * чтобы проверить страницу на реальных данных, пока боевой выгрузки нет.
 *
 * Требует пакет xlsx (npm i -D xlsx) и путь к файлу:
 *   node scripts/spiski/from-xlsx.mjs "<путь к .xlsx>" public/spiski/spiski.json
 *
 * ВАЖНО: результат кладём в public/spiski/, который в .gitignore — реальные
 * коды абитуриентов НЕ должны попасть в публичную git-историю. В бою файл
 * обновляет 1С прямо на сервере, минуя репозиторий.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const XLSX = createRequire(import.meta.url)("xlsx"); // CJS-пакет

const [, , src, out = "public/spiski/spiski.json"] = process.argv;
if (!src) {
  console.error("Укажите путь к xlsx: node scripts/spiski/from-xlsx.mjs <файл.xlsx> [выход.json]");
  process.exit(1);
}

const wb = XLSX.readFile(src);
const ws = wb.Sheets[wb.SheetNames[0]];
const grid = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

// Формат 1С-выгрузки: строка 0 — служебная («Результат1…»), строка 1 — имена
// полей (разнесены по объединённым ячейкам), дальше данные.
const nameRow = grid.findIndex((r) => (r || []).filter((v) => v != null && v !== "").length > 5);
const names = grid[nameRow].map((v) => (v == null ? "" : String(v)));
const idx = {};
names.forEach((n, i) => {
  if (n) idx[n] = i;
});
const rows = grid.slice(nameRow + 1).filter((r) => r && r.some((v) => v != null && v !== ""));

const S = (row, name) => {
  const v = row[idx[name]];
  const s = v == null ? "" : String(v).trim();
  return s === "<Пустая строка>" ? "" : s;
};
const N = (row, name) => {
  const s = S(row, name);
  if (s === "") return null; // пустой балл — это отсутствие, а не Number("")=0
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const B = (row, name) => S(row, name) === "Да";

// Квота — то, что в названии конкурса после программы: «Стоматология.
// Основные места» → «Основные места». Для вкладок внутри программы.
function quotaOf(title, program) {
  let q = title;
  if (program && q.startsWith(program)) q = q.slice(program.length);
  return q.replace(/^[\s.]+|[\s.]+$/g, "") || title;
}

// Группируем по конкурсу, сохраняя порядок строк (в запросе они уже
// ранжированы: УПОРЯДОЧИТЬ ПО КодКонкурса, Номер).
const byComp = new Map();
for (const r of rows) {
  const cid = N(r, "КодКонкурса");
  if (cid == null) continue;
  if (!byComp.has(cid)) {
    const program = S(r, "Специальность");
    const title = S(r, "Конкурс");
    byComp.set(cid, {
      id: cid,
      program,
      title,
      quota: quotaOf(title, program),
      form: S(r, "ФормаОбучения"),
      basis: S(r, "Основа"),
      category: S(r, "Категория"),
      seats: N(r, "КоличествоМест") ?? 0,
      applied: N(r, "ПоданоЗаявлений") ?? 0,
      consents: N(r, "ПоданоСогласий") ?? 0,
      rows: [],
    });
  }
  const subj = [1, 2, 3, 4, 5].map((k) => N(r, `Балл${k}`)).filter((x) => x != null);
  byComp.get(cid).rows.push({
    code: S(r, "Код"),
    n: N(r, "Номер"),
    sum: N(r, "СуммаБаллов"),
    vi: N(r, "БаллыЗаВИ"),
    id: N(r, "БаллыЗаИД"),
    subj,
    pr: N(r, "Приоритет"),
    hp: B(r, "ЭтоВысшийПриоритет") || B(r, "ЭтоОсновнойВысшийПриоритет"),
    cons: B(r, "Согласие"),
    orig: B(r, "Оригинал"),
    pref: B(r, "ПреимущественноеПраво"),
    bvi: B(r, "БВИ"),
  });
}

// updated: в выгрузке нет момента формирования — в БОЮ его проставляет 1С.
// Здесь берём mtime файла как приближение и предупреждаем.
const mtime = fs.statSync(src).mtime.toISOString();
console.warn("! Поле updated взято из времени файла. В боевой выгрузке 1С должна");
console.warn("  проставлять момент формирования сама (см. spiski-types.ts).");

const data = { updated: mtime, competitions: [...byComp.values()] };

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(data));
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`Готово: ${data.competitions.length} конкурсов, ${rows.length} строк → ${out} (${kb} КБ)`);
