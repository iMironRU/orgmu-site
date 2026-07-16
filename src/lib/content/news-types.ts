// Чистые типы/хелперы новостей (без node:fs) — для клиентских компонентов.
export type MediaRef = { remote: string; file?: string; sha256?: string };

export type NewsItem = {
  source: { system: string; item_id: number; catid: number; url: string; hits: number };
  title: string;
  slug: string;
  published_at: string | null;
  modified_at: string | null;
  author: string | null;
  excerpt: string;
  body_html: string;
  cover: MediaRef | null;
  gallery: MediaRef[];
  tags: string[];
  language: string;
};

// Новость для КАРТОЧКИ в списке — только то, что карточка показывает.
// Полный NewsItem тащит body_html (полный текст статьи, ~53% веса) и галерею
// (~19%): списку они не нужны, а в разметку страницы уезжали все 102 статьи
// целиком. Отдаём срез.
export type NewsCardItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  published_at: string | null;
  cover: MediaRef | null;
};

export function toCardItem(n: NewsItem): NewsCardItem {
  return {
    id: n.source.item_id,
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    published_at: n.published_at,
    cover: n.cover,
  };
}

export type NewsKind = "event" | "announce" | "congrats" | "science" | "dept";

const KIND_STYLE: Record<NewsKind, { label: string; color: string; bg: string }> = {
  event: { label: "Событие", color: "rgb(0,101,155)", bg: "rgba(184,57,4,0.14)" },
  announce: { label: "Объявление", color: "rgb(30,140,155)", bg: "rgba(48,176,199,0.14)" },
  congrats: { label: "Поздравление", color: "rgb(140,80,180)", bg: "rgba(175,110,220,0.14)" },
  science: { label: "Наука", color: "rgb(30,160,80)", bg: "rgba(52,199,89,0.14)" },
  dept: { label: "Подразделения", color: "rgb(130,100,70)", bg: "rgba(170,136,99,0.16)" },
};

export function newsKind(_item: NewsCardItem | NewsItem): NewsKind {
  // TODO: настоящий маппинг catid/тегов -> тип. Пока все как «Событие».
  return "event";
}

export function kindStyle(kind: NewsKind) {
  return KIND_STYLE[kind];
}

const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export function formatDateRu(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}
