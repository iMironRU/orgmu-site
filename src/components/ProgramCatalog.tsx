"use client";

import { useMemo, useState } from "react";
import type { Program } from "@/lib/content/programs-types";
import { LEVEL_CATS } from "@/lib/content/programs-types";
import { ProgramTile } from "@/components/ProgramTile";

const SELECT =
  "pc-select font-ui text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent bg-white cursor-pointer w-full";

// Годы приёма — контрол по макету; данные по годам набора в парсинге пока нет.
const YEARS = ["2026", "2025"];

export function ProgramCatalog({ programs }: { programs: Program[] }) {
  const [q, setQ] = useState("");
  const [year, setYear] = useState(YEARS[0]);
  const [level, setLevel] = useState("");
  const [form, setForm] = useState("");
  const [faculty, setFaculty] = useState("");
  const [basis, setBasis] = useState("");

  const presentLevels = LEVEL_CATS.filter((c) => programs.some((p) => p.levelCat === c.key));
  const presentForms = useMemo(() => [...new Set(programs.map((p) => p.form).filter(Boolean))].sort(), [programs]);
  const faculties = useMemo(() => [...new Set(programs.map((p) => p.faculty).filter(Boolean) as string[])].sort(), [programs]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return programs.filter(
      (p) =>
        (!level || p.levelCat === level) &&
        (!form || p.form === form) &&
        (!faculty || p.faculty === faculty) &&
        (!basis || p.basis === basis || p.basis === "both") &&
        (!query || p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query)),
    );
  }, [programs, q, level, form, faculty, basis]);

  const isFiltered = !!q.trim() || !!level || !!form || !!faculty || !!basis;
  const reset = () => { setQ(""); setLevel(""); setForm(""); setFaculty(""); setBasis(""); };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="flex-[1_1_160px] min-w-[150px] flex flex-col gap-[6px]">
      <span className="font-bold text-[14px] text-ink-2">{label}</span>
      {children}
    </label>
  );

  return (
    <div className="font-ui">
      {/* Горизонтальная фильтр-панель — по макету ProgramCatalog */}
      <div className="bg-white border border-line rounded-2xl p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-[14px]">
        <div className="flex flex-wrap gap-3 items-end">
          <Field label="Поиск">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Название или код"
              className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
            />
          </Field>
          <Field label="Приём (год набора)">
            <select value={year} onChange={(e) => setYear(e.target.value)} className={SELECT}>
              {YEARS.map((y) => (
                <option key={y} value={y}>Приём {y}</option>
              ))}
            </select>
          </Field>
          <Field label="Уровень">
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={SELECT}>
              <option value="">Все уровни</option>
              {presentLevels.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Форма">
            <select value={form} onChange={(e) => setForm(e.target.value)} className={SELECT}>
              <option value="">Любая</option>
              {presentForms.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Факультет">
            <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className={SELECT}>
              <option value="">Все</option>
              {faculties.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Основа">
            <select value={basis} onChange={(e) => setBasis(e.target.value)} className={SELECT}>
              <option value="">Любая</option>
              <option value="budget">Бюджет</option>
              <option value="paid">Договор</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="text-[16px] text-ink-2">
          Найдено программ: <b className="text-brand">{list.length}</b>
        </div>
        {isFiltered && (
          <button type="button" onClick={reset} className="font-bold text-[15px] text-accent bg-none border-none cursor-pointer">
            Сбросить фильтры ✕
          </button>
        )}
      </div>

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

      <div className="mt-6 flex gap-3 px-[18px] py-4 bg-[rgba(48,176,199,0.08)] rounded-[10px]">
        <span className="shrink-0 text-teal flex">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6 3 12l5 6M16 6l5 6-5 6M13 4l-2 16" /></svg>
        </span>
        <div className="text-[15px] leading-[1.5] text-steel">
          Внутри карточки программы — учебные планы, рабочие программы, практики,
          трудоустройство. Факультет, основа, места приёма (КЦП), проходной балл и
          год набора показаны как «—» и заполняются в
          {" "}<code>content/programs/programs-extra.yml</code>.
        </div>
      </div>
    </div>
  );
}
