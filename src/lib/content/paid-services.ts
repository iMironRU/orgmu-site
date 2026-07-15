import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

// Платные услуги: только приказы об утверждении стоимости. Цены не дублируем —
// они приходят из парсинга (Program.price) и из content/programs/pages/<код>.yml.
export type PaidOrder = { name: string; note?: string; href: string; size?: string; date?: string };
export type PaidServicesData = {
  years: string[];
  lead?: string;
  orders: Record<string, PaidOrder[]>;
};

const FILE = path.join(process.cwd(), "content", "platnye-uslugi.yml");

let cache: PaidServicesData | null = null;

export function getPaidServices(): PaidServicesData {
  if (cache) return cache;
  let d: Partial<PaidServicesData> = {};
  if (fs.existsSync(FILE)) {
    try {
      d = (parseYaml(fs.readFileSync(FILE, "utf8")) as Partial<PaidServicesData>) ?? {};
    } catch (e) {
      const msg = e instanceof Error ? e.message.split("\n")[0] : String(e);
      throw new Error(`${FILE}: не разобрался YAML — ${msg}`);
    }
  }
  const orders = d.orders ?? {};
  // Годы не заданы — берём из ключей приказов, чтобы вкладки не пустовали.
  const years = d.years?.length ? d.years : Object.keys(orders).sort().reverse();
  cache = { years, lead: d.lead, orders };
  return cache;
}
