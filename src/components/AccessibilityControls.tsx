"use client";

import { useEffect, useState } from "react";
import {
  A11Y_DEFAULTS,
  applyA11y,
  readA11y,
  saveA11y,
  type A11ySettings,
  type A11yTheme,
} from "@/lib/a11y";

const FONTS: { key: 0 | 1 | 2; label: string; px: string }[] = [
  { key: 0, label: "А", px: "17px" },
  { key: 1, label: "А", px: "21px" },
  { key: 2, label: "А", px: "26px" },
];

const THEMES: { key: A11yTheme; name: string; bg: string; fg: string }[] = [
  { key: "normal", name: "Обычная", bg: "#fff", fg: "rgb(49,49,49)" },
  { key: "darkblue", name: "Тёмная", bg: "rgb(9,42,66)", fg: "#fff" },
  { key: "contrast", name: "Ч/Ж", bg: "#000", fg: "rgb(255,220,0)" },
  { key: "sepia", name: "Сепия", bg: "rgb(247,238,214)", fg: "rgb(66,52,32)" },
];

const SPACINGS: { key: 0 | 1 | 2; name: string; val: string }[] = [
  { key: 0, name: "Обычный", val: "0" },
  { key: 1, name: "Средний", val: "0.08em" },
  { key: 2, name: "Большой", val: "0.14em" },
];

const CARD = "bg-white border border-line rounded-xl p-[22px]";
const LABEL =
  "font-bold text-[16px] uppercase tracking-[0.04em] text-ink-2 mb-[14px]";

function segStyle(active: boolean) {
  return {
    color: active ? "#fff" : "var(--c-steel)",
    background: active ? "var(--c-accent)" : "var(--c-bg)",
    borderColor: active ? "var(--c-accent)" : "var(--c-line-strong)",
  };
}

export function AccessibilityControls() {
  const [s, setS] = useState<A11ySettings>(A11Y_DEFAULTS);

  // На маунте читаем сохранённое и применяем (на случай прямого захода на страницу).
  useEffect(() => {
    const saved = readA11y();
    setS(saved);
    applyA11y(saved);
  }, []);

  function update(patch: Partial<A11ySettings>) {
    const next = { ...s, ...patch };
    setS(next);
    applyA11y(next);
    saveA11y(next);
  }

  return (
    <div className="flex flex-col gap-5 font-ui">
      {/* Размер шрифта */}
      <div className={CARD}>
        <div className={LABEL}>Размер шрифта</div>
        <div className="flex gap-[10px]">
          {FONTS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => update({ font: f.key })}
              className="flex-1 font-ui font-bold border-2 rounded-lg py-3 px-2 cursor-pointer"
              style={{ ...segStyle(s.font === f.key), fontSize: f.px }}
              aria-pressed={s.font === f.key}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Цветовая схема */}
      <div className={CARD}>
        <div className={LABEL}>Цветовая схема</div>
        <div className="flex gap-[10px] flex-wrap">
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => update({ theme: t.key })}
              title={t.name}
              className="font-ui font-bold text-[15px] border-[3px] rounded-lg py-[10px] px-[14px] cursor-pointer"
              style={{
                color: t.fg,
                background: t.bg,
                borderColor: s.theme === t.key ? "var(--c-accent)" : "var(--c-line-strong)",
              }}
              aria-pressed={s.theme === t.key}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Межбуквенный интервал */}
      <div className={CARD}>
        <div className={LABEL}>Межбуквенный интервал</div>
        <div className="flex gap-[10px]">
          {SPACINGS.map((sp) => (
            <button
              key={sp.key}
              type="button"
              onClick={() => update({ spacing: sp.key })}
              className="flex-1 font-ui font-bold text-[16px] border-2 rounded-lg py-3 px-2 cursor-pointer"
              style={{ ...segStyle(s.spacing === sp.key), letterSpacing: sp.val }}
              aria-pressed={s.spacing === sp.key}
            >
              {sp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Отключить изображения */}
      <div className={`${CARD} flex items-center justify-between gap-4`}>
        <div>
          <div className="font-bold text-[18px] text-brand">Отключить изображения</div>
          <div className="text-[15px] text-ink-3">Скрыть фото и декоративную графику</div>
        </div>
        <button
          type="button"
          onClick={() => update({ images: !s.images })}
          aria-pressed={!s.images}
          aria-label="Отключить изображения"
          className="shrink-0 w-[58px] h-8 rounded-full border-none cursor-pointer relative transition-colors"
          style={{ background: s.images ? "var(--c-gray-3)" : "var(--c-accent)" }}
        >
          <span
            className="absolute top-[3px] w-[26px] h-[26px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[left]"
            style={{ left: s.images ? "3px" : "29px" }}
          />
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => update({ ...A11Y_DEFAULTS })}
          className="font-ui font-bold text-[17px] text-steel bg-white border-2 border-line-strong rounded-lg py-3 px-[22px] cursor-pointer"
        >
          Сбросить настройки
        </button>
      </div>
    </div>
  );
}
