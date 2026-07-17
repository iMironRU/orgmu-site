import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

// Меню сайта хранятся в content/navigation/*.yml — правятся руками без кода.
export type NavLink = { label: string; href: string };
export type NavColumn = { title?: string; items: NavLink[] };
export type NavItem = { label: string; href?: string; columns: NavColumn[] };

export type Footer = {
  org: {
    name: string[];
    address: string[];
    route_href: string;
    contacts: string[];
    copyright: string;
    support: string;
  };
  columns: NavColumn[];
};

export type Audience = "students" | "staff" | "applicants";
export type AppItem = {
  id: string;
  name: string;
  tag: string;
  desc: string;
  cta: string;
  href: string;
  icon: string;
  accent: string;
  audience?: Audience[];
  category?: string;
  platform?: "1c" | "web";
  status?: "active" | "updating" | "legacy";
  auth?: "none" | "account" | "vpn";
  replacedBy?: string;
  featured?: boolean;
  // Только для инстансов 1С: версия платформы и метка. Показываются на
  // лаунчере app.orgma.ru.
  version?: string;
  statusNote?: string;
};

export type Subsite = {
  label: string;
  href: string;
  icon: string;
  accent: string;
};

export type SitemapGroup = { title: string; links: NavLink[] };

// Доп. страницы раздела «Сведения об ОО» — отдельный список под 14 подразделами.
export type SvedenExtra = { title: string; items: NavLink[] };

const NAV_DIR = path.join(process.cwd(), "content", "navigation");

function loadYaml<T>(file: string): T {
  const raw = fs.readFileSync(path.join(NAV_DIR, file), "utf8");
  return parseYaml(raw) as T;
}

// Лаунчер (app.orgma.ru и <инстанс>.app.orgma.ru) собирается тем же кодом и
// тем же layout, что сайт, — иначе дизайн разъедется. Но живёт он на других
// хостах, где нет /rukovodstvo и прочих разделов: там внутренние ссылки меню
// и подвала должны вести на сайт абсолютно. Префикс задаётся при сборке
// лаунчера (NEXT_PUBLIC_LINK_BASE), для сайта пуст.
const LINK_BASE = process.env.NEXT_PUBLIC_LINK_BASE || "";
function abs(href: string): string {
  return LINK_BASE && href.startsWith("/") ? `${LINK_BASE}${href}` : href;
}
function absItems(items: NavLink[]): NavLink[] {
  return items.map((i) => ({ ...i, href: abs(i.href) }));
}

export function getMainMenu(): NavItem[] {
  const menu = loadYaml<NavItem[]>("main.yml");
  if (!LINK_BASE) return menu;
  return menu.map((m) => ({
    ...m,
    href: m.href ? abs(m.href) : m.href,
    columns: m.columns.map((c) => ({ ...c, items: absItems(c.items) })),
  }));
}

export function getFooter(): Footer {
  const f = loadYaml<Footer>("footer.yml");
  if (!LINK_BASE) return f;
  return {
    ...f,
    org: { ...f.org, route_href: abs(f.org.route_href) },
    columns: f.columns.map((c) => ({ ...c, items: absItems(c.items) })),
  };
}

export function getApps(): AppItem[] {
  return loadYaml<AppItem[]>("apps.yml");
}

export function getSubsites(): Subsite[] {
  return loadYaml<Subsite[]>("subsites.yml");
}

export function getSitemapGroups(): SitemapGroup[] {
  return loadYaml<SitemapGroup[]>("sitemap.yml");
}

export function getSvedenExtra(): SvedenExtra {
  return loadYaml<SvedenExtra>("sveden-extra.yml");
}
