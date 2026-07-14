import fs from "node:fs";
import path from "node:path";
import type { NewsItem } from "@/lib/content/news-types";

// Загрузчики новостей (fs). Чистые типы/хелперы — в news-types.ts.
export * from "@/lib/content/news-types";

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
