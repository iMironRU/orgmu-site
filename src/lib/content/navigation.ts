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

export type AppItem = {
  name: string;
  tag: string;
  desc: string;
  cta: string;
  href: string;
  icon: string;
  accent: string;
};

export type Subsite = {
  label: string;
  href: string;
  icon: string;
  accent: string;
};

export type SitemapGroup = { title: string; links: NavLink[] };

const NAV_DIR = path.join(process.cwd(), "content", "navigation");

function loadYaml<T>(file: string): T {
  const raw = fs.readFileSync(path.join(NAV_DIR, file), "utf8");
  return parseYaml(raw) as T;
}

export function getMainMenu(): NavItem[] {
  return loadYaml<NavItem[]>("main.yml");
}

export function getFooter(): Footer {
  return loadYaml<Footer>("footer.yml");
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
