"use client";

import { useMemo, useState } from "react";
import type { Program } from "@/lib/content/programs-types";
import { LEVEL_CATS, levelColor } from "@/lib/content/programs-types";
import type { PaidOrder } from "@/lib/content/paid-services";
import { FilterSelect } from "@/components/FilterSelect";
import { DocCards } from "@/components/sveden/DocCards";
import type { DocItem } from "@/lib/sveden/documents";
import { encodeFileHref, fileExt } from "@/lib/content/pages-types";

const DASH = "—";

// Раздел 1 макета: платные программы с фильтрами и сортировкой.
// Фильтры — кастомным FilterSelect, как в макете, а не нативным <select>.
export function PaidPrograms({ programs }: { programs: Program[] }) {
  const [level, setLevel] = useState<string[]>([]);
  const [faculty, setFaculty] = useState<string[]>([]);
  const [sort, setSort] = useState<"none" | "price-asc" | "price-desc">("none");

  const levels = LEVEL_CATS.filter((c) => programs.some((p) => p.levelCat === c.key));
  const faculties = useMemo(
    () => [...new Set(programs.map((p) => p.faculty).filter(Boolean) as string[])].sort(),
    [programs],
  );

  const num = (p: Program) => Number((p.price ?? "").replace(/[^\d]/g, "")) || 0;

  const list = useMemo(() => {
    let r = programs.filter(
      (p) =>
        (level.length === 0 || level.includes(p.levelCat)) &&
        (faculty.length === 0 || (p.faculty ? faculty.includes(p.faculty) : false)),
    );
    if (sort !== "none") r = [...r].sort((a, b) => (sort === "price-asc" ? num(a) - num(b) : num(b) - num(a)));
    return r;
  }, [programs, level, faculty, sort]);

  const SortBtn = ({ k, label }: { k: typeof sort; label: string }) => {
    const on = sort === k;
    return (
      <button
        type="button"
        onClick={() => setSort(on ? "none" : k)}
        className="text-[15px] font-medium rounded-full px-[15px] py-[7px] border cursor-pointer transition-colors"
        style={{
          color: on ? "#fff" : "var(--c-steel)",
          background: on ? "var(--c-brand)" : "#fff",
          borderColor: on ? "var(--c-brand)" : "var(--c-line-strong)",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-line rounded-2xl p-[18px] flex flex-wrap gap-3 items-end">
        <label className="flex-[1_1_200px] min-w-[170px] flex flex-col gap-[6px]">
          <span className="font-bold text-[14px] text-ink-2">Уровень</span>
          <FilterSelect
            multi
            value={level}
            onChange={setLevel}
            searchable={false}
            placeholder="Любой"
            options={levels.map((c) => ({ value: c.key, label: c.label }))}
          />
        </label>
        <label className="flex-[1_1_220px] min-w-[180px] flex flex-col gap-[6px]">
          <span className="font-bold text-[14px] text-ink-2">Факультет</span>
          <FilterSelect multi value={faculty} onChange={setFaculty} placeholder="Любой" options={faculties} />
        </label>
        <div className="flex gap-2 flex-wrap">
          <SortBtn k="price-asc" label="Сначала дешевле" />
          <SortBtn k="price-desc" label="Сначала дороже" />
        </div>
      </div>

      <div className="text-[16px] text-ink-2">
        Найдено программ: <b className="text-brand">{list.length}</b>
      </div>

      {list.length === 0 ? (
        <div className="py-10 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl text-ink-2">
          Программы не найдены — измените фильтры.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((p) => (
            <div key={p.id} className="flex items-center gap-4 bg-white border border-line rounded-[10px] px-[18px] py-[14px] flex-wrap">
              <span
                className="shrink-0 font-ui font-bold text-[11px] uppercase tracking-[0.04em] text-white rounded-md px-[9px] py-[3px]"
                style={{ background: levelColor(p.levelCat) }}
              >
                {p.level}
              </span>
              <span className="shrink-0 text-[14px] text-ink-3 tabular-nums">{p.code}</span>
              <span className="flex-1 min-w-[200px] font-bold text-[17px] text-brand">{p.name}</span>
              <span className="shrink-0 text-[15px] text-steel">{p.form || DASH}</span>
              <span className="shrink-0 font-display font-bold text-[18px] text-brand min-w-[120px] text-right">
                {p.price || DASH}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Раздел 3 макета: приказы, вкладки по годам набора.
export function OrderTabs({ years, orders }: { years: string[]; orders: Record<string, PaidOrder[]> }) {
  const [year, setYear] = useState(years[0] ?? "");
  const cur = orders[year] ?? [];

  if (years.length === 0) {
    return <p className="m-0 text-[17px] text-ink-3">Приказы об утверждении стоимости не заполнены.</p>;
  }

  const items: DocItem[] = cur.map((o) => ({
    itemprop: "",
    title: o.note ? `${o.name} (${o.note})` : o.name,
    href: o.href && o.href !== "#" ? encodeFileHref(o.href) : undefined,
    fmt: fileExt({ name: o.name, href: o.href }),
    date: o.date ?? "",
    size: o.size ?? "",
    missing: !o.href || o.href === "#" || o.name === DASH,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-y-1 gap-x-[2px] border-b-2 border-line">
        {years.map((y) => {
          const on = y === year;
          return (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className="shrink-0 font-ui font-bold text-[16px] px-4 py-[10px] bg-none border-none cursor-pointer -mb-[2px] transition-colors"
              style={{ color: on ? "var(--c-brand)" : "var(--c-ink-3)", borderBottom: `2px solid ${on ? "var(--c-accent)" : "transparent"}` }}
            >
              {y}
            </button>
          );
        })}
      </div>
      {items.length > 0 ? (
        <DocCards docs={items} />
      ) : (
        <p className="m-0 text-[17px] text-ink-3">За {year} год приказы не заполнены.</p>
      )}
    </div>
  );
}
