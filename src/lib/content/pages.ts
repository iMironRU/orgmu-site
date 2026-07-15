import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { ContentPageData } from "./pages-types";

export * from "./pages-types";

// Типовые страницы: content/pages/<группа>/<slug>.yml
const ROOT = path.join(process.cwd(), "content", "pages");
const META_FILE = path.join(ROOT, "file-meta.json");

const cache = new Map<string, ContentPageData[]>();

// Размер и дата файлов, собранные scripts/pages/enrich-files.mjs с сервера
// источника (файлы лежат на orgma.ru). Ключ — href как в yml.
type FileMeta = Record<string, { size: number | null; modified: string | null; status?: number }>;
let metaCache: FileMeta | null = null;
function fileMeta(): FileMeta {
  if (!metaCache) {
    metaCache = fs.existsSync(META_FILE)
      ? (JSON.parse(fs.readFileSync(META_FILE, "utf8")) as FileMeta)
      : {};
  }
  return metaCache;
}

function formatBytes(n: number | null | undefined): string {
  if (!n) return "";
  const mb = n / 1048576;
  return mb >= 1 ? `${mb.toFixed(1).replace(".", ",")} МБ` : `${Math.max(1, Math.round(n / 1024))} КБ`;
}

function formatDate(v: string | null | undefined): string {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

// Проставляем size/date в карточки документов из собранных метаданных.
function withMeta(page: ContentPageData): ContentPageData {
  const meta = fileMeta();
  return {
    ...page,
    blocks: (page.blocks ?? []).map((b) =>
      b.type === "files"
        ? {
            ...b,
            items: b.items.map((it) => {
              const m = meta[it.href];
              return {
                ...it,
                size: it.size ?? formatBytes(m?.size),
                date: it.date ?? formatDate(m?.modified),
              };
            }),
          }
        : b,
    ),
  };
}

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
      return withMeta({ ...data, slug: data?.slug ?? f.replace(/\.yml$/, ""), blocks: data?.blocks ?? [] });
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
