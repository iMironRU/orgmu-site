#!/usr/bin/env npx tsx
/**
 * Выгружает в content/i18n/data-strings.json переводимые строки из данных,
 * которые лежат не в yml, а собираются кодом: оргструктура и персоны.
 *
 *   npx tsx scripts/i18n/export-strings.ts
 *
 * Зачем отдельный шаг. Скрипт перевода (translate.mjs) читает файлы контента
 * напрямую, но персоны собираются из sveden.json нетривиально: списки курсов
 * разрезаются, руководители склеиваются по ФИО, дубли объединяются. Повторять
 * этот разбор в скрипте — значит завести вторую реализацию, которая разойдётся
 * с первой. Поэтому строки берутся у тех же загрузчиков, что и сайт.
 *
 * Чего здесь НЕТ и почему:
 *   • ФИО — их не переводят, а транслитерируют (см. lib/i18n/translit.ts);
 *     машина превращает фамилии в слова («Кузнецов» → «Smith»);
 *   • телефоны, почта, адреса сайтов — не текст;
 *   • названия документов рядом со ссылкой на файл — файл остаётся русским.
 */
import fs from "node:fs";
import path from "node:path";
import { getUnits } from "../../src/lib/content/structure";
import { getTeachers, getLeaders } from "../../src/lib/content/persons";

const OUT = path.join(process.cwd(), "content", "i18n", "data-strings.json");

const strings = new Set<string>();
const add = (s?: string | null) => {
  const v = (s ?? "").trim();
  // Двух знаков достаточно, чтобы отсечь «—» и пустые заготовки; кириллица
  // обязательна — латиницу и числа переводить нечего.
  if (v.length >= 2 && /[А-Яа-яЁё]/.test(v)) strings.add(v);
};

for (const u of getUnits()) {
  add(u.name);
  add(u.address);
  add(u.head?.post);
}

for (const p of [...getTeachers(), ...getLeaders()]) {
  add(p.position);
  add(p.degree);
  add(p.academStat);
  add(p.leadRole);
  add(p.experience);
  add(p.dept);
  p.disciplines?.forEach(add);
  p.education?.forEach(add);
  p.qualifications?.forEach(add);
  p.profDevelopment?.forEach(add);
}

// Сортируем — иначе каждый прогон давал бы шумный diff.
const list = [...strings].sort((a, b) => a.localeCompare(b, "ru"));
fs.writeFileSync(OUT, JSON.stringify(list, null, 2) + "\n", "utf8");

const chars = list.join("").length;
console.log(`data-strings.json: ${list.length} строк, ${chars.toLocaleString("ru")} знаков`);
