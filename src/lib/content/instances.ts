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

// Блок «Настройка рабочего места» — общий для всех инстансов, правится там же.
export type SetupStep = { title: string; text: string; action?: "client" | "v8i" };
export type Setup = { title: string; lead: string; steps: SetupStep[]; note?: string };

const FILE = path.join(process.cwd(), "content", "apps", "instances.json");

type File = { setup: Setup; instances: Record<string, Instance> };
let cache: File | null = null;
function load(): File {
  if (!cache) cache = JSON.parse(fs.readFileSync(FILE, "utf8")) as File;
  return cache;
}

export function getSetup(): Setup {
  return load().setup;
}

export function getInstances(): Record<string, Instance> {
  return load().instances;
}
export function getInstance(id: string): Instance | undefined {
  return load().instances[id];
}
export function getInstanceIds(): string[] {
  return Object.keys(load().instances);
}
