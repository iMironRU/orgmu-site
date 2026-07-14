import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import { makeDocItem } from "@/lib/sveden/documents";
import { levelCat, slugCode, type Program, type ProgramDoc } from "@/lib/content/programs-types";

export * from "@/lib/content/programs-types";

type Raw = Record<string, unknown>;
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : v ? [v as T] : []);
const asText = (v: unknown): string =>
  typeof v === "string" ? v.trim() : v && typeof v === "object" && "text" in v ? String((v as Raw).text ?? "").trim() : "";
const hrefOf = (v: unknown): string | undefined =>
  v && typeof v === "object" && "href" in v ? String((v as Raw).href) : undefined;

// Значение поля -> карточка документа (если это ссылка на файл), иначе null.
function toDoc(label: string, value: unknown): ProgramDoc | null {
  const href = hrefOf(value);
  const item = makeDocItem("", asText(value) || label, href);
  if (!item) return null;
  return { label, href: item.href!, fmt: item.fmt, date: item.date, size: item.size };
}

const isNumberingRow = (code: string, name: string) => /^\d+$/.test(code) || /^\d+$/.test(name) || /код|шифр|наименование/i.test(code);

let cache: { list: Program[]; byId: Map<string, Program> } | null = null;

function build() {
  if (cache) return cache;
  const p = path.join(process.cwd(), "content", "sveden", "sveden.json");
  const d = JSON.parse(fs.readFileSync(p, "utf8")) as Raw;
  const edu = (d.education as Raw)?.groups as Raw;
  const vac = ((d.vacant as Raw)?.groups as Raw)?.vacant;

  const extraPath = path.join(process.cwd(), "content", "programs", "programs-extra.yml");
  const extra = fs.existsSync(extraPath)
    ? ((parseYaml(fs.readFileSync(extraPath, "utf8")) as Record<string, Partial<Program>>) ?? {})
    : {};

  // индексы по коду
  const opByCode = new Map<string, Raw>();
  for (const op of arr<Raw>(edu?.eduOp)) {
    const code = asText(op.eduCode);
    if (code && !isNumberingRow(code, asText(op.eduName))) opByCode.set(code, op);
  }
  const gjByCode = new Map<string, Raw>();
  for (const gj of arr<Raw>(edu?.graduateJob)) {
    const code = asText(gj.eduCode);
    if (code && !isNumberingRow(code, asText(gj.eduName))) gjByCode.set(code, gj);
  }
  const vacByCode = new Map<string, Raw>();
  for (const v of arr<Raw>(vac)) {
    const code = asText(v.eduCode);
    if (code && !isNumberingRow(code, asText(v.eduName))) vacByCode.set(code, v);
  }

  const list: Program[] = [];
  for (const a of arr<Raw>(edu?.eduAccred)) {
    const code = asText(a.eduCode);
    const name = asText(a.eduName);
    if (!code || !name || isNumberingRow(code, name)) continue;

    const op = opByCode.get(code);
    const opDocs: ProgramDoc[] = [];
    if (op) {
      const push = (label: string, key: string) => {
        const doc = toDoc(label, op[key]);
        if (doc) opDocs.push(doc);
      };
      push("Описание образовательной программы", "opMain");
      push("Учебный план", "educationPlan");
      push("Рабочие программы дисциплин", "educationRpd");
      push("Календарный учебный график", "educationShedule");
      push("Рабочие программы практик", "eduPr");
      push("Методические документы", "methodology");
    }

    const gj = gjByCode.get(code);
    const v = vacByCode.get(code);
    const e = extra[slugCode(code)] ?? {};

    list.push({
      id: slugCode(code),
      code,
      name,
      profile: asText(a.eduProf),
      level: asText(a.eduLevel),
      levelCat: levelCat(asText(a.eduLevel)),
      form: asText(a.eduForm),
      term: asText(a.learningTerm),
      disciplinesDoc: toDoc("Перечень дисциплин", a.eduPred) ?? undefined,
      practicesDoc: toDoc("Практики", a.eduPrac) ?? undefined,
      opDocs,
      vacant: v
        ? {
            bf: asText(v.numberBFVacant),
            br: asText(v.numberBRVacant),
            bm: asText(v.numberBMVacant),
            paid: asText(v.numberPVacant),
          }
        : undefined,
      graduates: gj ? { total: asText(gj.v1), employed: asText(gj.t1) } : undefined,
      description: e.description,
      faculty: e.faculty,
      qualification: e.qualification,
      exams: e.exams,
      price: e.price,
      kcpBudget: e.kcpBudget,
      kcpTarget: e.kcpTarget,
      kcpPaid: e.kcpPaid,
      score: e.score,
      basis: e.basis,
    });
  }

  const byId = new Map(list.map((x) => [x.id, x]));
  cache = { list, byId };
  return cache;
}

export function getPrograms(): Program[] {
  return build().list;
}
export function getProgram(id: string): Program | undefined {
  return build().byId.get(id);
}
