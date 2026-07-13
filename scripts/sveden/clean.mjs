#!/usr/bin/env node
// Пост-обработка content/sveden/sveden.json: раскодирование Joomla-обфускации
// email (антиспам-скрипт K2 попадает в текст поля) и нормализация пробелов.
//   node scripts/sveden/clean.mjs [файл]
import fs from "node:fs";

const file = process.argv[2] || "content/sveden/sveden.json";

const decodeEnt = (t) => t.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

// Из cloak-скрипта Joomla собираем настоящий email:
//   addyN = '<user>' + '@'; addyN = addyN + '<domain>' + '.' + '<tld>';
function decloakEmail(s) {
  const user = s.match(/addy\d+\s*=\s*'([^']*)'\s*\+\s*'(?:&#64;|@)'/);
  const dom = s.match(
    /addy\d+\s*=\s*addy\d+\s*\+\s*'([^']*)'\s*\+\s*'(?:&#46;|\.)'\s*\+\s*'([^']*)'/,
  );
  if (user && dom) {
    return `${decodeEnt(user[1])}@${decodeEnt(dom[1])}.${decodeEnt(dom[2])}`;
  }
  return null;
}

function cleanString(s) {
  if (typeof s !== "string") return s;
  if (/Этот адрес электронной почты защищен/.test(s) || /document\.getElementById\('cloak/.test(s)) {
    const email = decloakEmail(s);
    return email || "отсутствует";
  }
  // обрезаем случайные js-хвосты и схлопываем пробелы (переносы строк сохраняем)
  let out = s.split("//<!--")[0];
  out = out.replace(/[ \t]+/g, " ").replace(/[ \t]*\n[ \t]*/g, "\n").trim();
  return out;
}

function walk(node) {
  if (typeof node === "string") return cleanString(node);
  if (Array.isArray(node)) return node.map(walk);
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = walk(v);
    return out;
  }
  return node;
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));
fs.writeFileSync(file, JSON.stringify(walk(data), null, 2) + "\n", "utf8");
console.log(`Очищено: ${file}`);
