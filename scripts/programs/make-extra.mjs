#!/usr/bin/env node
// Генерация/обновление content/programs/programs-extra.yml — ручные данные по
// образовательным программам, которых нет в парсинге sveden (описание, факультет,
// квалификация, вступительные испытания). Ключ — slug кода программы.
//   node scripts/programs/make-extra.mjs
import fs from "node:fs";
import { load } from "js-yaml";

const OUT = "content/programs/programs-extra.yml";
const d = JSON.parse(fs.readFileSync("content/sveden/sveden.json", "utf8"));
const existing = fs.existsSync(OUT) ? load(fs.readFileSync(OUT, "utf8")) || {} : {};

const text = (v) => (typeof v === "string" ? v.trim() : v && typeof v === "object" && "text" in v ? String(v.text || "").trim() : "");
const slug = (code) => code.trim().replace(/[.\s]+/g, "-").replace(/[^0-9a-zA-Zа-яА-Я-]/g, "");
const isNum = (c, n) => /^\d+$/.test(c) || /^\d+$/.test(n) || /код|шифр|наименование/i.test(c);
const q = (v) => (v ? JSON.stringify(v) : '""');

const accred = (d.education?.groups?.eduAccred || []).filter((a) => {
  const c = text(a.eduCode), n = text(a.eduName);
  return c && n && !isNum(c, n);
});
const seen = new Set();

const lines = [
  "# Ручные данные по образовательным программам (нет в парсинге sveden):",
  "# описание, факультет, квалификация, вступительные испытания.",
  "# Ключ — slug кода. Пустые поля показываются на сайте как «—». Пересборка — по коммиту.",
  "",
];

for (const a of accred) {
  const code = text(a.eduCode);
  const id = slug(code);
  if (seen.has(id)) continue;
  seen.add(id);
  const e = existing[id] || {};
  lines.push(`# ${code} · ${text(a.eduName)}`);
  lines.push(`"${id}":`);
  lines.push(`  faculty: ${q(e.faculty)}        # факультет`);
  lines.push(`  qualification: ${q(e.qualification)}  # присваиваемая квалификация`);
  lines.push(`  description: ${q(e.description)}    # текст «О программе»`);
  lines.push(`  price: ${q(e.price)}          # стоимость 1 курса, руб.`);
  lines.push(`  exams: ${Array.isArray(e.exams) && e.exams.length ? JSON.stringify(e.exams) : "[]"}          # вступительные испытания (список)`);
  lines.push("");
}

fs.mkdirSync("content/programs", { recursive: true });
fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`Скелет на ${seen.size} программ → ${OUT}`);
