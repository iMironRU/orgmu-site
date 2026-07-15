"use client";

import { useMemo, useState } from "react";
import type { DocGroup } from "@/lib/sveden/documents";
import { DocCard } from "@/components/sveden/DocCard";

const ip = (value: string) => ({ itemprop: value }) as Record<string, string>;

export function DocumentsView({ groups }: { groups: DocGroup[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return groups
      .filter((g) => !cat || g.title === cat)
      .map((g) => ({
        ...g,
        docs: g.docs.filter((d) => !query || d.title.toLowerCase().includes(query)),
      }))
      .filter((g) => g.docs.length > 0);
  }, [groups, q, cat]);

  const count = filtered.reduce((n, g) => n + g.docs.length, 0);
  const isFiltered = !!q.trim() || !!cat;

  return (
    <div className="font-ui">
      {/* Фильтры */}
      <div className="bg-white border border-line rounded-2xl p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex-1 min-w-[200px] flex flex-col gap-[6px]">
            <span className="font-bold text-[14px] text-ink-2">Поиск по документам</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Название документа…"
              className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => setCat(null)}
            className="text-[14px] font-medium rounded-full px-[14px] py-[7px] border cursor-pointer"
            style={{
              color: cat === null ? "#fff" : "var(--c-steel)",
              background: cat === null ? "var(--c-accent)" : "var(--c-bg)",
              borderColor: cat === null ? "var(--c-accent)" : "var(--c-line-strong)",
            }}
          >
            Все категории
          </button>
          {groups.map((g) => (
            <button
              key={g.title}
              type="button"
              onClick={() => setCat(g.title)}
              className="text-[14px] font-medium rounded-full px-[14px] py-[7px] border cursor-pointer"
              style={{
                color: cat === g.title ? "#fff" : "var(--c-steel)",
                background: cat === g.title ? "var(--c-accent)" : "var(--c-bg)",
                borderColor: cat === g.title ? "var(--c-accent)" : "var(--c-line-strong)",
              }}
            >
              {g.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="text-[16px] text-ink-2">
          Документов: <b className="text-brand">{count}</b>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat(null);
            }}
            className="font-bold text-[15px] text-accent bg-none border-none cursor-pointer"
          >
            Сбросить ✕
          </button>
        )}
      </div>

      {/* Группы */}
      {count === 0 ? (
        <div className="py-12 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl">
          <div className="font-display font-bold text-[20px] text-brand mb-[6px]">Ничего не найдено</div>
          <div className="text-[16px] text-ink-2">Измените параметры фильтра.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {filtered.map((g) => (
            <section key={g.title}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="m-0 font-display font-bold text-[22px] text-brand">{g.title}</h3>
                <span className="text-[14px] font-bold text-ink-3 bg-[rgb(240,243,246)] rounded-full px-[11px] py-[3px]">
                  {g.docs.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {g.docs.map((d, i) => (
                  <DocCard key={i} d={d} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Информационная плашка (без утверждения про ЭЦП — источник недоступен) */}
      <div className="mt-7 bg-[rgb(240,246,250)] border border-[rgb(214,230,240)] rounded-xl px-[22px] py-[18px] flex gap-[14px] items-start">
        <span className="shrink-0 text-brand mt-px">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M11 12h1v4h1" />
          </svg>
        </span>
        <div className="text-[15px] leading-[1.5] text-steel">
          Раздел закрывает обязательный подпункт «Документы» приказа Рособрнадзора
          № 1493 и несёт машиночитаемую разметку (<code>itemprop</code>) для
          автоматического сбора данных. Размер и дата файлов получены с сервера
          источника.
        </div>
      </div>
    </div>
  );
}
