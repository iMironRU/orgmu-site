import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { EventItem } from "./events-types";

export * from "./events-types";

const FILE = path.join(process.cwd(), "content", "events.yml");

let cache: EventItem[] | null = null;

// Строку с «двоеточием и пробелом» YAML молча разбирает как объект
// {ключ: значение} — и React потом падает на «Objects are not valid as a React
// child». Восстанавливаем текст, чтобы правка контента не роняла сборку.
function toText(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => (val == null || val === "" ? k : `${k}: ${val}`))
      .join(" ");
  }
  return v == null ? "" : String(v);
}

function load(): EventItem[] {
  if (cache) return cache;
  const raw = fs.existsSync(FILE)
    ? ((parseYaml(fs.readFileSync(FILE, "utf8")) as Partial<EventItem>[]) ?? [])
    : [];
  cache = raw
    .filter((e): e is EventItem => !!e && !!e.slug && !!e.title)
    .map((e) => ({
      slug: e.slug!,
      title: e.title!,
      category: e.category ?? "Конференция",
      date: e.date ?? "",
      time: e.time ?? "",
      place: e.place ?? "",
      address: e.address,
      image: e.image,
      entry: e.entry,
      registerHref: e.registerHref,
      lead: e.lead,
      body: (Array.isArray(e.body) ? e.body : e.body ? [e.body] : []).map(toText).filter(Boolean),
      program: Array.isArray(e.program) ? e.program : [],
      sourceHref: e.sourceHref,
      sourceLabel: e.sourceLabel,
    }))
    // Сортировка по дате по возрастанию (ближайшие сверху).
    .sort((a, b) => a.date.localeCompare(b.date));
  return cache;
}

export function getEvents(): EventItem[] {
  return load();
}

// Разделение афиши на предстоящие/прошедшие. Считается на сборке (сайт
// статический и пересобирается ночью) — иначе рендер сервера и клиента
// разошлись бы и React ругался на гидратацию.
export function splitEvents(): { upcoming: EventItem[]; past: EventItem[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isUpcoming = (e: EventItem) => {
    const d = new Date(`${e.date}T23:59:59`);
    return !Number.isNaN(d.getTime()) && d >= today;
  };
  const all = load();
  return {
    upcoming: all.filter(isUpcoming), // по возрастанию — ближайшие сверху
    past: all.filter((e) => !isUpcoming(e)).reverse(), // по убыванию — свежие сверху
  };
}

export function getEvent(slug: string): EventItem | undefined {
  return load().find((e) => e.slug === slug);
}

export function getAllEventSlugs(): string[] {
  return load().map((e) => e.slug);
}
