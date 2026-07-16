"use client";

import { useEffect, useRef, useState } from "react";
import { Banner, type BannerData } from "@/components/Banner";

// Слайдер баннеров по макету BannerSlider.dc.html: 2 карточки за страницу,
// листание страницами (стрелки + точки).
//
// На мобиле — по одной: две карточки схлопывались в столбик, и слайд терял
// границы. Плюс листание пальцем: на телефоне тыкать в стрелки неудобно.
const SWIPE_PX = 40;

export function BannerSlider({ banners }: { banners: BannerData[] }) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(2);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // Считаем после монтирования: на сервере ширины экрана нет, а расхождение
  // разметки сервера и клиента React бы не простил.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => {
      setPerPage(mq.matches ? 1 : 2);
      setPage(0);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (banners.length === 0) return null;
  const pageCount = Math.ceil(banners.length / perPage);
  const cur = ((page % pageCount) + pageCount) % pageCount;
  const goTo = (i: number) => setPage(((i % pageCount) + pageCount) % pageCount);

  const pages = Array.from({ length: pageCount }, (_, i) =>
    banners.slice(i * perPage, i * perPage + perPage),
  );

  // Свайп: только горизонтальный жест, иначе перехватили бы прокрутку страницы.
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || pageCount < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) <= Math.abs(dy)) return;
    goTo(cur + (dx < 0 ? 1 : -1));
  };

  const arrowCls =
    "absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-line bg-white text-brand flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-bg-muted z-10";

  return (
    <section className="relative font-ui">
      <div className="overflow-hidden rounded-lg touch-pan-y" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div
          className="flex transition-transform duration-[360ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: `${pageCount * 100}%`, transform: `translateX(-${cur * (100 / pageCount)}%)` }}
        >
          {pages.map((items, i) => (
            <div
              key={i}
              className={`grid gap-4 pr-4 box-border ${perPage === 1 ? "grid-cols-1" : "grid-cols-2"}`}
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
