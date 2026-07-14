"use client";

import { useEffect, useState } from "react";

export type Announcement = {
  id: string;
  kind: "urgent" | "important" | "info";
  title: string;
  text?: string;
  href?: string;
  until?: string; // ISO-дата, до которой показывать
};

const KIND: Record<string, { tag: string; accent: string; bg: string }> = {
  urgent: { tag: "Срочно", accent: "rgb(255,59,48)", bg: "rgba(255,59,48,0.07)" },
  important: { tag: "Важно", accent: "rgb(255,149,0)", bg: "rgba(255,149,0,0.08)" },
  info: { tag: "Объявление", accent: "rgb(50,173,230)", bg: "rgba(50,173,230,0.08)" },
};

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
function fmtUntil(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return `до ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

const KEY = "orgma-ann-dismissed";

export function AnnouncementBar({ items }: { items: Announcement[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    try {
      setDismissed(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const visible = items.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-[10px] font-ui">
      {visible.map((a) => {
        const k = KIND[a.kind] ?? KIND.info;
        return (
          <div
            key={a.id}
            className="flex items-center gap-4 px-[18px] py-[14px] rounded-[10px] max-[680px]:flex-wrap"
            style={{ background: k.bg, borderLeft: `5px solid ${k.accent}` }}
          >
            <span className="shrink-0 font-bold text-[13px] tracking-[0.05em] uppercase" style={{ color: k.accent }}>
              {k.tag}
            </span>
            <div className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {a.href ? (
                <a href={a.href} className="font-bold text-[17px] text-accent no-underline hover:underline text-pretty">
                  {a.title} →
                </a>
              ) : (
                <span className="font-bold text-[17px] text-ink text-pretty">{a.title}</span>
              )}
              {a.text && <span className="text-[15px] text-ink-2">{a.text}</span>}
            </div>
            {a.until && (
              <span className="shrink-0 flex items-center gap-[6px] text-[14px] font-bold" style={{ color: k.accent }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>
                {fmtUntil(a.until)}
              </span>
            )}
            <button
              type="button"
              title="Скрыть"
              onClick={() => dismiss(a.id)}
              className="shrink-0 flex items-center justify-center w-[30px] h-[30px] border-none rounded-lg bg-black/5 text-ink-2 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 5l14 14M19 5 5 19" /></svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
