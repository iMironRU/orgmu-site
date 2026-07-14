import fs from "node:fs";
import path from "node:path";
import type { Unit } from "@/lib/content/structure-types";

// Оргструктура ОрГМУ. Источник — content/structure/units.json (парсер
// scripts/structure/parse.mjs со страницы orgma.ru/sveden/struct).
export * from "@/lib/content/structure-types";

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
