"use client";

import { useEffect, useRef, useState } from "react";
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
  // Одна строка, никогда не переносим (две строки путают). Не влезло по ширине
  // — не показываем полосу прокрутки, а даём кнопки-стрелки по краям; они
  // появляются только когда есть куда листать.
  const ref = useRef<HTMLDivElement>(null);
  const [ov, setOv] = useState({ l: false, r: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setOv({
        l: el.scrollLeft > 2,
        r: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      });
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [tabs]);

  const nudge = (dx: number) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex flex-nowrap gap-x-[2px] overflow-x-auto border-b-2 border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t) => {
          const on = t === active;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onPick(t)}
              className="shrink-0 whitespace-nowrap font-ui font-bold text-[16px] px-4 py-[10px] bg-none border-none cursor-pointer -mb-[2px] transition-colors"
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

      {ov.l && <ScrollArrow dir="left" onClick={() => nudge(-220)} />}
      {ov.r && <ScrollArrow dir="right" onClick={() => nudge(220)} />}
    </div>
  );
}

// Кнопка-стрелка прокрутки вкладок. Плашка с белым градиентом, чтобы вкладки
// не обрывались резко под кнопкой; сама кнопка кликабельна, градиент — нет.
function ScrollArrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  const left = dir === "left";
  return (
    <div
      className={`pointer-events-none absolute top-0 bottom-[2px] flex items-center ${
        left ? "left-0 pr-8 bg-gradient-to-r" : "right-0 pl-8 bg-gradient-to-l"
      } from-white via-white to-transparent`}
    >
      <button
        type="button"
        aria-label={left ? "Прокрутить вкладки влево" : "Прокрутить вкладки вправо"}
        onClick={onClick}
        className="pointer-events-auto w-8 h-8 flex items-center justify-center rounded-full bg-white border border-line-strong text-brand shadow-[0_1px_6px_rgba(0,0,0,0.14)] hover:bg-bg-muted cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d={left ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
        </svg>
      </button>
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
