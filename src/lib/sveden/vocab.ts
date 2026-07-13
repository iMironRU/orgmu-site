import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

// Словарь микроразметки sveden (Приказ Рособрнадзора № 1493). Источник истины —
// content/sveden/vocab/base.yaml; тот же файл читает парсер scripts/sveden.
// Рендерер и парсер пишут/читают в одну «sveden-форму» без промежуточного перевода.

export type FieldDef = { key: string; itemprop: string; from?: string };
export type GroupDef = {
  key: string;
  itemprop: string;
  from?: string;
  fields: FieldDef[];
};
export type SectionDef = {
  url: string;
  a11y?: string;
  status?: string;
  source?: string;
  fields?: Record<string, { itemprop: string; from?: string }>;
  groups?: Record<
    string,
    { itemprop: string; from?: string; fields?: Record<string, { itemprop: string; from?: string }> }
  >;
};
export type Vocab = Record<string, SectionDef>;

const VOCAB_DIR = path.join(process.cwd(), "content", "sveden", "vocab");

let cached: Vocab | null = null;

export function loadVocab(): Vocab {
  if (!cached) {
    const raw = fs.readFileSync(path.join(VOCAB_DIR, "base.yaml"), "utf8");
    cached = parseYaml(raw) as Vocab;
  }
  return cached;
}

// Ключи 14 подразделов в порядке объявления (Табл. 3.1).
export function listSectionKeys(): string[] {
  return Object.keys(loadVocab());
}

export function getSection(key: string): SectionDef | undefined {
  return loadVocab()[key];
}

export function sectionFields(section: SectionDef): FieldDef[] {
  return Object.entries(section.fields ?? {}).map(([key, def]) => ({ key, ...def }));
}

export function sectionGroups(section: SectionDef): GroupDef[] {
  return Object.entries(section.groups ?? {}).map(([key, def]) => ({
    key,
    itemprop: def.itemprop,
    from: def.from,
    fields: Object.entries(def.fields ?? {}).map(([fkey, fdef]) => ({ key: fkey, ...fdef })),
  }));
}
