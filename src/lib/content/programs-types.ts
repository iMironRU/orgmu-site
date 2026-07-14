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
  price?: string; // стоимость 1 курса, ₽
  kcpBudget?: string; // мест приёма: бюджет
  kcpTarget?: string; // мест приёма: целевое
  kcpPaid?: string; // мест приёма: договор
  score?: string; // проходной балл прошлого года
  basis?: string; // основа обучения: budget | paid | both
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

export const LEVEL_COLOR: Record<string, string> = {
  spo: "rgb(48,176,199)",
  bak: "rgb(184,57,4)",
  spec: "rgb(0,101,155)",
  mag: "rgb(88,86,214)",
  ord: "rgb(175,82,222)",
  asp: "rgb(170,136,99)",
  other: "rgb(50,100,150)",
};
export function levelColor(key: string): string {
  return LEVEL_COLOR[key] ?? LEVEL_COLOR.other;
}

export function slugCode(code: string): string {
  return code.trim().replace(/[.\s]+/g, "-").replace(/[^0-9a-zA-Zа-яА-Я-]/g, "");
}
