#!/usr/bin/env node
/**
 * Переносит ручные правки из content/i18n/overrides.yml в память переводов.
 *
 *   node scripts/i18n/apply-overrides.mjs
 *
 * Записи получают status:"human" — после этого машинный перевод их не трогает
 * никогда (см. translate.mjs). Так исправленная строка не «отрастает» обратно
 * при следующем прогоне.
 *
 * Запускать после правки overrides.yml. Идемпотентно.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { load as parseYaml } from "js-yaml";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "content", "i18n");
const FILE = path.join(DIR, "overrides.yml");

const normalize = (s) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();
const keyOf = (s) => createHash("sha1").update(normalize(s)).digest("hex").slice(0, 12);

if (!fs.existsSync(FILE)) {
  console.log("Файла правок нет — нечего применять.");
  process.exit(0);
}

const overrides = parseYaml(fs.readFileSync(FILE, "utf8")) ?? {};
const at = new Date().toISOString().slice(0, 10);
let total = 0;

for (const locale of ["en", "kk"]) {
  const memFile = path.join(DIR, `${locale}.json`);
  if (!fs.existsSync(memFile)) continue;
  const mem = JSON.parse(fs.readFileSync(memFile, "utf8"));

  let n = 0;
  for (const [src, variants] of Object.entries(overrides)) {
    const text = variants?.[locale];
    if (typeof text !== "string" || !text.trim()) continue;
    const key = keyOf(src);
    const was = mem[key]?.text;
    mem[key] = { src, text, status: "human", at };
    if (was !== text) {
      console.log(`  [${locale}] ${src}\n        было: ${was ?? "—"}\n        стало: ${text}`);
      n++;
    }
  }

  if (n > 0) {
    const sorted = Object.fromEntries(Object.entries(mem).sort(([a], [b]) => a.localeCompare(b)));
    fs.writeFileSync(memFile, JSON.stringify(sorted, null, 2) + "\n", "utf8");
    console.log(`  [${locale}] обновлено записей: ${n}`);
  }
  total += n;
}

console.log(total ? `\nГотово: ${total} правок применено.` : "Правки уже применены.");
