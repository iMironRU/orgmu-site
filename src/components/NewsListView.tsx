"use client";

import { useEffect, useRef, useState } from "react";
import type { NewsCardItem } from "@/lib/content/news-types";
import { newsKind } from "@/lib/content/news-types";
import { NewsCard } from "@/components/NewsCard";

const STEP = 12;

// Лента новостей: не постраничная, а с подгрузкой вниз (по просьбе заказчика —
// в макете News.dc.html была пагинация). Кнопка «Показать ещё» видима и
// работает по клику; она же — цель для наблюдателя, который догружает
// автоматически при подходе к низу. Если IntersectionObserver недоступен,
// остаётся рабочая кнопка.
export function NewsListView({
  items,
  langPrefix = "",
  lang = "ru",
  kindLabels,
}: {
  items: NewsCardItem[];
  langPrefix?: string;
  lang?: string;
  // Подписи видов новостей, переведённые на сервере: «Событие» → «Event».
  kindLabels?: Record<string, string>;
}) {
  const [shown, setShown] = useState(STEP);
  const sentinel = useRef<HTMLDivElement>(null);

  const total = items.length;
  const hasMore = shown < total;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setShown((n) => Math.min(n + STEP, total));
      },
      { rootMargin: "400px 0px" }, // догружаем заранее, не дожидаясь упора в низ
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, total]);

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
        {items.slice(0, shown).map((item) => (
          <NewsCard langPrefix={langPrefix} lang={lang} kindLabel={kindLabels?.[newsKind(item)]} key={item.id} item={item} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinel} className="flex flex-col items-center gap-3 mt-10">
          <button
            type="button"
            onClick={() => setShown((n) => Math.min(n + STEP, total))}
            className="font-ui font-bold text-[16px] text-white bg-accent rounded-[10px] px-7 py-3 border-none cursor-pointer hover:bg-[rgb(150,46,3)] transition-colors"
          >
            Показать ещё
          </button>
          <div className="font-ui text-[15px] text-ink-3">
            Показано {shown} из {total}
          </div>
        </div>
      )}
    </>
  );
}
