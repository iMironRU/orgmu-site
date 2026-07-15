import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { ProgramPageData } from "./program-page-types";
import { EMPTY_PROGRAM_PAGE } from "./program-page-types";

export * from "./program-page-types";

const DIR = path.join(process.cwd(), "content", "programs", "pages");

const cache = new Map<string, ProgramPageData>();

// Данные страницы программы по коду («31.05.01»). Файла нет — отдаём пустую
// заготовку: страница соберётся с прочерками, а не упадёт.
export function getProgramPage(code: string): ProgramPageData {
  const hit = cache.get(code);
  if (hit) return hit;
  const file = path.join(DIR, `${code}.yml`);
  let data: Partial<ProgramPageData> = {};
  if (fs.existsSync(file)) {
    try {
      data = (parseYaml(fs.readFileSync(file, "utf8")) as Partial<ProgramPageData>) ?? {};
    } catch (e) {
      const msg = e instanceof Error ? e.message.split("\n")[0] : String(e);
      throw new Error(`${file}: не разобрался YAML — ${msg}`);
    }
  }
  const page: ProgramPageData = {
    ...EMPTY_PROGRAM_PAGE,
    ...data,
    facts: data.facts ?? [],
    career: data.career ?? [],
    exams: data.exams ?? [],
    scores: data.scores ?? [],
    cost: data.cost ?? {},
    groups: data.groups ?? [],
    counts: data.counts ?? [],
    vacant: data.vacant ?? [],
    docs: data.docs ?? [],
  };
  cache.set(code, page);
  return page;
}
