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
