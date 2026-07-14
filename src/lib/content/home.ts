import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { BannerData } from "@/components/Banner";
import type { Announcement } from "@/components/AnnouncementBar";
import { asset } from "@/lib/asset";
import { getActiveNotices } from "@/lib/content/notices";

const dir = (f: string) => path.join(process.cwd(), "content", f);
function readYaml<T>(file: string, fallback: T): T {
  const p = dir(file);
  return fs.existsSync(p) ? ((parseYaml(fs.readFileSync(p, "utf8")) as T) ?? fallback) : fallback;
}

export function getBanners(): BannerData[] {
  return readYaml<BannerData[]>("banners.yml", []);
}

// Полоса «Известий» на главной: активные уведомления, каждое ведёт на свою
// страницу-известие /izvestiya/<id> (basePath добавляем через asset — это <a>).
export function getAnnouncements(): Announcement[] {
  return getActiveNotices().map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    text: n.text,
    until: n.until,
    href: asset(`/izvestiya/${n.id}`),
  }));
}
