"use client";

import { useState } from "react";
import type { DocItem } from "@/lib/sveden/documents";

const FMT_STYLE: Record<string, { bg: string; fg: string }> = {
  PDF: { bg: "rgba(255,59,48,0.10)", fg: "rgb(214,54,44)" },
  DOC: { bg: "rgba(66,133,244,0.12)", fg: "rgb(40,103,178)" },
  DOCX: { bg: "rgba(66,133,244,0.12)", fg: "rgb(40,103,178)" },
  RTF: { bg: "rgba(66,133,244,0.12)", fg: "rgb(40,103,178)" },
  XLSX: { bg: "rgba(30,160,80,0.12)", fg: "rgb(24,128,64)" },
};

const CARD =
  "flex items-center gap-4 bg-white border border-line rounded-[10px] px-[18px] py-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]";

// Названия документов на orgma — это полные заголовки актов, до 900 символов.
// Разрезаем по первой «ёлочке»: голова (тип, дата, номер) — то, что ищут
// глазами, показываем всегда; название в кавычках сворачиваем до двух строк.
const LONG = 120;
export function splitDocTitle(title: string): { head: string; body: string } {
  if (title.length <= LONG) return { head: title, body: "" };
  const i = title.indexOf("«");
  if (i > 0) return { head: title.slice(0, i).trim(), body: title.slice(i).trim() };
  return { head: "", body: title }; // длинное без кавычек — сворачиваем целиком
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function DocCard({ d }: { d: DocItem }) {
  const [open, setOpen] = useState(false);
  const fmt = FMT_STYLE[d.fmt] ?? FMT_STYLE.DOC;
  const hasFile = !!d.href && !d.missing;
  const { head, body } = splitDocTitle(d.title);
  const foldable = body.length > 0;

  const title = (
    <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
      {head && (
        <span className={`font-bold text-[17px] leading-[1.25] break-words ${hasFile ? "text-brand" : "text-ink-2"}`}>
          {head}
        </span>
      )}
      {foldable && (
        <span
          className={`text-[15px] leading-[1.4] text-steel break-words ${open ? "" : "line-clamp-2"} ${head ? "" : "font-bold text-[17px]"}`}
        >
          {body}
        </span>
      )}
    </span>
  );

  const meta = (
    <span className="shrink-0 flex items-center gap-4 justify-end">
      {d.date && <span className="text-[14px] text-ink-3 whitespace-nowrap">{d.date}</span>}
      <span className="text-[14px] text-ink-3 whitespace-nowrap min-w-[64px] text-right">{d.size || "—"}</span>
      {hasFile && <span className="shrink-0 text-accent"><DownloadIcon /></span>}
    </span>
  );

  const badge = (
    <span
      className={`shrink-0 flex items-center justify-center w-[38px] h-[38px] rounded-lg font-display font-bold text-[11px] ${hasFile ? "" : "bg-bg-muted text-ink-3"}`}
      style={hasFile ? { background: fmt.bg, color: fmt.fg } : undefined}
    >
      {d.fmt || "—"}
    </span>
  );

  // Кнопка раскрытия — рядом со ссылкой, а не внутри неё: вложенные
  // интерактивные элементы ломают клавиатуру и скринридеры, а на телефоне
  // легко промахнуться и скачать файл вместо раскрытия.
  return (
    <div className={`${CARD} ${hasFile ? "transition-shadow hover:shadow-[0_6px_16px_rgba(0,0,0,0.09)]" : ""}`}>
      {hasFile ? (
        <a href={d.href} className="flex items-center gap-4 flex-1 min-w-0 no-underline">
          {badge}
          {title}
          {meta}
        </a>
      ) : (
        <>
          {badge}
          {title}
          {meta}
        </>
      )}
      {foldable && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          title={open ? "Свернуть название" : "Показать название полностью"}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-line-strong bg-white text-steel cursor-pointer hover:border-accent hover:text-accent transition-colors"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 160ms" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
