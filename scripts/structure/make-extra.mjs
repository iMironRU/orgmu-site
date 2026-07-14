#!/usr/bin/env node
// Генерация/обновление content/structure/units-extra.yml — ручное дополнение к
// оргструктуре (данные, которых нет в парсинге orgma.ru: год основания, число
// сотрудников/докторов, описание, направления). Скелет по всем подразделениям;
// уже заполненные значения сохраняются при повторном запуске.
//   node scripts/structure/make-extra.mjs
import fs from "node:fs";
import { load } from "js-yaml";

const UNITS = "content/structure/units.json";
const OUT = "content/structure/units-extra.yml";

const units = JSON.parse(fs.readFileSync(UNITS, "utf8"));
const existing = fs.existsSync(OUT) ? load(fs.readFileSync(OUT, "utf8")) || {} : {};

const q = (v) => (v ? JSON.stringify(v) : '""');

const lines = [
  "# Ручное дополнение к оргструктуре — данные, которых нет в парсинге",
  "# orgma.ru/sveden/struct (год основания, число сотрудников/докторов, описание,",
  "# направления). Ключ — id подразделения (см. content/structure/units.json).",
  "# Заполняйте поля; пустые показываются на сайте как «—». Пересборка — по коммиту.",
  "",
];

for (const u of units) {
  const e = existing[u.id] || {};
  lines.push(`# ${u.name}`);
  lines.push(`"${u.id}":`);
  lines.push(`  founded: ${q(e.founded)}       # год основания`);
  lines.push(`  staff: ${q(e.staff)}          # число сотрудников / преподавателей`);
  lines.push(`  doctors: ${q(e.doctors)}        # докторов наук`);
  lines.push(`  description: ${q(e.description)}  # текст «О подразделении»`);
  lines.push(
    `  directions: ${Array.isArray(e.directions) && e.directions.length ? JSON.stringify(e.directions) : "[]"}  # направления работы (список)`,
  );
  lines.push("");
}

fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`Скелет на ${units.length} подразделений → ${OUT}`);
