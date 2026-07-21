import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { NoticeItem } from "./notices-types";

export * from "./notices-types";

const FILE = path.join(process.cwd(), "content", "announcements.yml");

let cache: NoticeItem[] | null = null;

function loadAll(): NoticeItem[] {
  if (cache) return cache;
  const raw = fs.existsSync(FILE)
    ? ((parseYaml(fs.readFileSync(FILE, "utf8")) as Partial<NoticeItem>[]) ?? [])
    : [];
  cache = raw
    .filter((n): n is NoticeItem => !!n && !!n.id && !!n.title)
    .map((n) => ({
      id: n.id!,
      kind: n.kind ?? "info",
      title: n.title!,
      text: n.text,
      issuedBy: n.issuedBy,
      date: n.date,
      until: n.until,
      body: Array.isArray(n.body) ? n.body : n.body ? [n.body as unknown as string] : [],
      gallery: Array.isArray(n.gallery) ? n.gallery : [],
    }));
  return cache;
}

// Не истёкшие на момент сборки, отсортированы по дате публикации — свежие
// сверху (и на полосе главной, и в списке /izvestiya). Известия без даты
// уходят в конец, сохраняя порядок файла.
export function getActiveNotices(): NoticeItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const active = loadAll().filter((n) => {
    if (!n.until) return true;
    const end = new Date(`${n.until}T23:59:59`);
    return !Number.isNaN(end.getTime()) && end >= today;
  });
  const ts = (iso?: string) => {
    const t = iso ? Date.parse(iso) : NaN;
    return Number.isNaN(t) ? -Infinity : t;
  };
  return active
    .map((n, i) => ({ n, i }))
    .sort((a, b) => ts(b.n.date) - ts(a.n.date) || a.i - b.i)
    .map((x) => x.n);
}

export function getNotice(id: string): NoticeItem | undefined {
  return loadAll().find((n) => n.id === id);
}

// Все id (включая истёкшие) — страницы-известия остаются доступны по прямой ссылке.
export function getAllNoticeIds(): string[] {
  return loadAll().map((n) => n.id);
}
