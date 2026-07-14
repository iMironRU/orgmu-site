// Чистые типы и хелперы структуры (без node:fs) — можно импортить в клиентские
// компоненты. Загрузчики данных (fs) — в structure.ts.
export type Head = { post: string; fio: string };
export type Unit = {
  id: string;
  num: string;
  name: string;
  type: string;
  depth: number;
  parent: string | null;
  head: Head;
  address: string;
  phone: string;
  email: string;
  site: string;
  doc: { text: string; href: string } | null;
  headPersonId?: string; // проставляется на сервере: id профиля руководителя, если он в педсоставе
};

export const TYPE_META: Record<string, { label: string; color: string; soft: string }> = {
  org: { label: "Орган управления", color: "rgb(0,101,155)", soft: "rgba(0,101,155,0.10)" },
  faculty: { label: "Факультет", color: "rgb(184,57,4)", soft: "rgba(184,57,4,0.12)" },
  institute: { label: "Институт", color: "rgb(48,176,199)", soft: "rgba(48,176,199,0.12)" },
  college: { label: "Колледж", color: "rgb(48,176,199)", soft: "rgba(48,176,199,0.12)" },
  kafedra: { label: "Кафедра", color: "rgb(50,100,150)", soft: "rgb(245,248,251)" },
  upravlenie: { label: "Управление", color: "rgb(170,136,99)", soft: "rgba(170,136,99,0.12)" },
  dekanat: { label: "Деканат", color: "rgb(184,57,4)", soft: "rgba(184,57,4,0.10)" },
  podrazdelenie: { label: "Подразделение", color: "rgb(50,100,150)", soft: "rgb(245,248,251)" },
};

export function typeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META.podrazdelenie;
}

export function initials(fio: string): string {
  return fio
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  "rgb(0,101,155)", "rgb(184,57,4)", "rgb(48,176,199)", "rgb(88,86,214)",
  "rgb(170,136,99)", "rgb(50,100,150)", "rgb(30,160,80)",
];
export function avatarColor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
