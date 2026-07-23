import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { Unit } from "@/lib/content/structure-types";

// Оргструктура ОрГМУ. Источник — content/structure/units.json (парсер
// scripts/structure/parse.mjs со страницы orgma.ru/sveden/struct).
export * from "@/lib/content/structure-types";

// Ручное дополнение (content/structure/units-extra.yml) — данные, которых нет
// в парсинге: год основания, число сотрудников/докторов, описание, направления.
export type UnitExtra = {
  founded?: string;
  staff?: string;
  doctors?: string;
  description?: string;
  directions?: string[];
  employees?: string[]; // ФИО сотрудников; карточки подтягиваются по имени
  teaching?: string[]; // учебная работа: дисциплины/направления подготовки
  schedule?: { label: string; href: string }[]; // расписание: ссылки/файлы
  // У части подразделений есть собственный раздел на сайте (перенесённый
  // сайт-спутник): НИЦ — /nic. Ссылка выносится наверх карточки, иначе раздел
  // из структуры не найти.
  section?: { label: string; href: string; note?: string };
};

let extraCache: Record<string, UnitExtra> | null = null;
export function getUnitExtra(id: string): UnitExtra {
  if (!extraCache) {
    const p = path.join(process.cwd(), "content", "structure", "units-extra.yml");
    extraCache = fs.existsSync(p)
      ? ((parseYaml(fs.readFileSync(p, "utf8")) as Record<string, UnitExtra>) ?? {})
      : {};
  }
  return extraCache[id] ?? {};
}

const FILE = path.join(process.cwd(), "content", "structure", "units.json");
let cache: Unit[] | null = null;

// На orgma.ru названия набирали кто как: 49 кафедр записаны со строчной
// («кафедра анатомии человека»), а четыре точно таких же — с прописной
// («Кафедра госпитальной хирургии»). В списке это читается как небрежность,
// поэтому первую букву поднимаем при чтении — один раз на весь сайт, а не в
// каждом месте вывода. Само название не трогаем: регистр — это оформление,
// а не данные.
function capitalize(name: string): string {
  return name ? name[0].toLocaleUpperCase("ru") + name.slice(1) : name;
}

export function getUnits(): Unit[] {
  if (!cache) {
    const raw = fs.existsSync(FILE) ? (JSON.parse(fs.readFileSync(FILE, "utf8")) as Unit[]) : [];
    cache = raw.map((u) => ({ ...u, name: capitalize(u.name) }));
  }
  return cache;
}

export function getUnit(id: string): Unit | undefined {
  return getUnits().find((u) => u.id === id);
}

export function getChildren(id: string): Unit[] {
  const u = getUnit(id);
  if (!u) return [];
  return getUnits().filter((x) => x.parent === u.num);
}
