import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { ContentPageData } from "./pages-types";

export * from "./pages-types";

// Типовые страницы: content/pages/<группа>/<slug>.yml
const ROOT = path.join(process.cwd(), "content", "pages");

const cache = new Map<string, ContentPageData[]>();

function loadGroup(group: string): ContentPageData[] {
  const hit = cache.get(group);
  if (hit) return hit;
  const dir = path.join(ROOT, group);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".yml")) : [];
  const pages = files
    .map((f) => {
      const data = parseYaml(fs.readFileSync(path.join(dir, f), "utf8")) as ContentPageData;
      return { ...data, slug: data?.slug ?? f.replace(/\.yml$/, ""), blocks: data?.blocks ?? [] };
    })
    .filter((p) => !!p.title);
  cache.set(group, pages);
  return pages;
}

export function getPages(group: string): ContentPageData[] {
  return loadGroup(group);
}

export function getPage(group: string, slug: string): ContentPageData | undefined {
  return loadGroup(group).find((p) => p.slug === slug);
}

export function getPageSlugs(group: string): string[] {
  return loadGroup(group).map((p) => p.slug);
}
