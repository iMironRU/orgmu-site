import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

// Данные приёмной кампании для посадочной «Поступающим» — content/priem.yml.

export type Phone = { label: string; value: string };
export type Stage = { icon: string; label: string; date: string };
export type Track = { key: string; label: string; sub: string; stages: Stage[] };
export type SectionCard = { title: string; desc: string; href: string; badge: string; cta: string };

export type Way = { title: string; desc: string };
export type Member = { role: string; fio: string; position: string };

export type Priem = {
  year: number;
  committee: {
    address: string;
    hours: string;
    secretary: string;
    email: string;
    phones: Phone[];
    gosuslugi: string;
  };
  tracks: Track[];
  sections: SectionCard[];
  international: { contact: string; students: string; countries: string };
  ways: Way[];
  members: Member[];
};

let cache: Priem | null = null;

export function getPriem(): Priem {
  if (!cache) {
    const p = path.join(process.cwd(), "content", "priem.yml");
    cache = parseYaml(fs.readFileSync(p, "utf8")) as Priem;
  }
  return cache;
}
