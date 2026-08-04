"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

// Просмотрщик файла прямо на сайте: PDF рендерит встроенным просмотрщиком
// браузера (<iframe>), картинки — <img>. Внутри — «Скачать» и «Открыть в новой
// вкладке». Открывается по клику на файл в DocCard; офисные форматы браузер сам
// не рисует — для них просмотра нет, только скачивание (см. previewKind).
//
// Файлы лежат на orgma.ru (сервер того же вуза), CORS не нужен: <iframe>/<img>
// показывают их и с другого origin, а X-Frame-Options orgma.ru не шлёт.

export type PreviewKind = "pdf" | "image";

const IMAGE_FMTS = ["JPG", "JPEG", "PNG", "GIF", "WEBP", "BMP", "SVG", "AVIF"];

// Формат → можно ли показать встроенно. null — только скачивание.
export function previewKind(fmt?: string, href?: string): PreviewKind | null {
  const ext = href ? (href.split(/[?#]/)[0].split(".").pop() || "").toUpperCase() : "";
  const f = (fmt || "").toUpperCase() || ext;
  if (f === "PDF") return "pdf";
  if (IMAGE_FMTS.includes(f) || IMAGE_FMTS.includes(ext)) return "image";
  return null;
}

function IconBtn({ label, href, download, onClick, children }: {
  label: string;
  href?: string;
  download?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const cls =
    "inline-flex items-center gap-2 h-9 px-3 rounded-lg font-ui font-bold text-[14px] text-white/95 bg-white/15 hover:bg-white/25 transition-colors cursor-pointer no-underline";
  return href ? (
    <a href={href} download={download} target={download ? undefined : "_blank"} rel="noopener noreferrer" aria-label={label} className={cls}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {children}
    </button>
  );
}

export function FileViewer({
  href,
  name,
  kind,
  onClose,
}: {
  href: string;
  name: string;
  kind: PreviewKind;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // блокируем прокрутку фона
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const node = (
    <div
      // z выше cookie-баннера сайта (z-1000), иначе он налезает на просмотрщик.
      className="fixed inset-0 z-[1100] flex flex-col bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-label={`Просмотр: ${name}`}
      onClick={onClose}
    >
      {/* Шапка просмотрщика */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-brand text-white shrink-0 max-[768px]:px-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex-1 min-w-0 truncate font-ui font-bold text-[15px] px-1">{name}</span>

        <IconBtn label="Скачать файл" href={href} download>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
          <span className="max-[560px]:hidden">Скачать</span>
        </IconBtn>

        <IconBtn label="Открыть в новой вкладке" href={href}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></svg>
          <span className="max-[560px]:hidden">В новой вкладке</span>
        </IconBtn>

        <IconBtn label="Закрыть просмотр" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </IconBtn>
      </div>

      {/* Тело */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 md:p-5" onClick={(e) => e.stopPropagation()}>
        {kind === "pdf" ? (
          <iframe src={href} title={name} className="w-full h-full bg-white rounded-lg border-0" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={href} alt={name} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        )}
      </div>
    </div>
  );

  // Портал в body — чтобы модалка не зависела от stacking-context карточки.
  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
