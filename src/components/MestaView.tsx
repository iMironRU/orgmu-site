"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/FilterSelect";
import { MESTA_UI } from "@/lib/i18n/ui-defs";

export type MestaObj = { name: string; type?: string; address?: string; area?: string; a11y?: boolean };


export function MestaView({ objects, ui }: { objects: MestaObj[]; ui?: Partial<typeof MESTA_UI> }) {
  const s_ = { ...MESTA_UI, ...ui };
  const [q, setQ] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [a11yOnly, setA11yOnly] = useState(false);

  const allTypes = useMemo(
    () => [...new Set(objects.map((o) => o.type).filter(Boolean) as string[])].sort(),
    [objects],
  );

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return objects.filter(
      (o) =>
        (types.length === 0 || (o.type ? types.includes(o.type) : false)) &&
        (!a11yOnly || !!o.a11y) &&
        (!s ||
          o.name.toLowerCase().includes(s) ||
          (o.address ?? "").toLowerCase().includes(s) ||
          (o.type ?? "").toLowerCase().includes(s)),
    );
  }, [objects, q, types, a11yOnly]);

  const isFiltered = !!q.trim() || types.length > 0 || a11yOnly;

  return (
    <div className="font-ui">
      <div className="bg-white border border-line rounded-2xl p-[18px] mb-4 flex flex-wrap gap-3 items-end">
        <label className="flex-[1_1_260px] min-w-[220px] flex flex-col gap-[6px]">
          <span className="font-bold text-[14px] text-ink-2">{s_.search}</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={s_.searchHint}
            className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
          />
        </label>
        <label className="flex-[1_1_200px] min-w-[170px] flex flex-col gap-[6px]">
          <span className="font-bold text-[14px] text-ink-2">{s_.type}</span>
          <FilterSelect multi value={types} onChange={setTypes} placeholder={s_.any} options={allTypes} />
        </label>
        <button
          type="button"
          onClick={() => setA11yOnly((v) => !v)}
          aria-pressed={a11yOnly}
          className="text-[15px] font-medium rounded-full px-[17px] py-[9px] border cursor-pointer transition-colors"
          style={{
            color: a11yOnly ? "#fff" : "var(--c-steel)",
            background: a11yOnly ? "rgb(30,160,80)" : "#fff",
            borderColor: a11yOnly ? "rgb(30,160,80)" : "var(--c-line-strong)",
          }}
        >
          {s_.a11y}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="text-[16px] text-ink-2">
          {s_.count}: <b className="text-brand">{list.length}</b>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setTypes([]);
              setA11yOnly(false);
            }}
            className="font-bold text-[15px] text-accent bg-none border-none cursor-pointer"
          >
            {s_.reset} ✕
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="py-10 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl text-ink-2">
          {s_.empty}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
          {list.map((o, i) => (
            <div key={i} className="bg-white border border-line rounded-xl p-5 flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                {o.type && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-steel bg-bg-muted border border-line rounded-[5px] px-2 py-[2px]">
                    {o.type}
                  </span>
                )}
                {o.a11y && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[rgb(30,160,80)] bg-[rgba(52,199,89,0.12)] rounded-[5px] px-2 py-[2px]">
                    Доступно для МГН
                  </span>
                )}
              </div>
              <div className="font-bold text-[18px] text-brand leading-[1.2]">{o.name}</div>
              {o.address && <div className="text-[15px] text-steel">{o.address}</div>}
              {o.area && <div className="text-[14px] text-ink-3">{o.area}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
