// Разбор ссылки на видео в единый вид. Источник определяется по URL, поэтому и
// скрапер, и редактор в yml дают просто ссылку — остальное решает код.
//
// Поддержано:
//   • свой файл (mp4/webm с нашего хранилища/S3) — нативный плеер <video>;
//   • VK Video — vk.com/video-123_456 или ссылка video_ext.php;
//   • RuTube — rutube.ru/video/HASH/ или play/embed/HASH.
//
// Стороннее видео (VK/RuTube) встраивается iframe и тянет куки/скрипты
// платформы, поэтому в компоненте оно грузится ТОЛЬКО по клику (фасад), как
// карта на контактах. Свой файл трекеров не тянет — но фасад полезен и ему
// (не грузить тяжёлое видео до клика).

export type VideoKind = "file" | "vk" | "rutube";

export type Video = {
  kind: VideoKind;
  /** Для file — прямая ссылка на файл; для vk/rutube — src для iframe. */
  src: string;
  /** Обложка-превью (необязательна). */
  poster?: string;
  /** Подпись/название. */
  title?: string;
};

function vkEmbed(url: string): string | null {
  // vk.com/video-123456_654321  |  vk.com/video_ext.php?oid=-123456&id=654321
  const ext = url.match(/video_ext\.php\?([^#]+)/);
  if (ext) return `https://vk.com/video_ext.php?${ext[1]}${/hd=/.test(ext[1]) ? "" : "&hd=2"}`;
  const m = url.match(/vk(?:video)?\.(?:com|ru)\/video(-?\d+)_(\d+)/);
  if (m) return `https://vk.com/video_ext.php?oid=${m[1]}&id=${m[2]}&hd=2`;
  return null;
}

function rutubeEmbed(url: string): string | null {
  // rutube.ru/video/HASH/  |  rutube.ru/play/embed/HASH
  const m = url.match(/rutube\.ru\/(?:video(?:\/private)?|play\/embed)\/([0-9a-f]{20,})/i);
  return m ? `https://rutube.ru/play/embed/${m[1]}` : null;
}

/** Ссылка → Video, либо null если не распознано. */
export function parseVideo(input: string | Video, poster?: string, title?: string): Video | null {
  if (typeof input !== "string") return input;
  const url = input.trim();
  if (!url) return null;

  const vk = vkEmbed(url);
  if (vk) return { kind: "vk", src: vk, poster, title };

  const rt = rutubeEmbed(url);
  if (rt) return { kind: "rutube", src: rt, poster, title };

  // Свой файл: по расширению. Хостинг — наш (S3/сервер вуза), не сторонний.
  if (/\.(mp4|webm|ogv)(\?|#|$)/i.test(url)) return { kind: "file", src: url, poster, title };

  return null;
}

/** Домены, которые должен разрешить CSP для iframe-встраивания. */
export const VIDEO_FRAME_HOSTS = ["https://vk.com", "https://rutube.ru"];
