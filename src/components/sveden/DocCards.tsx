import type { DocItem } from "@/lib/sveden/documents";

const ip = (value: string) => (value ? ({ itemprop: value } as Record<string, string>) : {});

const FMT_STYLE: Record<string, { bg: string; fg: string }> = {
  PDF: { bg: "rgba(255,59,48,0.10)", fg: "rgb(214,54,44)" },
  DOC: { bg: "rgba(66,133,244,0.12)", fg: "rgb(40,103,178)" },
  XLSX: { bg: "rgba(30,160,80,0.12)", fg: "rgb(24,128,64)" },
};

const CARD =
  "flex items-center gap-4 bg-white border border-line rounded-[10px] px-[18px] py-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]";

// Список документов карточками (стиль макета Documents.dc.html), без фильтров.
// Заготовки без файла (missing / нет href) показываются той же карточкой,
// но не-ссылкой: серый бейдж «—», размер «—», без иконки скачивания.
export function DocCards({ docs }: { docs: DocItem[] }) {
  if (docs.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 font-ui">
      {docs.map((d, i) => {
        const fmt = FMT_STYLE[d.fmt] ?? FMT_STYLE.DOC;
        const hasFile = !!d.href && !d.missing;
        const inner = (
          <>
            <span
              className={`shrink-0 flex items-center justify-center w-[38px] h-[38px] rounded-lg font-display font-bold text-[11px] ${hasFile ? "" : "bg-bg-muted text-ink-3"}`}
              style={hasFile ? { background: fmt.bg, color: fmt.fg } : undefined}
            >
              {d.fmt || "—"}
            </span>
            <span
              className={`flex-1 min-w-0 font-bold text-[17px] leading-[1.25] break-words ${hasFile ? "text-steel" : "text-ink-2"}`}
            >
              {d.title}
            </span>
            <span className="shrink-0 flex items-center gap-4 justify-end">
              {d.date && <span className="text-[14px] text-ink-3 whitespace-nowrap">{d.date}</span>}
              <span className="text-[14px] text-ink-3 whitespace-nowrap min-w-[64px] text-right">
                {d.size || "—"}
              </span>
              {hasFile && (
                <span className="shrink-0 text-accent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                </span>
              )}
            </span>
          </>
        );
        return hasFile ? (
          <a
            key={i}
            {...ip(d.itemprop)}
            href={d.href}
            className={`${CARD} no-underline transition-[box-shadow,transform] hover:shadow-[0_6px_16px_rgba(0,0,0,0.09)] hover:-translate-y-[1px]`}
          >
            {inner}
          </a>
        ) : (
          <div key={i} {...ip(d.itemprop)} className={CARD}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
