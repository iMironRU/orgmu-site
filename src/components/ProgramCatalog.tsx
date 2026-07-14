"use client";

import { useMemo, useState } from "react";
import type { Program } from "@/lib/content/programs-types";
import { LEVEL_CATS } from "@/lib/content/programs-types";
import { ProgramTile } from "@/components/ProgramTile";

const SELECT =
  "pc-select font-ui text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent bg-white cursor-pointer w-full";

export function ProgramCatalog({ programs }: { programs: Program[] }) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [form, setForm] = useState("");

  const presentLevels = LEVEL_CATS.filter((c) => programs.some((p) => p.levelCat === c.key));
  const presentForms = useMemo(
    () => [...new Set(programs.map((p) => p.form).filter(Boolean))].sort(),
    [programs],
  );

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return programs.filter(
      (p) =>
        (!level || p.levelCat === level) &&
        (!form || p.form === form) &&
        (!query || p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query)),
    );
  }, [programs, q, level, form]);

  const isFiltered = !!q.trim() || !!level || !!form;

  return (
    <div className="font-ui">
      {/* Горизонтальная фильтр-панель */}
      <div className="bg-white border border-line rounded-2xl p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-[14px]">
        <div className="flex flex-wrap gap-3 items-end max-[640px]:flex-col max-[640px]:items-stretch">
          <label className="flex-[1_1_220px] min-w-[180px] flex flex-col gap-[6px]">
            <span className="font-bold text-[14px] text-ink-2">Поиск</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Название или код"
              className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
            />
          </label>
          <label className="flex-[1_1_180px] min-w-[160px] flex flex-col gap-[6px]">
            <span className="font-bold text-[14px] text-ink-2">Уровень</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={SELECT}>
              <option value="">Все уровни</option>
              {presentLevels.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="flex-[1_1_180px] min-w-[160px] flex flex-col gap-[6px]">
            <span className="font-bold text-[14px] text-ink-2">Форма</span>
            <select value={form} onChange={(e) => setForm(e.target.value)} className={SELECT}>
              <option value="">Любая</option>
              {presentForms.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Результаты */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="text-[16px] text-ink-2">
          Найдено программ: <b className="text-brand">{list.length}</b>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={() => { setQ(""); setLevel(""); setForm(""); }}
            className="font-bold text-[15px] text-accent bg-none border-none cursor-pointer"
          >
            Сбросить фильтры ✕
          </button>
        )}
      </div>

      {/* Список во всю ширину */}
      {list.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl">
          <div className="font-display font-bold text-[20px] text-brand mb-[6px]">Программы не найдены</div>
          <div className="text-[16px] text-ink-2">Измените параметры фильтра или сбросьте их.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((p) => (
            <ProgramTile key={p.id} p={p} />
          ))}
        </div>
      )}

      {/* Плашка про машиночитаемость / прочерки */}
      <div className="mt-6 flex gap-3 px-[18px] py-4 bg-[rgba(48,176,199,0.08)] rounded-[10px]">
        <span className="shrink-0 text-teal flex">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6 3 12l5 6M16 6l5 6-5 6M13 4l-2 16" /></svg>
        </span>
        <div className="text-[15px] leading-[1.5] text-steel">
          Внутри карточки программы — учебные планы, рабочие программы, практики,
          трудоустройство. Места приёма (КЦП) и проходной балл показаны как «—» и
          заполняются в <code>content/programs/programs-extra.yml</code>.
        </div>
      </div>
    </div>
  );
}
