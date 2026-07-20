import fs from "node:fs";
import path from "node:path";
import { slugify, type Person } from "@/lib/content/persons-types";

export * from "@/lib/content/persons-types";

// Персоны ОрГМУ из sveden: педсостав (employees.teachingStaff) и руководство
// (managers + проректоры из структуры). Профили — по макету StaffMember.
type Raw = Record<string, unknown>;

function readJson<T>(rel: string): T {
  const p = path.join(process.cwd(), rel);
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

const arr = <T>(v: T | T[] | null | undefined): T[] =>
  Array.isArray(v) ? v : v ? [v] : [];

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const clean = (s: string): string => (s && s !== "отсутствует" && s !== "—" ? s : "");

function splitList(s: string, re: RegExp, limit = 8): string[] {
  return s
    .split(re)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, limit);
}

// Повышение квалификации и профпереподготовка на orgma лежат одной строкой без
// единого формата: у кого-то записи разделены переводом строки, у кого-то «;»,
// у кого-то нумерацией «1. … 2. …», а у большинства — ничем, кроме даты в конце
// каждой записи. Одной «свалкой буковок» это и выглядело. Режем по самому
// надёжному признаку из присутствующих, сверху вниз; дата (числовая или
// словесная) — последний рубеж, т.к. каждая запись кончается датой выдачи
// документа. Одна функция на оба поля — формат у них одинаковый.
const MONTH = "(?:январ|феврал|март|апрел|ма[йяое]|июн|июл|август|сентябр|октябр|ноябр|декабр)[а-я]*";
const DATE_END = new RegExp(`\\d{1,2}\\.\\d{2}\\.\\d{4}\\s*г?\\.?|\\d{1,2}\\s+${MONTH}\\s+\\d{4}\\s*г?[од.]*`, "g");
const NUM_MARK = /(?<!\d)\d{1,2}[.)]\s+(?=[А-ЯЁ"«])/g;
const trimItem = (s: string): string => s.replace(/^[\s;.]+|[\s;.]+$/g, "");

function splitCredentials(raw: string): string[] {
  const s = raw.trim();
  if (!s) return [];
  let parts: string[];
  if (s.includes("\n")) {
    parts = s.split("\n");
  } else if ((s.match(NUM_MARK) ?? []).length >= 2) {
    const idx = [...s.matchAll(NUM_MARK)].map((m) => m.index!);
    idx.push(s.length);
    parts = idx.slice(0, -1).map((from, i) => s.slice(from, idx[i + 1]).replace(/^\s*\d{1,2}[.)]\s*/, ""));
  } else if ((s.match(/;/g) ?? []).length >= 2) {
    parts = s.split(";");
  } else {
    parts = [];
    let last = 0;
    for (const m of s.matchAll(DATE_END)) {
      parts.push(s.slice(last, m.index! + m[0].length));
      last = m.index! + m[0].length;
    }
    const tail = s.slice(last);
    if (trimItem(tail)) parts.push(tail);
    if (parts.length === 0) parts = [s];
  }
  return parts.map(trimItem).filter(Boolean).slice(0, 20);
}

// Объединяет списки нескольких записей одного человека в один без повторов.
// Ключ дедупа — нижний регистр (в источнике «Микробиология»/«микробиология» —
// одно и то же); показываем первую встретившуюся форму записи.
function mergeUnique(lists: string[][], limit: number): string[] {
  const seen = new Map<string, string>();
  for (const list of lists) {
    for (const raw of list) {
      const label = raw.trim();
      if (!label) continue;
      const key = label.toLowerCase();
      if (!seen.has(key)) seen.set(key, label);
    }
  }
  return [...seen.values()].slice(0, limit);
}

function experience(raw: string): string {
  const n = parseInt(raw, 10);
  if (!n) return "";
  const mod10 = n % 10;
  const mod100 = n % 100;
  let unit = "лет";
  if (mod10 === 1 && mod100 !== 11) unit = "год";
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) unit = "года";
  return `${n} ${unit}`;
}

let cache: { teachers: Person[]; leaders: Person[]; byId: Map<string, Person> } | null = null;

function build() {
  if (cache) return cache;
  const sveden = readJson<Raw>("content/sveden/sveden.json");
  const units = readJson<{ head: { post: string; fio: string }; name: string; phone: string; email: string }[]>(
    "content/structure/units.json",
  );

  const employees = sveden.employees as Raw;
  const teachersRaw = arr<Raw>((employees?.groups as Raw)?.teachingStaff as Raw[]);

  const usedIds = new Set<string>();
  const mkId = (fio: string) => {
    const base = slugify(fio) || "person";
    let id = base;
    let i = 2;
    while (usedIds.has(id)) id = `${base}-${i++}`;
    usedIds.add(id);
    return id;
  };

  // Один преподаватель в выгрузке orgma встречается несколькими записями (по
  // кафедрам/должностям) — до 6 раз на человека, 173 записи против 137 людей.
  // Объединяем по ФИО. Списки (дисциплины, образование, ПК, ПП) — объединением
  // без повторов; должность у дублей всегда совпадает; степень — самая короткая
  // непустая (у части приписаны коды специальностей — на плитке они лишние,
  // фильтр по «доктор/кандидат» работает и так); стаж — максимальный.
  const groups = new Map<string, Raw[]>();
  for (const t of teachersRaw) {
    const fio = str(t.fio);
    if (!fio) continue;
    (groups.get(fio) ?? groups.set(fio, []).get(fio)!).push(t);
  }

  const teachers: Person[] = [...groups.entries()].map(([fio, recs]) => {
    const firstNonEmpty = (f: (r: Raw) => string) => recs.map(f).find(Boolean) ?? "";
    const shortestNonEmpty = (f: (r: Raw) => string) =>
      recs.map((r) => clean(f(r))).filter(Boolean).sort((a, b) => a.length - b.length)[0] ?? "";
    const maxYears = Math.max(0, ...recs.map((r) => parseInt(str(r.specExperience), 10) || 0));
    return {
      id: mkId(fio),
      fio,
      position: firstNonEmpty((r) => str(r.post)),
      degree: shortestNonEmpty((r) => str(r.degree)),
      academStat: shortestNonEmpty((r) => str(r.academStat)),
      disciplines: mergeUnique(recs.map((r) => splitList(str(r.teachingDiscipline), /[;,]/, 16)), 40),
      // Ступени образования разделены «;» — по одной в строку, а не сплошняком.
      education: mergeUnique(recs.map((r) => splitList(clean(str(r.teachingLevel)), /;/, 6)), 12),
      qualifications: mergeUnique(recs.map((r) => splitCredentials(str(r.qualification))), 30),
      profDevelopment: mergeUnique(recs.map((r) => splitCredentials(str(r.profDevelopment))), 20),
      experience: experience(String(maxYears)),
      dept: "",
      phone: "",
      email: "",
      isLead: false,
      leadRole: "",
    };
  });

  // Руководство: ректор/проректоры из managers + структуры.
  const mGroups = (sveden.managers as Raw)?.groups as Raw | undefined;
  const managers = [
    ...arr<Raw>(mGroups?.rucovodstvo as Raw),
    ...arr<Raw>(mGroups?.rucovodstvoZam as Raw),
  ];

  const leaders: Person[] = [];
  const leaderSlugs = new Set<string>();
  const addLeader = (fio: string, post: string, phone = "", email = "", dept = "") => {
    const slug = slugify(fio);
    if (!fio || leaderSlugs.has(slug)) return;
    leaderSlugs.add(slug);
    leaders.push({
      id: mkId(fio),
      fio,
      position: post,
      degree: "",
      academStat: "",
      disciplines: [],
      education: [],
      qualifications: [],
      profDevelopment: [],
      experience: "",
      dept,
      phone,
      email,
      isLead: true,
      leadRole: post.replace(/,\s*$/, ""),
    });
  };

  for (const m of managers) {
    addLeader(str(m.fio), str(m.post), str(typeof m.telephone === "string" ? m.telephone : ""), str(m.email));
  }
  // из структуры: проректоры/ректор (ФИО берём как последние 3 слова — очищаем от степеней)
  for (const u of units) {
    const post = u.head?.post || "";
    if (!/^(проректор|ректор|президент)/i.test(post)) continue;
    const words = (u.head.fio || "").split(/\s+/).filter(Boolean);
    const fio = words.length > 3 ? words.slice(-3).join(" ") : u.head.fio;
    addLeader(fio, post, u.phone || "", u.email || "", u.name || "");
  }

  const byId = new Map<string, Person>();
  for (const p of [...teachers, ...leaders]) byId.set(p.id, p);

  cache = { teachers, leaders, byId };
  return cache;
}

export function getTeachers(): Person[] {
  return build().teachers;
}
export function getLeaders(): Person[] {
  return build().leaders;
}
export function getPerson(id: string): Person | undefined {
  return build().byId.get(id);
}

// Профиль преподавателя по ФИО (для связи «заведующий из структуры» → профиль).
export function getPersonIdByFio(fio: string): string | undefined {
  const slug = slugify(fio);
  if (!slug) return undefined;
  for (const p of build().teachers) if (slugify(p.fio) === slug) return p.id;
  return undefined;
}
export function getAllPersonIds(): string[] {
  return [...build().byId.keys()];
}

