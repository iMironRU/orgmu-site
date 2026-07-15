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

export function getUnits(): Unit[] {
  if (!cache) {
    cache = fs.existsSync(FILE) ? (JSON.parse(fs.readFileSync(FILE, "utf8")) as Unit[]) : [];
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
