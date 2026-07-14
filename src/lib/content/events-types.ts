// Чистые типы/хелперы мероприятий (без node:fs) — можно импортировать в клиентские
// компоненты (EventsView, EventCard).

export type EventProgramItem = { time: string; title: string; place?: string };

export type EventItem = {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO ГГГГ-ММ-ДД
  time: string;
  place: string;
  address?: string;
  image?: string; // URL или локальный путь из public
  entry?: string; // «Вход свободный», «По регистрации» и т.п.
  registerHref?: string; // ссылка на регистрацию
  lead?: string; // вводный абзац (крупный)
  body: string[]; // абзацы описания
  program: EventProgramItem[]; // пункты программы
};

// Категории и их цвета — из макета EventCard.dc.html.
export const EVENT_CATEGORIES = [
  "Конференция",
  "День открытых дверей",
  "Лекция",
  "Спорт",
  "Концерт",
] as const;

const CATEGORY_COLOR: Record<string, string> = {
  Конференция: "rgb(88,86,214)",
  "День открытых дверей": "rgb(48,176,199)",
  Концерт: "rgb(175,82,222)",
  Спорт: "rgb(52,199,89)",
  Лекция: "rgb(184,57,4)",
};

export function categoryColor(c: string): string {
  return CATEGORY_COLOR[c] ?? "rgb(184,57,4)";
}

const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const MONTHS_LONG = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
const WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];

function parse(iso: string): Date | null {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function eventDay(iso: string): string {
  const d = parse(iso);
  return d ? String(d.getDate()) : "—";
}

export function eventMonth(iso: string): string {
  const d = parse(iso);
  return d ? MONTHS_SHORT[d.getMonth()] : "";
}

export function eventDateLong(iso: string): string {
  const d = parse(iso);
  return d ? `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}` : "";
}

export function eventWeekday(iso: string): string {
  const d = parse(iso);
  return d ? WEEKDAYS[d.getDay()] : "";
}
