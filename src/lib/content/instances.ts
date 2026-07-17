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

// Адрес страницы инстанса. Лаунчер собирается дважды: как страницы сайта
// (/app-launcher/buh) и как статика внутренних хостов (buh.app.orgma.ru).
// В первом случае навигация должна вести внутрь сайта, во втором — на хосты,
// иначе меню уводило бы с buh.app.orgma.ru обратно на сайт.
const LINK_BASE = process.env.NEXT_PUBLIC_LINK_BASE || "";
export function instanceHref(id: string): string {
  const i = getInstance(id);
  return LINK_BASE ? `https://${i?.host ?? ""}` : `/app-launcher/${id}`;
}
export function launcherHref(): string {
  return LINK_BASE ? "https://app.orgma.ru" : "/app-launcher";
}

// «1 баз» и «10 баз» — так не пишут. Русские числительные требуют падежа.
function basesLabel(n: number): string {
  const d = n % 10, dd = n % 100;
  if (dd >= 11 && dd <= 14) return `${n} баз`;
  if (d === 1) return `${n} база`;
  if (d >= 2 && d <= 4) return `${n} базы`;
  return `${n} баз`;
}

// Пункты меню приложений: платформа + все инстансы. Один список для лаунчера
// и для страниц инстансов — иначе разъедутся.
export function appNavItems(): { label: string; href: string; note?: string }[] {
  return [
    { label: "Платформа приложений", href: launcherHref(), note: "все приложения" },
    ...getInstanceIds().map((id) => {
      const i = getInstance(id)!;
      return { label: i.name, href: instanceHref(id), note: basesLabel(i.bases.length) };
    }),
  ];
}
