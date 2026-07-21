// Чистые типы/хелперы «Известий» (без node:fs).

export type NoticeKind = "urgent" | "important" | "info";

export type NoticeItem = {
  id: string;
  kind: NoticeKind;
  title: string;
  text?: string;
  issuedBy?: string;
  until?: string; // ISO ГГГГ-ММ-ДД
  body: string[];
  // Галерея-слайдер: пути к картинкам из public (например
  // /izvestiya/celevoe-obuchenie/01.jpg). Показываются вписанными, не обрезаясь.
  gallery?: string[];
};

// Оформление по виду — совпадает с полосой AnnouncementBar / шаблоном Notice.
export const NOTICE_KIND: Record<NoticeKind, { tag: string; accent: string; bg: string }> = {
  urgent: { tag: "Срочно", accent: "rgb(255,59,48)", bg: "rgba(255,59,48,0.07)" },
  important: { tag: "Важно", accent: "rgb(255,149,0)", bg: "rgba(255,149,0,0.08)" },
  info: { tag: "Объявление", accent: "rgb(50,173,230)", bg: "rgba(50,173,230,0.08)" },
};

export function noticeKindMeta(kind: NoticeKind) {
  return NOTICE_KIND[kind] ?? NOTICE_KIND.info;
}

const MONTHS_LONG = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export function noticeUntilLong(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}
