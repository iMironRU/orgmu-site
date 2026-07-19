// Чистые типы и хелперы персон (без node:fs) — для клиентских компонентов.
export type Person = {
  id: string;
  fio: string;
  position: string;
  degree: string; // учёная степень («» если нет)
  academStat: string; // учёное звание
  disciplines: string[];
  education: string[]; // ступени образования (специалитет, аспирантура…) — по одной
  qualifications: string[]; // повышение квалификации (список курсов)
  profDevelopment: string[]; // профессиональная переподготовка (список дипломов)
  experience: string; // стаж по специальности («21 год»)
  dept: string;
  phone: string;
  email: string;
  isLead: boolean;
  leadRole: string;
};

// Персона для ПЛИТКИ в каталоге — только то, что плитка показывает и по чему
// фильтруют. Полный Person тащит education, qualifications, profDevelopment
// и dept: в списке они не выводятся, а в разметку уезжали у всех 178 персон.
export type PersonCardItem = Omit<Person, "education" | "qualifications" | "profDevelopment" | "dept">;

export function toPersonCard(p: Person): PersonCardItem {
  const { education: _e, qualifications: _q, profDevelopment: _pd, dept: _d, ...rest } = p;
  return rest;
}

// Категории должностей для фильтра.
export const POSITION_CATS: { key: string; label: string }[] = [
  { key: "заведующ", label: "Заведующий кафедрой" },
  { key: "профессор", label: "Профессор" },
  { key: "доцент", label: "Доцент" },
  { key: "старший преподават", label: "Старший преподаватель" },
  { key: "ассистент", label: "Ассистент" },
  { key: "преподават", label: "Преподаватель" },
];

export function positionCat(position: string): string | null {
  const p = position.toLowerCase();
  for (const c of POSITION_CATS) if (p.includes(c.key)) return c.key;
  return null;
}

export const DEGREE_CATS: { key: string; label: string }[] = [
  { key: "доктор", label: "Доктор наук" },
  { key: "кандидат", label: "Кандидат наук" },
];

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

// Транслитерация ФИО в slug для URL.
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};
export function slugify(fio: string): string {
  return fio
    .toLowerCase()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : /[a-z0-9]/.test(ch) ? ch : "-"))
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
