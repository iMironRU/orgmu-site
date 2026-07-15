"use client";

import { useState } from "react";
import type { CostRow, DocYear } from "@/lib/content/program-page-types";
import { DocCards } from "@/components/sveden/DocCards";
import type { DocItem } from "@/lib/sveden/documents";
import { encodeFileHref, fileExt } from "@/lib/content/pages-types";

// Вкладки по годам — как в макете ProgramPage: подчёркнутая активная,
// граница снизу по всей полосе.
function TabBar({
  tabs,
  active,
  onPick,
}: {
  tabs: string[];
  active: string;
  onPick: (t: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-y-1 gap-x-[2px] border-b-2 border-line">
      {tabs.map((t) => {
        const on = t === active;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onPick(t)}
            className="shrink-0 font-ui font-bold text-[16px] px-4 py-[10px] bg-none border-none cursor-pointer -mb-[2px] transition-colors"
            style={{
              color: on ? "var(--c-brand)" : "var(--c-steel)",
              borderBottom: `2px solid ${on ? "var(--c-accent)" : "transparent"}`,
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

// Стоимость: вкладка на год набора, внутри — таблица по курсам и итог.
export function CostTabs({ cost }: { cost: Record<string, CostRow[]> }) {
  const years = Object.keys(cost);
  const [year, setYear] = useState(years[0] ?? "");
  const rows = cost[year] ?? [];

  if (years.length === 0) {
    return <p className="m-0 text-[17px] text-ink-3">Стоимость обучения не заполнена.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <TabBar tabs={years} active={year} onPick={setYear} />
      <div className="overflow-x-auto border border-line rounded-xl">
        <table className="w-full border-collapse text-[17px]">
          <thead>
            <tr className="bg-bg-muted">
              <th className="text-left px-[18px] py-[14px] font-bold text-brand border-b-2 border-sky-soft">Курс</th>
              <th className="text-left px-[18px] py-[14px] font-bold text-brand border-b-2 border-sky-soft">Стоимость</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="px-[18px] py-[13px] border-b border-line text-ink">{r.course}</td>
                <td className="px-[18px] py-[13px] border-b border-line text-steel">{r.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Учебные планы и документы: вкладка на год набора, внутри — карточки DocCards
// (единое правило вывода файлов, см. AGENTS.md).
export function DocTabs({ docs }: { docs: DocYear[] }) {
  const [year, setYear] = useState(docs[0]?.year ?? "");
  const cur = docs.find((d) => d.year === year) ?? docs[0];

  if (docs.length === 0) {
    return <p className="m-0 text-[17px] text-ink-3">Учебные планы и документы не заполнены.</p>;
  }

  const items: DocItem[] = (cur?.files ?? []).map((f) => ({
    itemprop: "",
    title: f.name,
    href: f.href && f.href !== "#" ? encodeFileHref(f.href) : undefined,
    fmt: fileExt({ name: f.name, href: f.href }),
    date: f.date ?? "",
    size: f.size ?? "",
    missing: !f.href || f.href === "#",
  }));

  return (
    <div className="flex flex-col gap-4">
      <TabBar tabs={docs.map((d) => d.year)} active={year} onPick={setYear} />
      <DocCards docs={items} />
    </div>
  );
}
