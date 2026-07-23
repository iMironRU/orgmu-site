import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

// Верхний контактный блок страницы «Контакты» — content/kontakty.yml.
export type ContactIcon = "pin" | "clock" | "phone" | "mail";
export type ContactLine = { icon: ContactIcon; label: string; value: string };

const FILE = path.join(process.cwd(), "content", "kontakty.yml");
let cache: ContactLine[] | null = null;

export function getContactLines(): ContactLine[] {
  if (!cache) {
    const raw = fs.existsSync(FILE)
      ? ((parseYaml(fs.readFileSync(FILE, "utf8")) as { contacts?: ContactLine[] })?.contacts ?? [])
      : [];
    // Незаполненные строки (часы работы, пока их не сообщили) не показываем:
    // подпись без значения выглядит как поломка, а не как «уточняется».
    cache = raw.filter((c) => (c.value ?? "").trim() !== "");
  }
  return cache;
}
