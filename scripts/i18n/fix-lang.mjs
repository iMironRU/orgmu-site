#!/usr/bin/env node
/**
 * Проставляет правильный lang в собранных страницах переводов.
 *
 *   node scripts/i18n/fix-lang.mjs        # после npm run build
 *
 * Зачем отдельным шагом. В App Router тег <html> задаёт КОРНЕВОЙ layout, а он
 * один на весь сайт и про язык страницы не знает: сегмент [lang] лежит глубже.
 * Идиоматическое решение — группы маршрутов со своими корневыми layout, но это
 * означает перенести все 29 существующих маршрутов в app/(ru)/ ради одного
 * атрибута. При статическом экспорте каждая страница — отдельный HTML-файл,
 * поэтому проще и безопаснее поправить готовый вывод.
 *
 * Атрибут важен не косметически: по нему скринридер выбирает произношение, а
 * браузер решает, предлагать ли перевод страницы.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const LOCALES = ["en", "kk"];

if (!fs.existsSync(OUT)) {
  console.error("Нет каталога out/ — сначала соберите сайт.");
  process.exit(1);
}

let patched = 0;

function walk(dir, locale) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, locale);
    else if (e.name.endsWith(".html")) {
      const html = fs.readFileSync(p, "utf8");
      const next = html.replace(/<html([^>]*?)lang="ru"/, `<html$1lang="${locale}"`);
      if (next !== html) {
        fs.writeFileSync(p, next, "utf8");
        patched++;
      }
    }
  }
}

for (const locale of LOCALES) {
  const dir = path.join(OUT, locale);
  if (fs.existsSync(dir)) walk(dir, locale);
}

console.log(`lang проставлен: ${patched} страниц`);
