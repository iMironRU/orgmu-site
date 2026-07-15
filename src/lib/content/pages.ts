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
      const file = path.join(dir, f);
      let data: ContentPageData;
      try {
        data = parseYaml(fs.readFileSync(file, "utf8")) as ContentPageData;
      } catch (e) {
        // Иначе одна кривая строка роняет рендер всех страниц группы, а в логе —
        // невнятное «prerendering error» на посторонней странице.
        // Частая причина: «двоеточие с пробелом» в незакавыченном тексте.
        const msg = e instanceof Error ? e.message.split("\n")[0] : String(e);
        throw new Error(`${file}: не разобрался YAML — ${msg}`);
      }
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
