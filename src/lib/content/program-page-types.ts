// Данные страницы программы (макет ProgramPage.dc.html) — то, чего нет
// в парсинге sveden. Заполняется вручную: content/programs/pages/<код>.yml,
// шаблон рядом (_TEMPLATE.yml). Чистые типы, без node:fs.

export type Fact = { value: string; label: string };
export type Exam = { subject: string; min: string; prio: string };
export type Score = { year: string; value: string };
export type CostRow = { course: string; price: string };
export type Group = { name: string; note: string; places: string };
export type Count = { form: string; budget: string; paid: string; foreign: string };
export type Vacant = { course: string; budget: string; paid: string };
export type DocYear = { year: string; files: { name: string; href: string; size?: string; date?: string }[] };

export type ProgramPageData = {
  facts: Fact[];
  about?: string;
  career: string[];
  exams: Exam[];
  scores: Score[];
  places?: { budget?: string; target?: string; paid?: string };
  cost: Record<string, CostRow[]>; // год набора → строки по курсам
  groups: Group[];
  counts: Count[];
  vacant: Vacant[];
  docs: DocYear[];
  sign?: { signer?: string; valid?: string };
};

export const DASH = "—";

// Состав документов образовательной программы на каждый год набора (по sveden
// «Образование»). Реальные названия — не выдумка; файлы к ним появляются
// прочерками, пока ответственный не приложит документ.
export const OP_DOC_SET = [
  "Учебный план",
  "Календарный учебный график",
  "Аннотации рабочих программ дисциплин",
  "Рабочие программы дисциплин",
  "Рабочие программы практик",
  "Рабочая программа воспитания",
  "Календарный план воспитательной работы",
  "Методические и иные документы",
];

// Срок обучения из sveden («6 лет», «2 года 10 месяцев», «3 г 0 мес», «6») →
// число когорт, что ещё учатся = округление вверх полного срока. Без числа
// («Нормативный срок обучения») — null, заготовку не строим.
export function termYears(term: string): number | null {
  const t = (term || "").toLowerCase();
  const y = t.match(/(\d+)\s*(?:л|г)/); // «6 лет», «5 л», «3 г», «4 года»
  const years = y ? parseInt(y[1], 10) : /^\s*(\d+)\s*$/.test(t) ? parseInt(t, 10) : null;
  if (years == null || Number.isNaN(years)) return null;
  const m = t.match(/(\d+)\s*мес/);
  const months = m ? parseInt(m[1], 10) : 0;
  return Math.max(1, Math.ceil(years + months / 12));
}

// Заготовка «документы по годам набора»: вкладка на каждую учащуюся когорту
// (от года приёма назад по сроку), внутри — состав документов прочерками.
// Пусто, если срок не распознан.
export function buildDocSkeleton(term: string, intakeYear: number): DocYear[] {
  const n = termYears(term);
  if (!n) return [];
  const out: DocYear[] = [];
  for (let i = 0; i < n; i++) {
    const y = intakeYear - i;
    out.push({
      year: `Набор ${y}/${y + 1}`,
      files: OP_DOC_SET.map((name) => ({ name, href: "" })),
    });
  }
  return out;
}

// Пустая страница — когда файла ещё нет: разделы макета на месте, данные
// прочерками. Ничего не прячем: раздел обязательный, пустота честнее подмены.
export const EMPTY_PROGRAM_PAGE: ProgramPageData = {
  facts: [],
  career: [],
  exams: [],
  scores: [],
  cost: {},
  groups: [],
  counts: [],
  vacant: [],
  docs: [],
};
