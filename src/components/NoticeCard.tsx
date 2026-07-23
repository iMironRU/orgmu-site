import { Link } from "@/components/Link";
import type { NoticeItem, NoticeKind } from "@/lib/content/notices-types";
import { noticeKindMeta, noticeUntilLong } from "@/lib/content/notices-types";

// Иконки видов — из макета AnnouncementBar.dc.html (iconFor).
function KindIcon({ kind }: { kind: NoticeKind }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    width: 54,
    height: 54,
  };
  if (kind === "urgent") {
    return (
      <svg {...common} strokeWidth={2.4}>
        <path d="M12 3 2 20h20L12 3Z" />
        <path d="M12 10v4M12 17.5v.01" />
      </svg>
    );
  }
  if (kind === "important") {
    return (
      <svg {...common} strokeWidth={2.4}>
        <path d="M12 4v9M12 18v.01" />
      </svg>
    );
  }
  return (
    <svg {...common} strokeWidth={2.2}>
      <path d="M3 11l18-7-7 18-2.5-8.5L3 11Z" />
    </svg>
  );
}

// Карточка известия для витрины. Силуэт — как NewsCard (сетка не ломается),
// но вместо фото сплошная заливка цветом вида: макет Notice.dc.html прямо
// оговаривает «solid urgency color, no photo — visually distinct from News».
export function NoticeCard({ n }: { n: NoticeItem }) {
  const k = noticeKindMeta(n.kind);

  return (
    <Link
      href={`/izvestiya/${n.id}`}
      className="flex flex-col gap-[14px] no-underline bg-white border border-line rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-[box-shadow,transform] duration-[240ms] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
    >
      <div
        className="w-full aspect-[16/10] flex items-center justify-center text-white/90"
        style={{ background: k.accent }}
        aria-hidden
      >
        <KindIcon kind={n.kind} />
      </div>
      <div className="flex flex-col gap-2 px-[18px] pb-[18px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-bold tracking-[0.04em] uppercase rounded-md px-[9px] py-[3px]"
            style={{ color: k.accent, background: k.bg }}
          >
            {k.tag}
          </span>
          {n.until && (
            <span className="font-ui font-bold text-[14px] tracking-[0.04em] uppercase text-sky-soft">
              до {noticeUntilLong(n.until)}
            </span>
          )}
        </div>
        <span className="font-ui font-bold text-[20px] leading-[1.15] text-brand text-pretty">
          {n.title}
        </span>
        {n.text && (
          <span className="font-ui font-normal text-[16px] leading-[1.4] text-steel text-pretty line-clamp-3">
            {n.text}
          </span>
        )}
      </div>
    </Link>
  );
}
