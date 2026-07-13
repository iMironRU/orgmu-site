// Загрузка словаря микроразметки sveden для парсера.
// Источник истины — content/sveden/vocab/*.yaml (тот же словарь, что читает
// TS-рендерер сайта), парсер не копирует его, а читает при каждом запуске.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as yamlLoad } from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VOCAB_DIR = path.resolve(__dirname, "..", "..", "content", "sveden", "vocab");

let cachedVocab = null;

export function loadVocab() {
  if (!cachedVocab) {
    const raw = fs.readFileSync(path.join(VOCAB_DIR, "base.yaml"), "utf8");
    cachedVocab = yamlLoad(raw);
  }
  return cachedVocab;
}

// Ключи подразделов в порядке объявления в base.yaml (14 штук, Табл. 3.1).
export function listSectionKeys() {
  return Object.keys(loadVocab());
}

// Плоский список одиночных полей { key, itemprop, from }.
export function sectionFields(section) {
  return Object.entries(section.fields ?? {}).map(([key, def]) => ({ key, ...def }));
}

// Список групп (повторяющихся блоков) с их полями.
export function sectionGroups(section) {
  return Object.entries(section.groups ?? {}).map(([key, def]) => ({
    key,
    itemprop: def.itemprop,
    from: def.from,
    fields: Object.entries(def.fields ?? {}).map(([fkey, fdef]) => ({ key: fkey, ...fdef })),
  }));
}
