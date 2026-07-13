"use client";

import { useEffect, useState } from "react";

// Слайдер фото статьи: крупный кадр + стрелки + счётчик + лента миниатюр.
// images — [обложка, ...галерея] (уже дедуплицированы). caption — подпись под кадром.
export function NewsGallery({
  images,
  caption,
}: {
  images: string[];
  caption?: string;
}) {
  const [i, setI] = useState(0);
  const count = images.length;

  const go = (next: number) => setI((next + count) % count);

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
      <div className="relative w-full rounded-xl overflow-hidden bg-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[i]}
          alt=""
          className="w-full h-[300px] min-[768px]:h-[460px] object-cover block"
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
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Фото ${idx + 1}`}
              className="shrink-0 rounded-lg overflow-hidden border-2 transition-[border-color] cursor-pointer"
              style={{ borderColor: idx === i ? "var(--c-accent)" : "transparent" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-[86px] h-16 object-cover block"
                style={{ opacity: idx === i ? 1 : 0.65 }}
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}
