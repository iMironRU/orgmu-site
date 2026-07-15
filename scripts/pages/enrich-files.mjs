#!/usr/bin/env node
// Собирает размер и дату файлов, на которые ссылаются типовые страницы
// (content/pages/**/*.yml), HEAD-запросами и складывает в
// content/pages/file-meta.json. Без этого карточки документов остались бы
// без даты и размера — а файлы лежат на orgma.ru, их метаданные знает
// только сервер источника.
//
//   node scripts/pages/enrich-files.mjs
//
// Запускать при добавлении новых файлов. Результат коммитится: сборка на
// GitHub Pages не ходит в сеть.
import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

const ROOT = path.join(process.cwd(), "content", "pages");
const OUT = path.join(ROOT, "file-meta.json");
const UA = "Mozilla/5.0 (compatible; orgmu-site/1.0)";

function ymlFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...ymlFiles(p));
    else if (e.name.endsWith(".yml")) out.push(p);
  }
  return out;
}

// Все href из блоков files
const hrefs = new Set();
for (const f of ymlFiles(ROOT)) {
  const page = parseYaml(fs.readFileSync(f, "utf8"));
  for (const b of page?.blocks ?? []) {
    if (b?.type !== "files") continue;
    for (const it of b.items ?? []) {
      const h = it?.href;
      if (h && /^https?:\/\//.test(h) && /\.(pdf|docx?|xlsx?|rtf)(\?|$)/i.test(h)) hrefs.add(h);
    }
  }
}

const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const meta = {};
let hit = 0,
  miss = 0,
  cached = 0;

const list = [...hrefs];
for (let i = 0; i < list.length; i++) {
  const href = list[i];
  if (prev[href]?.size) {
    meta[href] = prev[href];
    cached++;
    continue;
  }
  try {
    // Пробелы и кириллица в путях — кодируем, иначе fetch не примет URL.
    const url = encodeURI(decodeURI(href));
    const r = await fetch(url, { method: "HEAD", headers: { "User-Agent": UA } });
    if (r.ok) {
      const len = r.headers.get("content-length");
      meta[href] = {
        size: len ? Number(len) : null,
        modified: r.headers.get("last-modified"),
      };
      hit++;
    } else {
      meta[href] = { size: null, modified: null, status: r.status };
      miss++;
    }
  } catch {
    meta[href] = { size: null, modified: null, status: 0 };
    miss++;
  }
  if ((i + 1) % 25 === 0) console.log(`  …${i + 1}/${list.length}`);
}

fs.writeFileSync(OUT, JSON.stringify(meta, null, 2) + "\n", "utf8");
console.log(`Файлов: ${list.length} | получено: ${hit} | из кеша: ${cached} | без ответа: ${miss}`);
console.log(`Записано: ${path.relative(process.cwd(), OUT)}`);
