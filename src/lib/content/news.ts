import fs from "node:fs";
import path from "node:path";

// Форма файла content/news/{item_id}.json — зеркалит выход scripts/scrape/orgma_k2_scrape.py
export type MediaRef = { remote: string; file?: string; sha256?: string };

export type NewsItem = {
  source: {
    system: string;
    item_id: number;
    catid: number;
    url: string;
    hits: number;
  };
  title: string;
  slug: string;
  published_at: string | null;
  modified_at: string | null;
  author: string | null;
  excerpt: string;
  body_html: string;
  cover: MediaRef | null;
  gallery: MediaRef[];
  tags: string[];
  language: string;
};

const NEWS_DIR = path.join(process.cwd(), "content", "news");

function readAll(): NewsItem[] {
  if (!fs.existsSync(NEWS_DIR)) return [];
  const items: NewsItem[] = [];
  for (const name of fs.readdirSync(NEWS_DIR)) {
    if (!name.endsWith(".json") || name.startsWith("_")) continue;
    try {
      items.push(JSON.parse(fs.readFileSync(path.join(NEWS_DIR, name), "utf8")));
    } catch {
      // битый файл не должен ронять сборку всей ленты
    }
  }
  return items;
}

function sortByDateDesc(a: NewsItem, b: NewsItem): number {
  return (b.published_at ?? "").localeCompare(a.published_at ?? "");
}

export function getAllNews(): NewsItem[] {
  return readAll().sort(sortByDateDesc);
}

export function getNewsSlugs(): string[] {
  return readAll().map((n) => n.slug);
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return readAll().find((n) => n.slug === slug);
}

export function getRelatedNews(current: NewsItem, limit = 3): NewsItem[] {
  return getAllNews()
    .filter((n) => n.slug !== current.slug)
    .slice(0, limit);
}

// --- Категории (пока по catid; расширим маппинг позже) ----------------------
export type NewsKind = "event" | "announce" | "congrats" | "science" | "dept";

const KIND_STYLE: Record<NewsKind, { label: string; color: string; bg: string }> = {
  event: { label: "Событие", color: "rgb(0,101,155)", bg: "rgba(184,57,4,0.14)" },
  announce: { label: "Объявление", color: "rgb(30,140,155)", bg: "rgba(48,176,199,0.14)" },
  congrats: { label: "Поздравление", color: "rgb(140,80,180)", bg: "rgba(175,110,220,0.14)" },
  science: { label: "Наука", color: "rgb(30,160,80)", bg: "rgba(52,199,89,0.14)" },
  dept: { label: "Подразделения", color: "rgb(130,100,70)", bg: "rgba(170,136,99,0.16)" },
};

export function newsKind(_item: NewsItem): NewsKind {
  // TODO: настоящий маппинг catid/тегов -> тип. Пока все как «Новость» (event).
  return "event";
}

export function kindStyle(kind: NewsKind) {
  return KIND_STYLE[kind];
}

const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export function formatDateRu(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}
