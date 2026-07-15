// Типовая страница (макет PageTemplate.dc.html) — контент описывается блоками
// в yml, поэтому любую статичную страницу можно собрать без правки кода.
// Чистые типы (без node:fs) — можно импортировать в клиентские компоненты.

export type FileRef = { name: string; href: string; ext?: string; size?: string };
export type FaqItem = { q: string; a: string };

// Поле формы. Сайт статический — отправлять некуда, поэтому форма верстается
// по макету, но кнопка отправки отключена (см. блок form.note).
export type FormField = {
  label: string;
  kind: "text" | "email" | "tel" | "textarea" | "select" | "checkbox";
  options?: string[]; // для select
  required?: boolean;
  hint?: string;
};

export type Block =
  | { type: "text"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "files"; items: FileRef[] }
  | { type: "faq"; items: FaqItem[] }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "tabs"; items: { label: string; items: string[] }[] }
  | {
      type: "form";
      fields: FormField[];
      submitLabel?: string;
      note?: string;
      noteLink?: { label: string; href: string };
    };

export type HelpCard = { title?: string; text?: string; linkLabel?: string; href?: string };

export type ContentPageData = {
  slug: string;
  title: string;
  lead?: string;
  breadcrumb?: { label: string; href: string }; // раздел между «Главная» и страницей
  group?: string; // подзаголовок-группа на витрине раздела (например, аудитория)
  order?: number; // порядок внутри группы
  help?: HelpCard;
  // Оглавление. По умолчанию — «В разделе» без номеров (макет PageTemplate).
  // numbered: true — вариант служебных страниц (макеты NOK/Zakupki и др.):
  // «Содержание», нумерация и подсветка текущего раздела при скролле.
  toc?: { title?: string; numbered?: boolean };
  blocks: Block[];
};

// Расширение файла для плашки: из href, если не задано явно.
export function fileExt(f: FileRef): string {
  if (f.ext) return f.ext.toUpperCase();
  const m = decodeURIComponent(f.href).match(/\.([a-z0-9]+)(?:$|[?#])/i);
  const e = m?.[1]?.toLowerCase();
  return e ? e.toUpperCase() : "—";
}

// Якорь для заголовка второго уровня — по нему строится навигация «В разделе».
export function anchorId(text: string, i: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${i}` : `razdel-${i}`;
}
