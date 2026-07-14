"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Program } from "@/lib/content/programs-types";
import { LEVEL_CATS } from "@/lib/content/programs-types";

const LEVEL_COLOR: Record<string, string> = {
  spo: "rgb(48,176,199)",
  bak: "rgb(184,57,4)",
  spec: "rgb(0,101,155)",
  mag: "rgb(88,86,214)",
  ord: "rgb(170,136,99)",
  asp: "rgb(30,160,80)",
  other: "rgb(50,100,150)",
};

export function ProgramCatalog({ programs }: { programs: Program[] }) {
  const [q, setQ] = useState("");
  const [levels, setLevels] = useState<string[]>([]);
  const [forms, setForms] = useState<string[]>([]);

  const presentForms = useMemo(
    () => [...new Set(programs.map((p) => p.form).filter(Boolean))].sort(),
    [programs],
  );

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return programs.filter(
      (p) =>
        (levels.length === 0 || levels.includes(p.levelCat)) &&
        (forms.length === 0 || forms.includes(p.form)) &&
        (!query || p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query)),
    );
  }, [programs, q, levels, forms]);

  const toggle = (arr: string[], set: (v: string[]) => void, k: string) =>
    set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]);
  const isFiltered = !!q.trim() || levels.length > 0 || forms.length > 0;

  const Chip = ({ active, color, onClick, children }: { active: boolean; color?: string; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className="text-[14px] font-medium rounded-full px-[14px] py-[7px] border cursor-pointer"
      style={{
        color: active ? "#fff" : "var(--c-steel)",
        background: active ? color ?? "var(--c-accent)" : "var(--c-bg)",
        borderColor: active ? color ?? "var(--c-accent)" : "var(--c-line-strong)",
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="font-ui">
      <div className="bg-white border border-line rounded-2xl p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-4">
        <label className="flex flex-col gap-[6px] mb-3">
          <span className="font-bold text-[14px] text-ink-2">Поиск по названию или коду</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Лечебное дело, 31.05.01…"
            className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent max-w-[420px]"
          />
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[13px] font-bold text-ink-3 mr-1">Уровень:</span>
            {LEVEL_CATS.filter((c) => programs.some((p) => p.levelCat === c.key)).map((c) => (
              <Chip key={c.key} active={levels.includes(c.key)} color={LEVEL_COLOR[c.key]} onClick={() => toggle(levels, setLevels, c.key)}>
                {c.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[13px] font-bold text-ink-3 mr-1">Форма:</span>
            {presentForms.map((f) => (
              <Chip key={f} active={forms.includes(f)} onClick={() => toggle(forms, setForms, f)}>
                {f}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="text-[16px] text-ink-2">
          Программ: <b className="text-brand">{list.length}</b>
        </div>
        {isFiltered && (
          <button type="button" onClick={() => { setQ(""); setLevels([]); setForms([]); }} className="font-bold text-[15px] text-accent bg-none border-none cursor-pointer">
            Сбросить ✕
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl">
          <div className="font-display font-bold text-[20px] text-brand mb-[6px]">Ничего не найдено</div>
          <div className="text-[16px] text-ink-2">Измените параметры фильтра.</div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-3">
          {list.map((p) => {
            const color = LEVEL_COLOR[p.levelCat] ?? LEVEL_COLOR.other;
            return (
              <Link
                key={p.id}
                href={`/programmy/${p.id}`}
                className="flex flex-col gap-2 bg-white border border-line rounded-xl p-5 no-underline transition-[box-shadow,transform] hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)] hover:-translate-y-[2px]"
                style={{ borderTop: `4px solid ${color}` }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-bold font-display text-ink-2">{p.code}</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.03em] rounded-[5px] px-[8px] py-[2px]" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                    {p.level.replace(/^Высшее образование\s*[–-]\s*/i, "").replace(/подготовка кадров высшей квалификации\s*[–-]\s*/i, "")}
                  </span>
                </div>
                <div className="font-bold text-[19px] leading-[1.2] text-brand">{p.name}</div>
                <div className="flex gap-4 text-[14px] text-steel flex-wrap mt-auto pt-1">
                  {p.form && <span>{p.form}</span>}
                  {p.term && <span>· {p.term}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
