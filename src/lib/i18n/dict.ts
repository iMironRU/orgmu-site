import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { TargetLocale } from "./config";

// Память переводов: content/i18n/<язык>.json. Ключ — хеш русского оригинала,
// поэтому правка русского текста автоматически «отвязывает» перевод: хеш другой
// → записи нет → показываем оригинал и честно помечаем непереведённым. Иначе
// перевод тихо разошёлся бы с источником, и никто бы не заметил.
//
// status: "machine" — сделано автоматом, показываем плашку;
//         "human"   — вычитано человеком, плашки нет и СКРИПТ НЕ ПЕРЕЗАПИСЫВАЕТ.
export type Entry = {
  src: string;
  text: string;
  status: "machine" | "human";
  at: string;
};

export type Memory = Record<string, Entry>;

// Нормализация перед хешем: невидимые различия (двойные пробелы, перенос строк,
// неразрывный пробел) не должны плодить разные ключи для одной фразы.
export function normalize(s: string): string {
  return s.replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

export function keyOf(src: string): string {
  return createHash("sha1").update(normalize(src)).digest("hex").slice(0, 12);
}

const DIR = path.join(process.cwd(), "content", "i18n");

const cache = new Map<string, Memory>();

export function loadMemory(locale: TargetLocale): Memory {
  const hit = cache.get(locale);
  if (hit) return hit;
  const file = path.join(DIR, `${locale}.json`);
  const mem: Memory = fs.existsSync(file)
    ? (JSON.parse(fs.readFileSync(file, "utf8")) as Memory)
    : {};
  cache.set(locale, mem);
  return mem;
}

export type Translated = { text: string; machine: boolean; missing: boolean };

// Перевод строки. Если перевода нет — возвращаем русский оригинал с missing:true:
// пустое место на странице хуже, чем честная непереведённая строка.
export function translate(src: string, locale: TargetLocale): Translated {
  const clean = normalize(src);
  if (!clean) return { text: src, machine: false, missing: false };
  const e = loadMemory(locale)[keyOf(clean)];
  if (!e) return { text: src, machine: false, missing: true };
  return { text: e.text, machine: e.status === "machine", missing: false };
}
