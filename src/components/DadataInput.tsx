"use client";

import { useEffect, useRef, useState } from "react";
import { dadataSuggest, type SuggestKind, type Suggestion } from "@/lib/forms/dadata";

// Поле с подсказками Dadata: как человек печатает, под полем выпадает список
// вариантов (ФИО из справочника, адрес из ФИАС). Клик или Enter — подставить.
// Вызывается только когда токен задан (иначе Form рендерит обычный input).
//
// Дебаунс 250 мс + отмена прошлого запроса (AbortController), чтобы не слать
// запрос на каждую букву. Клавиатура: ↓/↑ — по списку, Enter — выбрать,
// Esc — закрыть.

const DEBOUNCE_MS = 250;

export function DadataInput({
  kind,
  value,
  onChange,
  disabled,
  placeholder,
  className,
  invalid,
}: {
  kind: SuggestKind;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className: string;
  invalid?: boolean;
}) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);
  // Не дёргать API сразу после выбора варианта (значение меняем сами).
  const justPicked = useRef(false);

  // Закрытие по клику вне поля.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      abort.current?.abort();
    };
  }, []);

  function query(q: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      const res = await dadataSuggest(kind, q, 6, ctrl.signal);
      setItems(res);
      setActive(-1);
      setOpen(res.length > 0);
    }, DEBOUNCE_MS);
  }

  function handleChange(v: string) {
    onChange(v);
    if (justPicked.current) {
      justPicked.current = false;
      return;
    }
    if (v.trim().length >= 1) query(v);
    else setOpen(false);
  }

  function pick(s: Suggestion) {
    justPicked.current = true;
    onChange(s.value);
    setOpen(false);
    setItems([]);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + items.length) % items.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => items.length && setOpen(true)}
        className={className}
      />
      {open && (
        <ul className="absolute z-30 left-0 right-0 top-[calc(100%+4px)] max-h-[260px] overflow-y-auto bg-white border border-line-strong rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-1 m-0 list-none">
          {items.map((s, idx) => (
            <li key={`${s.value}-${idx}`}>
              <button
                type="button"
                // onMouseDown, а не onClick: успеть выбрать до blur/закрытия.
                onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                onMouseEnter={() => setActive(idx)}
                className={`w-full text-left px-[14px] py-2 text-[16px] font-normal cursor-pointer border-0 bg-transparent ${
                  idx === active ? "bg-sky-soft/15 text-brand" : "text-ink hover:bg-bg-muted"
                }`}
              >
                {s.value}
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Пометка о внешнем источнике подсказок — честность по ПДн. */}
      {(open || value) && (
        <span className={`block text-[13px] text-ink-3 mt-1 ${invalid ? "hidden" : ""}`}>
          Подсказки предоставляет Dadata
        </span>
      )}
    </div>
  );
}
