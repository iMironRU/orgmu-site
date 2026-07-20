import { getPages } from "@/lib/content/pages";

// Раздел НИЦ (научно-исследовательский центр). Страницы лежат обычной группой
// типовых страниц — content/pages/nic/, собираются scripts/nic/scrape_nic.py.
// Здесь только порядок и навигация: своего рендерера у раздела нет.
export const NIC_GROUP = "nic";

// Порядок как на прежнем сайте: сначала о центре, потом практическое.
const ORDER = [
  "o-nas",
  "punkty-zabora",
  "analizy-i-ceny",
  "podgotovka-k-analizam",
  "pacientam",
  "organizaciyam",
];

// Короткие подписи под пунктом меню — чтобы список читался, а не был
// «шесть ссылок подряд».
const NOTES: Record<string, string> = {
  "o-nas": "структура и лаборатории",
  "punkty-zabora": "адреса и режим работы",
  "analizy-i-ceny": "перечень исследований",
  "podgotovka-k-analizam": "как готовиться",
  pacientam: "порядок обращения",
  organizaciyam: "договоры и документы",
};

// На сайте раздел живёт по /nic. При сборке под собственный домен
// (nic.orgma.ru) он становится корнем: NIC_ROOT=1 — тогда ссылки внутри
// раздела root-relative и работают на своём хосте, а меню и подвал уходят на
// основной сайт через LINK_BASE. См. scripts/apps/build-launcher.mjs.
const LINK_BASE = process.env.NEXT_PUBLIC_LINK_BASE || "";
const NIC_ROOT = process.env.NEXT_PUBLIC_NIC_ROOT === "1";

export function nicPages() {
  const pages = getPages(NIC_GROUP);
  const rank = (slug: string) => {
    const i = ORDER.indexOf(slug);
    return i === -1 ? ORDER.length : i;
  };
  return [...pages].sort((a, b) => rank(a.slug) - rank(b.slug));
}

export function nicHref(slug?: string): string {
  if (NIC_ROOT) return slug ? `/${slug}/` : "/";
  const path = slug ? `/nic/${slug}` : "/nic";
  return LINK_BASE ? `${LINK_BASE}${path}` : path;
}

export function nicNavItems() {
  return nicPages().map((p) => ({
    label: p.title,
    href: nicHref(p.slug),
    note: NOTES[p.slug] ?? "",
  }));
}
