import Link from "next/link";
import type { NewsItem } from "@/lib/content/news-types";
import { formatDateRu, kindStyle, newsKind } from "@/lib/content/news-types";

export function NewsCard({ item }: { item: NewsItem }) {
  const k = kindStyle(newsKind(item));
  const cover = item.cover?.remote;

  return (
    <Link
      href={`/novosti/${item.slug}`}
      className="group flex flex-col gap-[14px] no-underline bg-white border border-line rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-[box-shadow,transform] duration-[240ms] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
    >
      <div className="w-full aspect-[16/10] bg-line overflow-hidden">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-2 px-[18px] pb-[18px]">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold tracking-[0.04em] uppercase rounded-md px-[9px] py-[3px]"
            style={{ color: k.color, background: k.bg }}
          >
            {k.label}
          </span>
          <span className="font-ui font-bold text-[14px] tracking-[0.04em] uppercase text-sky-soft">
            {formatDateRu(item.published_at)}
          </span>
        </div>
        <span className="font-ui font-bold text-[20px] leading-[1.15] text-brand text-pretty">
          {item.title}
        </span>
        {item.excerpt && (
          <span className="font-ui font-normal text-[16px] leading-[1.4] text-steel text-pretty line-clamp-3">
            {item.excerpt}
          </span>
        )}
      </div>
    </Link>
  );
}
