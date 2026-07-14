import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { EventItem } from "./events-types";

export * from "./events-types";

const FILE = path.join(process.cwd(), "content", "events.yml");

let cache: EventItem[] | null = null;

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
      body: Array.isArray(e.body) ? e.body : e.body ? [e.body as unknown as string] : [],
      program: Array.isArray(e.program) ? e.program : [],
    }))
    // Сортировка по дате по возрастанию (ближайшие сверху).
    .sort((a, b) => a.date.localeCompare(b.date));
  return cache;
}

export function getEvents(): EventItem[] {
  return load();
}

export function getEvent(slug: string): EventItem | undefined {
  return load().find((e) => e.slug === slug);
}

export function getAllEventSlugs(): string[] {
  return load().map((e) => e.slug);
}
