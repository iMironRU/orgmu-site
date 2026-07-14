"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Кастомный селект из макета FilterSelect.dc.html: кнопка-триггер с шевроном,
// всплывающий список с галочками/чекбоксами, поиск, мультивыбор,
// счётчик выбранных и «Очистить выбор». Заменяет нативный <select>.

export type Option = string | { value: string; label: string };

type BaseProps = {
  options: Option[];
  searchable?: boolean;
  placeholder?: string;
  className?: string;
};

type SingleProps = BaseProps & {
  multi?: false;
  value: string;
  onChange: (v: string) => void;
};

type MultiProps = BaseProps & {
  multi: true;
  value: string[];
  onChange: (v: string[]) => void;
};

type Props = SingleProps | MultiProps;

function norm(opts: Option[]): { value: string; label: string }[] {
  return (opts || []).map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}

export function FilterSelect(props: Props) {
  const { options, searchable = true, placeholder = "Выберите", className } = props;
  const multi = props.multi === true;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQ("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const opts = useMemo(() => norm(options), [options]);
  const sel = multi
    ? (props.value as string[])
    : props.value
      ? [props.value as string]
      : [];

  const emit = (arr: string[]) => {
    if (multi) (props.onChange as (v: string[]) => void)(arr);
    else (props.onChange as (v: string) => void)(arr[0] ?? "");
  };

  const pick = (val: string) => {
    if (multi) {
      emit(sel.includes(val) ? sel.filter((x) => x !== val) : [...sel, val]);
    } else {
      emit([val]);
      setOpen(false);
      setQ("");
    }
  };

  const query = q.trim().toLowerCase();
  const shown = query ? opts.filter((o) => o.label.toLowerCase().includes(query)) : opts;

  const labelOf = (v: string) => opts.find((o) => o.value === v)?.label ?? v;
  let display = placeholder;
  let hasValue = false;
  if (sel.length) {
    hasValue = true;
    display = multi && sel.length > 1 ? `${labelOf(sel[0])} +${sel.length - 1}` : labelOf(sel[0]);
  }

  return (
    <div ref={rootRef} className={`relative w-full font-ui ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setQ("");
        }}
        className={`flex items-center justify-between gap-[10px] w-full box-border text-[16px] text-left px-[14px] py-[11px] border rounded-[9px] bg-white cursor-pointer transition-colors ${
          open ? "border-accent" : "border-line-strong"
        } ${hasValue ? "text-ink" : "text-ink-3"}`}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{display}</span>
        <span className="shrink-0 flex items-center gap-[6px]">
          {multi && sel.length > 1 && (
            <span className="font-display text-[12px] font-bold text-white bg-accent rounded-full min-w-[20px] h-[20px] px-[6px] inline-flex items-center justify-center">
              {sel.length}
            </span>
          )}
          <span
            className="text-steel flex transition-transform duration-150"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l5 5 5-5" />
            </svg>
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 bg-white border border-line rounded-xl shadow-[0_12px_32px_rgba(15,40,70,0.16)] overflow-hidden">
          {searchable && (
            <div className="p-[10px] border-b border-[rgb(240,240,240)]">
              <div className="flex items-center gap-2 bg-bg-muted border border-line rounded-lg px-[10px] py-2">
                <span className="shrink-0 text-ink-3 flex">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4-4" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Поиск…"
                  autoFocus
                  className="flex-1 min-w-0 border-none outline-none bg-transparent text-[15px] text-ink"
                />
              </div>
            </div>
          )}

          <div className="max-h-[260px] overflow-y-auto p-[6px]">
            {shown.map((o) => {
              const isSel = sel.includes(o.value);
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => pick(o.value)}
                  className={`flex items-center gap-[11px] w-full box-border text-left text-[16px] rounded-lg px-3 py-[10px] cursor-pointer hover:bg-[rgb(245,248,251)] ${
                    isSel ? "text-brand font-bold" : "text-steel font-normal"
                  } ${isSel && !multi ? "bg-[rgba(184,57,4,0.10)]" : "bg-transparent"}`}
                >
                  {multi ? (
                    <span
                      className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                        isSel ? "border-accent bg-accent" : "border-line-strong bg-white"
                      }`}
                    >
                      {isSel && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5 9-10" />
                        </svg>
                      )}
                    </span>
                  ) : (
                    <span className="shrink-0 w-[18px] flex text-brand">
                      {isSel && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5 9-10" />
                        </svg>
                      )}
                    </span>
                  )}
                  <span className="flex-1">{o.label}</span>
                </button>
              );
            })}
            {shown.length === 0 && (
              <div className="px-3 py-4 text-center text-[15px] text-ink-3">Ничего не найдено</div>
            )}
          </div>

          {multi && sel.length > 0 && (
            <div className="border-t border-[rgb(240,240,240)] p-2">
              <button
                type="button"
                onClick={() => emit([])}
                className="w-full font-bold text-[14px] text-accent bg-none border-none p-2 cursor-pointer"
              >
                Очистить выбор
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
