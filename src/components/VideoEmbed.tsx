"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";
import { parseVideo, type Video } from "@/lib/video";

// Единый плеер для всего сайта: своё (mp4 с нашего хранилища), VK, RuTube.
// Показывает обложку с кнопкой ▶, а сам плеер грузит ТОЛЬКО по клику.
//
// Почему по клику. Встраивание VK/RuTube тянет их скрипты и куки — грузить их
// до того, как человек нажал play, значит поставить трекер без спроса (для
// сайта с политикой ПДн это подлог, тот же принцип, что у карты на контактах).
// Свой файл трекеров не тянет, но и тяжёлое видео незачем грузить до клика.

export function VideoEmbed({
  video,
  poster,
  title,
  className = "",
}: {
  /** Ссылка на видео (vk/rutube/mp4) или готовый объект Video. */
  video: string | Video;
  poster?: string;
  title?: string;
  className?: string;
}) {
  const [play, setPlay] = useState(false);
  const v = parseVideo(video, poster, title);
  if (!v) return null; // не распознали источник — молча ничего не показываем

  const cover = v.poster ? (v.poster.startsWith("http") ? v.poster : asset(v.poster)) : undefined;
  const label = v.title;

  // 16:9, скругление, обрезка — общий контейнер и для фасада, и для плеера.
  const box = `relative w-full aspect-video rounded-xl overflow-hidden border border-line bg-black ${className}`;

  if (play) {
    if (v.kind === "file") {
      // Свой плеер — нативный <video> с обложкой. Кастомный UI можно навесить
      // позже; нативные controls дают доступность и работу без чужих скриптов.
      return (
        <video
          src={v.src.startsWith("http") ? v.src : asset(v.src)}
          poster={cover}
          controls
          autoPlay
          playsInline
          className={box}
        />
      );
    }
    return (
      <div className={box}>
        <iframe
          src={`${v.src}${v.src.includes("?") ? "&" : "?"}autoplay=1`}
          title={label || "Видео"}
          loading="lazy"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  // Фасад: обложка (или тёмный градиент) + кнопка воспроизведения.
  const external = v.kind !== "file";
  return (
    <figure className="m-0 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setPlay(true)}
        aria-label={label ? `Смотреть: ${label}` : "Воспроизвести видео"}
        className={`${box} group cursor-pointer`}
        style={
          cover
            ? { backgroundImage: `url('${cover}')`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "linear-gradient(160deg, rgb(0,101,155), rgb(0,60,95))" }
        }
      >
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-[68px] h-[68px] rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-colors">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="rgb(0,101,155)" className="ml-[3px]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
        {label && (
          <span className="absolute left-0 right-0 bottom-0 px-4 py-3 text-white text-[15px] font-bold bg-gradient-to-t from-black/70 to-transparent text-left">
            {label}
          </span>
        )}
      </button>
      {external && (
        <figcaption className="text-[13px] text-ink-3">
          Видео откроется во встроенном плеере {v.kind === "vk" ? "VK" : "RuTube"} — он загрузит свои
          скрипты и файлы cookie.
        </figcaption>
      )}
    </figure>
  );
}
