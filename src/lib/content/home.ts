import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { BannerData } from "@/components/Banner";
import type { Announcement } from "@/components/AnnouncementBar";

const dir = (f: string) => path.join(process.cwd(), "content", f);
function readYaml<T>(file: string, fallback: T): T {
  const p = dir(file);
  return fs.existsSync(p) ? ((parseYaml(fs.readFileSync(p, "utf8")) as T) ?? fallback) : fallback;
}

export function getBanners(): BannerData[] {
  return readYaml<BannerData[]>("banners.yml", []);
}

// Объявления: показываем только те, у которых срок (until) не истёк на момент сборки.
export function getAnnouncements(): Announcement[] {
  const items = readYaml<Announcement[]>("announcements.yml", []);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return items.filter((a) => {
    if (!a.until) return true;
    const end = new Date(`${a.until}T23:59:59`);
    return !Number.isNaN(end.getTime()) && end >= today;
  });
}
