"use client";

import { useState } from "react";
import { Banner, type BannerData } from "@/components/Banner";

// Слайдер баннеров по макету BannerSlider.dc.html: 2 карточки за страницу,
// листание страницами (стрелки + точки).
export function BannerSlider({ banners }: { banners: BannerData[] }) {
  const [page, setPage] = useState(0);
  if (banners.length === 0) return null;

  const perPage = 2;
  const pageCount = Math.ceil(banners.length / perPage);
  const cur = ((page % pageCount) + pageCount) % pageCount;
  const goTo = (i: number) => setPage(((i % pageCount) + pageCount) % pageCount);

  const pages = Array.from({ length: pageCount }, (_, i) =>
    banners.slice(i * perPage, i * perPage + perPage),
  );

  const arrowCls =
    "absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-line bg-white text-brand flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-bg-muted z-10";

  return (
    <section className="relative font-ui">
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-[360ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: `${pageCount * 100}%`, transform: `translateX(-${cur * (100 / pageCount)}%)` }}
        >
          {pages.map((items, i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-4 pr-4 box-border max-[640px]:grid-cols-1"
              style={{ flex: `0 0 ${100 / pageCount}%` }}
            >
              {items.map((b, j) => (
                <Banner key={j} b={b} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <>
          <button type="button" aria-label="Предыдущие баннеры" onClick={() => goTo(cur - 1)} className={`${arrowCls} -left-[18px] max-[680px]:left-1`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" aria-label="Следующие баннеры" onClick={() => goTo(cur + 1)} className={`${arrowCls} -right-[18px] max-[680px]:right-1`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <div className="flex justify-center gap-2 mt-[14px]">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Слайд ${i + 1}`}
                onClick={() => goTo(i)}
                className="h-2 rounded transition-all cursor-pointer border-none p-0"
                style={{ width: i === cur ? "22px" : "8px", background: i === cur ? "var(--c-brand)" : "var(--c-line-strong)" }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
