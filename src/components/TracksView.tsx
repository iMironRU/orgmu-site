"use client";

import { useState } from "react";
import type { Track } from "@/lib/content/priem";

// Выбор уровня поступления и этапы под ним — по макету Admissions.dc.html.
// Даты этапов приходят из priem.yml; где ещё не заполнены — «уточняется»,
// чтобы не выдумывать сроки.

const STAGE_ICONS: Record<string, React.ReactNode> = {
  doc: (
    <path d="M6 2h9l5 5v15H6zM15 2v5h5" />
  ),
  exam: (
    <>
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="M6 10v5c0 1 3 3 6 3s6-2 6-3v-5" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  award: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M9 13.5 8 22l4-2 4 2-1-8.5" />
    </>
  ),
};

export function TracksView({ tracks }: { tracks: Track[] }) {
  const [active, setActive] = useState(tracks[0]?.key ?? "");
  const track = tracks.find((t) => t.key === active) ?? tracks[0];
  if (!track) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Кнопки уровней */}
      <div className="flex flex-wrap gap-[10px]">
        {tracks.map((t) => {
          const on = t.key === track.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className="text-left rounded-xl px-[18px] py-3 border cursor-pointer transition-colors"
              style={{
                borderColor: on ? "rgb(0,101,155)" : "var(--c-line-strong)",
                background: on ? "rgb(0,101,155)" : "#fff",
                color: on ? "#fff" : "var(--c-ink)",
              }}
            >
              <div className="font-display font-bold text-[16px] leading-[1.15]">{t.label}</div>
              <div className={`text-[13px] ${on ? "text-white/80" : "text-ink-3"}`}>{t.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Этапы выбранного уровня */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        {track.stages.map((s, i) => (
          <div key={i} className="bg-white border border-line rounded-xl p-[18px] flex flex-col gap-2">
            <div className="flex items-center gap-[10px]">
              <span className="shrink-0 w-9 h-9 rounded-lg bg-[rgba(0,101,155,0.10)] text-brand flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  {STAGE_ICONS[s.icon] ?? STAGE_ICONS.doc}
                </svg>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-ink-3">Этап {i + 1}</span>
            </div>
            <div className="font-display font-bold text-[16px] text-ink leading-[1.2]">{s.label}</div>
            <div className="text-[14px]" style={{ color: s.date ? "var(--c-brand)" : "var(--c-ink-3)" }}>
              {s.date || "уточняется"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
