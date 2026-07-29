"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Календарь в дизайне сайта — замена нативному <input type="date">. Значение
// хранится в ISO «ГГГГ-ММ-ДД» (как у нативного поля), поэтому форма и сервер
// работают с ним без изменений. Неделя с понедельника, подписи русские.

const MONTHS_NOM = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
const WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parseISO(s: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  if (!m) return null;
  const y = +m[1], mo = +m[2] - 1, d = +m[3];
  if (mo < 0 || mo > 11 || d < 1 || d > 31) return null;
  return { y, m: mo, d };
}

function fmtRu(iso: string): string {
  const p = parseISO(iso);
  return p ? `${p.d} ${MONTHS_GEN[p.m]} ${p.y}` : "";
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  invalid = false,
  placeholder = "Выберите дату",
}: {
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
  }, []);

  const sel = parseISO(value);
  // Отображаемый месяц: из значения, иначе текущий.
  const [view, setView] = useState<{ y: number; m: number }>(
    sel ? { y: sel.y, m: sel.m } : { y: today.y, m: today.m },
  );

  // При открытии — показать месяц выбранной даты (если она есть).
  useEffect(() => {
    if (open && sel) setView({ y: sel.y, m: sel.m });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Сетка месяца: ведущие пустые ячейки до понедельника + дни месяца.
  const cells = useMemo(() => {
    const firstDow = new Date(view.y, view.m, 1).getDay(); // 0=Вс..6=Сб
    const lead = (firstDow + 6) % 7; // сколько пустых до 1-го (неделя с Пн)
    const days = new Date(view.y, view.m + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < lead; i++) arr.push(null);
    for (let d = 1; d <= days; d++) arr.push(d);
    return arr;
  }, [view]);

  const shift = (delta: number) => {
    const m = view.m + delta;
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };

  const pick = (d: number) => {
    onChange(toISO(view.y, view.m, d));
    setOpen(false);
  };

  const hasValue = !!sel;

  return (
    <div ref={rootRef} className="relative w-full font-ui">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex items-center justify-between gap-[10px] w-full box-border text-[17px] text-left px-[14px] py-[11px] border rounded-lg bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          disabled ? "" : "cursor-pointer"
        } ${open || invalid ? "border-accent" : "border-line-strong"} ${hasValue ? "text-ink" : "text-ink-3"}`}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {hasValue ? fmtRu(value) : placeholder}
        </span>
        <span className="shrink-0 flex items-center gap-2">
          {hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Очистить дату"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onChange(""); } }}
              className="text-ink-3 hover:text-accent flex cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </span>
          )}
          <span className="text-steel flex">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
          </span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute z-50 top-[calc(100%+6px)] left-0 w-[300px] max-w-[calc(100vw-24px)] bg-white border border-line rounded-xl shadow-[0_12px_32px_rgba(15,40,70,0.16)] p-3"
        >
          {/* Заголовок с переключением месяца */}
          <div className="flex items-center justify-between mb-2">
            <button type="button" aria-label="Предыдущий месяц" onClick={() => shift(-1)} className="w-9 h-9 flex items-center justify-center rounded-lg text-brand hover:bg-bg-muted cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <span className="font-display font-bold text-[17px] text-brand">
              {MONTHS_NOM[view.m]} {view.y}
            </span>
            <button type="button" aria-label="Следующий месяц" onClick={() => shift(1)} className="w-9 h-9 flex items-center justify-center rounded-lg text-brand hover:bg-bg-muted cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>

          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEK.map((w, i) => (
              <div key={w} className={`text-center text-[12px] font-bold py-1 ${i >= 5 ? "text-accent/70" : "text-ink-3"}`}>{w}</div>
            ))}
          </div>

          {/* Сетка дней */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, idx) => {
              if (d === null) return <span key={`e${idx}`} />;
              const isSel = sel && sel.y === view.y && sel.m === view.m && sel.d === d;
              const isToday = today.y === view.y && today.m === view.m && today.d === d;
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => pick(d)}
                  aria-label={`${d} ${MONTHS_GEN[view.m]} ${view.y}`}
                  aria-current={isToday ? "date" : undefined}
                  className={`h-9 rounded-lg text-[15px] cursor-pointer transition-colors ${
                    isSel
                      ? "bg-accent text-white font-bold"
                      : isToday
                        ? "text-accent font-bold border border-accent/40 hover:bg-bg-muted"
                        : "text-ink hover:bg-bg-muted"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
