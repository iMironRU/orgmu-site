// Чистые типы/хелперы образовательных программ (без node:fs) — для клиента.
export type ProgramDoc = { label: string; href: string; fmt: string; date: string; size: string };

export type Program = {
  id: string; // slug кода (31-05-01)
  code: string; // 31.05.01
  name: string;
  profile: string;
  level: string; // исходный текст уровня
  levelCat: string; // категория для фильтра
  form: string;
  term: string;
  disciplinesDoc?: ProgramDoc; // перечень дисциплин
  practicesDoc?: ProgramDoc; // практики
  opDocs: ProgramDoc[]; // документы ОП (план, РПД, график, методические...)
  vacant?: { bf: string; br: string; bm: string; paid: string };
  graduates?: { total: string; employed: string };
  // из файла-заготовки (ручное):
  description?: string;
  faculty?: string;
  qualification?: string;
  exams?: string[];
};

export const LEVEL_CATS: { key: string; label: string; re: RegExp }[] = [
  { key: "spo", label: "СПО", re: /среднее профессиональное/i },
  { key: "bak", label: "Бакалавриат", re: /бакалавриат/i },
  { key: "spec", label: "Специалитет", re: /специалитет/i },
  { key: "mag", label: "Магистратура", re: /магистратура/i },
  { key: "ord", label: "Ординатура", re: /ординатура/i },
  { key: "asp", label: "Аспирантура", re: /аспирантура/i },
];

export function levelCat(level: string): string {
  for (const c of LEVEL_CATS) if (c.re.test(level)) return c.key;
  return "other";
}

export function levelLabel(key: string): string {
  return LEVEL_CATS.find((c) => c.key === key)?.label ?? "Программа";
}

export function slugCode(code: string): string {
  return code.trim().replace(/[.\s]+/g, "-").replace(/[^0-9a-zA-Zа-яА-Я-]/g, "");
}
