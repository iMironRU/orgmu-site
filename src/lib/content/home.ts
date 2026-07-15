import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { BannerData } from "@/components/Banner";
import type { Announcement } from "@/components/AnnouncementBar";
import { asset } from "@/lib/asset";
import { getActiveNotices, getAllNoticeIds } from "@/lib/content/notices";
import { getAllEventSlugs } from "@/lib/content/events";
import { getNewsSlugs } from "@/lib/content/news";

const dir = (f: string) => path.join(process.cwd(), "content", f);
function readYaml<T>(file: string, fallback: T): T {
  const p = dir(file);
  return fs.existsSync(p) ? ((parseYaml(fs.readFileSync(p, "utf8")) as T) ?? fallback) : fallback;
}

// Ссылка из yml на карточку коллекции легко «протухает»: событие убрали или
// переименовали slug — статический экспорт этого не замечает и 404 всплывает
// уже на проде. Ловим на сборке.
function assertCollectionHref(href: string | undefined, where: string) {
  const m = href?.match(/^\/(meropriyatiya|novosti|izvestiya)\/([^/?#]+)\/?$/);
  if (!m) return;
  const [, section, slug] = m;
  const known =
    section === "meropriyatiya"
      ? getAllEventSlugs()
      : section === "izvestiya"
        ? getAllNoticeIds()
        : getNewsSlugs();
  if (!known.includes(slug)) {
    throw new Error(
      `${where}: ссылка «${href}» ведёт в никуда — в разделе «${section}» нет «${slug}». ` +
        `Поправьте ссылку или добавьте запись в content/.`,
    );
  }
}

export function getBanners(): BannerData[] {
  const banners = readYaml<BannerData[]>("banners.yml", []);
  for (const b of banners) assertCollectionHref(b.href, `content/banners.yml («${b.title}»)`);
  return banners;
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
