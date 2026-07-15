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

  const teachers: Person[] = teachersRaw.map((t) => {
    const fio = str(t.fio);
    return {
      id: mkId(fio),
      fio,
      position: str(t.post),
      degree: clean(str(t.degree)),
      academStat: clean(str(t.academStat)),
      disciplines: splitList(str(t.teachingDiscipline), /[;,]/, 16),
      education: clean(str(t.teachingLevel)),
      qualifications: splitList(str(t.qualification), /\n/, 10),
      profDevelopment: clean(str(t.profDevelopment)),
      experience: experience(str(t.specExperience)),
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
      education: "",
      qualifications: [],
      profDevelopment: "",
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

