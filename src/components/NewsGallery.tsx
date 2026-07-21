"use client";

import { useEffect, useRef, useState } from "react";

// Порог свайпа: короче — считаем случайным касанием.
const SWIPE_PX = 40;

// Слайдер фото статьи: крупный кадр + стрелки + счётчик + лента миниатюр.
// images — [обложка, ...галерея] (уже дедуплицированы). caption — подпись под кадром.
export function NewsGallery({
  images,
  caption,
  contain = false,
}: {
  images: string[];
  caption?: string;
  // contain: вписывать кадр целиком, не обрезая. Для инфографики и карточек с
  // текстом — обрезка (object-cover) срезала бы половину смысла. Фон под
  // вписанным кадром светлый, соотношение 3:2 под ландшафтные карточки.
  contain?: boolean;
}) {
  const [i, setI] = useState(0);
  const count = images.length;
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = (next: number) => setI((next + count) % count);

  // Листание пальцем. Реагируем только на горизонтальный жест — иначе
  // перехватили бы вертикальную прокрутку страницы (за это же отвечает
  // touch-action: pan-y на контейнере).
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || count < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) <= Math.abs(dy)) return;
    go(dx < 0 ? i + 1 : i - 1);
  };

  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(i - 1);
      if (e.key === "ArrowRight") go(i + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, count]);

  if (count === 0) return null;

  const single = count === 1;

  return (
    <figure className="m-0 mb-7">
      <div
        className={`relative w-full rounded-xl overflow-hidden touch-pan-y select-none ${
          contain ? "bg-[rgb(245,247,249)] border border-line" : "bg-line"
        }`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[i]}
          alt=""
          draggable={false}
          className={
            contain
              ? "w-full aspect-[3/2] object-contain block"
              : "w-full h-[300px] min-[768px]:h-[460px] object-cover block"
          }
        />

        {!single && (
          <>
            <button
              type="button"
              aria-label="Предыдущее фото"
              onClick={() => go(i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/85 text-brand shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:bg-white transition-colors cursor-pointer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Следующее фото"
              onClick={() => go(i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/85 text-brand shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:bg-white transition-colors cursor-pointer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>

            <span className="absolute top-3 right-3 text-[13px] font-bold text-white bg-black/45 rounded-full px-3 py-1 tabular-nums">
              {i + 1} / {count}
            </span>
          </>
        )}
      </div>

      {caption && (
        <figcaption className="text-[14px] text-ink-3 mt-[6px] px-0.5">
          {caption}
        </figcaption>
      )}

      {!single && (
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {images.map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Фото ${idx + 1}`}
              aria-current={idx === i}
              className="h-2.5 rounded-full transition-all cursor-pointer"
              style={{
                width: idx === i ? "26px" : "10px",
                background: idx === i ? "var(--c-accent)" : "var(--c-line-strong)",
              }}
            />
          ))}
        </div>
      )}
    </figure>
  );
}
