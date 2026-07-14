#!/usr/bin/env node
// Обогащение документов sveden: для каждой ссылки на файл в content/sveden/sveden.json
// делаем HEAD-запрос к orgma.ru и сохраняем размер (content-length) и дату
// (last-modified) в content/sveden/doc-meta.json = { [href]: { size, modified } }.
//   node scripts/sveden/enrich-docs.mjs
import fs from "node:fs";

const BASE = "https://www.orgma.ru";
const DATA = "content/sveden/sveden.json";
const OUT = "content/sveden/doc-meta.json";
const FILE_RE = /\.(pdf|docx?|xlsx?|rtf|odt|ods|zip|rar)$/i;

// Собираем все href из значений-ссылок ({text, href}) рекурсивно.
function collectHrefs(node, acc) {
  if (Array.isArray(node)) {
    for (const x of node) collectHrefs(x, acc);
  } else if (node && typeof node === "object") {
    if (typeof node.href === "string") acc.add(node.href);
    for (const v of Object.values(node)) collectHrefs(v, acc);
  }
  return acc;
}

function absUrl(href) {
  if (/^https?:\/\//i.test(href)) return href;
  return BASE + (href.startsWith("/") ? href : "/" + href);
}

async function head(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if (!res.ok) return null;
    return {
      size: Number(res.headers.get("content-length")) || null,
      modified: res.headers.get("last-modified") || null,
      type: res.headers.get("content-type") || null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const data = JSON.parse(fs.readFileSync(DATA, "utf8"));
const set = collectHrefs(data, new Set());
// плюс «положения о подразделении» из структуры
try {
  const units = JSON.parse(fs.readFileSync("content/structure/units.json", "utf8"));
  for (const u of units) if (u.doc?.href) set.add(u.doc.href);
} catch {
  /* структуры может не быть */
}
const hrefs = [...set].filter((h) => FILE_RE.test(h) || h.includes("/sveden/"));

const meta = {};
let ok = 0;
for (const href of hrefs) {
  const info = await head(absUrl(href));
  if (info && (info.size || info.modified)) {
    meta[href] = { size: info.size, modified: info.modified };
    ok++;
    console.log(`  ✓ ${href}  ${info.size ?? "?"}b  ${info.modified ?? ""}`);
  } else {
    console.log(`  · ${href}  (нет данных)`);
  }
}

fs.writeFileSync(OUT, JSON.stringify(meta, null, 2) + "\n", "utf8");
console.log(`\nОбогащено ${ok}/${hrefs.length} → ${OUT}`);
