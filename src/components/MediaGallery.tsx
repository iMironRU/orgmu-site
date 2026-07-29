"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { parseVideo, type Video } from "@/lib/video";
import { VideoEmbed } from "@/components/VideoEmbed";

// Слайдер медиа: фото и видео в одном потоке. Внизу — лента миниатюр (вариант
// А): видео помечено значком ▶, сразу видно, где что. Крупный видео-слайд —
// через VideoEmbed (фасад с обложкой, плеер грузится по клику): при уходе со
// слайда он размонтируется и воспроизведение прекращается.
//
// items — ссылки (фото-URL или vk/rutube/mp4) вперемешку. Строка, которую
// parseVideo распознал как видео, становится видео-слайдом, остальное — фото.

const SWIPE_PX = 40;

type Slide = { kind: "image"; src: string } | { kind: "video"; video: Video };

function toSlide(item: string | Video): Slide {
  const v = parseVideo(item);
  if (v) return { kind: "video", video: v };
  const src = typeof item === "string" ? item : "";
  return { kind: "image", src: src.startsWith("http") ? src : asset(src) };
}

// Обложка миниатюры: у фото — само фото, у видео — его poster (или ничего).
function thumbCover(s: Slide): string | undefined {
  if (s.kind === "image") return s.src;
  const p = s.video.poster;
  return p ? (p.startsWith("http") ? p : asset(p)) : undefined;
}

export function MediaGallery({
  items,
  caption,
  contain = false,
}: {
  items: (string | Video)[];
  caption?: string;
  contain?: boolean;
}) {
  const slides = items.map(toSlide);
  const [i, setI] = useState(0);
  const count = slides.length;
  const touch = useRef<{ x: number; y: number } | null>(null);
  const go = (next: number) => setI((next + count) % count);

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
  const cur = slides[i];

  return (
    <figure className="m-0 mb-7">
      {/* Крупный слайд. Стрелки/свайп ставим на контейнер, но у видео плеер
          перекрывает их своей областью — листать удобнее по миниатюрам. */}
      <div
        className={`relative w-full rounded-xl overflow-hidden touch-pan-y select-none ${
          contain ? "bg-[rgb(245,247,249)] border border-line" : "bg-line"
        }`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {cur.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cur.src}
            alt=""
            draggable={false}
            className={
              contain
                ? "w-full aspect-[3/2] object-contain block"
                : "w-full h-[300px] min-[768px]:h-[460px] object-cover block"
            }
          />
        ) : (
          // key по индексу — при смене слайда VideoEmbed пересоздаётся и
          // воспроизведение прекращается.
          <VideoEmbed key={i} video={cur.video} className="rounded-none border-0" />
        )}

        {!single && cur.kind === "image" && (
          <>
            <button
              type="button"
              aria-label="Предыдущий слайд"
              onClick={() => go(i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/85 text-brand shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:bg-white transition-colors cursor-pointer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Следующий слайд"
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
        <figcaption className="text-[14px] text-ink-3 mt-[6px] px-0.5">{caption}</figcaption>
      )}

      {/* Лента миниатюр — навигация с меткой видео (вариант А). Скроллится по
          горизонтали, если слайдов много (в т.ч. на мобиле). */}
      {!single && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {slides.map((s, idx) => {
            const active = idx === i;
            const cover = thumbCover(s);
            const isVideo = s.kind === "video";
            return (
              <button
                type="button"
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`${isVideo ? "Видео" : "Фото"} ${idx + 1}`}
                aria-current={active}
                className="relative shrink-0 w-[84px] h-[56px] rounded-lg overflow-hidden cursor-pointer transition-all"
                style={{
                  outline: active ? "2px solid var(--c-accent)" : "1px solid var(--c-line)",
                  outlineOffset: active ? "0" : "-1px",
                  opacity: active ? 1 : 0.75,
                }}
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="w-full h-full object-cover block" draggable={false} />
                ) : (
                  <span className="block w-full h-full" style={{ background: "linear-gradient(160deg, rgb(0,101,155), rgb(0,60,95))" }} />
                )}
                {/* Метка видео: значок ▶ поверх миниатюры. */}
                {isVideo && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="rgb(0,101,155)"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </figure>
  );
}
