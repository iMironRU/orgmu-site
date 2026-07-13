import fs from "node:fs";
import path from "node:path";

// Данные sveden в «sveden-форме» (зеркалит vocab/base.yaml):
//   { [раздел]: { fields: {...}, groups: { [группа]: [...] | {...} | null } } }
// Значение поля — строка или { text, href } (ссылка на документ/сайт/почту).

export type LinkValue = { text: string; href?: string };
export type FieldValue = string | LinkValue | null | undefined;
export type SectionData = {
  fields?: Record<string, FieldValue>;
  groups?: Record<string, Record<string, FieldValue>[] | Record<string, FieldValue> | null>;
};
export type SvedenData = Record<string, SectionData>;

const DATA_FILE = path.join(process.cwd(), "content", "sveden", "sveden.json");

let cached: SvedenData | null = null;

export function loadSvedenData(): SvedenData {
  if (!cached) {
    cached = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as SvedenData;
  }
  return cached;
}

export function sectionData(key: string): SectionData {
  return loadSvedenData()[key] ?? { fields: {}, groups: {} };
}

export const MISSING_VALUE = "отсутствует";

export function renderText(value: FieldValue): string {
  if (value == null) return MISSING_VALUE;
  if (typeof value === "string") return value.trim() || MISSING_VALUE;
  if (typeof value === "object" && "text" in value) return (value.text ?? "").trim() || MISSING_VALUE;
  return String(value);
}

export function hrefOf(value: FieldValue): string | undefined {
  return value && typeof value === "object" ? value.href : undefined;
}

export function isMissing(value: FieldValue): boolean {
  return renderText(value) === MISSING_VALUE;
}
