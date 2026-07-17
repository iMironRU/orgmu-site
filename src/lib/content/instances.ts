import fs from "node:fs";
import path from "node:path";

// Инстансы 1С для страниц <инстанс>.app.orgma.ru. Данные правятся в
// content/apps/instances.json — там же лежит эталон, собранный с самих
// инстансов (коды баз, ссылки, версии).
export type Base = { name: string; code: string; href: string; desc?: string };
export type Instance = {
  host: string;
  name: string;
  category: string;
  version: string;
  statusNote: string;
  bases: Base[];
  install: { x86?: string; x64?: string; v8i?: string };
};

const FILE = path.join(process.cwd(), "content", "apps", "instances.json");

let cache: Record<string, Instance> | null = null;
function load(): Record<string, Instance> {
  if (!cache) {
    cache = (JSON.parse(fs.readFileSync(FILE, "utf8")) as { instances: Record<string, Instance> }).instances;
  }
  return cache;
}

export function getInstances(): Record<string, Instance> {
  return load();
}
export function getInstance(id: string): Instance | undefined {
  return load()[id];
}
export function getInstanceIds(): string[] {
  return Object.keys(load());
}
