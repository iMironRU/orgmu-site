import fs from "node:fs";
import path from "node:path";
import { getSection, sectionFields } from "@/lib/sveden/vocab";
import { sectionData, renderText, hrefOf, isMissing } from "@/lib/sveden/data";

// Построение сгруппированного списка документов подраздела «Документы» под макет
// Documents.dc.html. Размер и дата берутся из content/sveden/doc-meta.json
// (заполняется scripts/sveden/enrich-docs.mjs). Признак ЭЦП недоступен (orgma
// не публикует .sig) — не показываем.

export type DocItem = {
  itemprop: string;
  title: string;
  href?: string;
  fmt: string; // PDF | DOC | XLSX | ...
  date: string; // ДД.ММ.ГГГГ
  size: string; // «2,4 МБ»
  missing: boolean; // значение «отсутствует»/текст без файла
};
export type DocGroup = { title: string; docs: DocItem[] };

// Категории и порядок — названия из макета Documents.dc.html.
const CATEGORIES: { title: string; keys: string[] }[] = [
  { title: "Учредительные документы", keys: ["ustavDocLink"] },
  {
    title: "Локальные нормативные акты",
    keys: ["priemDocLink", "modeDocLink", "tekKontrolDocLink", "perevodDocLink", "vozDocLink"],
  },
  {
    title: "Правила распорядка и коллективный договор",
    keys: ["localActOrder", "localActStud", "localActCollec"],
  },
  { title: "Отчётность и государственный контроль", keys: ["reportEduDocLink", "prescriptionDocLink"] },
];

type Meta = Record<string, { size: number | null; modified: string | null }>;
let metaCache: Meta | null = null;
function loadMeta(): Meta {
  if (!metaCache) {
    const p = path.join(process.cwd(), "content", "sveden", "doc-meta.json");
    metaCache = fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as Meta) : {};
  }
  return metaCache;
}

function formatBytes(n: number | null | undefined): string {
  if (!n) return "";
  const mb = n / 1048576;
  if (mb >= 1) return `${mb.toFixed(1).replace(".", ",")} МБ`;
  return `${Math.max(1, Math.round(n / 1024))} КБ`;
}

const MONTHS_FROM_ISO = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
};

function docDate(href: string | undefined, modified: string | null | undefined): string {
  if (href) {
    const m = decodeURIComponent(href).match(/(\d{2})[._-](\d{2})[._-](20\d{2})/);
    if (m) {
      const day = +m[1];
      const mon = +m[2];
      if (day >= 1 && day <= 31 && mon >= 1 && mon <= 12) return `${m[1]}.${m[2]}.${m[3]}`;
    }
  }
  return modified ? MONTHS_FROM_ISO(modified) : "";
}

function fmtOf(href: string | undefined): string {
  if (!href) return "";
  const ext = decodeURIComponent(href).match(/\.([a-z0-9]+)(?:$|[?#])/i)?.[1]?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (ext === "doc" || ext === "docx") return "DOC";
  if (ext === "xls" || ext === "xlsx") return "XLSX";
  return ext ? ext.toUpperCase() : "DOC";
}

export function getDocumentGroups(): DocGroup[] {
  const section = getSection("document");
  if (!section) return [];
  const data = sectionData("document");
  const meta = loadMeta();
  const byKey = new Map(sectionFields(section).map((f) => [f.key, f]));

  const groups: DocGroup[] = [];
  for (const cat of CATEGORIES) {
    const docs: DocItem[] = [];
    for (const key of cat.keys) {
      const f = byKey.get(key);
      if (!f) continue;
      const value = data.fields?.[key];
      const href = hrefOf(value);
      const title = renderText(value);
      const m = href ? meta[href] : undefined;
      docs.push({
        itemprop: f.itemprop,
        title,
        href: href ? (href.startsWith("http") ? href : `https://www.orgma.ru${href}`) : undefined,
        fmt: fmtOf(href),
        date: docDate(href, m?.modified),
        size: formatBytes(m?.size),
        missing: isMissing(value) || !href,
      });
    }
    if (docs.length) groups.push({ title: cat.title, docs });
  }
  return groups;
}
