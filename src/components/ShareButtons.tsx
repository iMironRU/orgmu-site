"use client";

import { useState } from "react";

// Блок «Поделиться» по макету Article.dc.html: ВКонтакте, Telegram, копировать ссылку.
export function ShareButtons({ title }: { title?: string }) {
  const [copied, setCopied] = useState(false);

  const share = (kind: "vk" | "tg") => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title ?? document.title);
    const link =
      kind === "vk"
        ? `https://vk.com/share.php?url=${url}`
        : `https://t.me/share/url?url=${url}&text=${text}`;
    window.open(link, "_blank", "noopener,noreferrer,width=640,height=480");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const btn =
    "flex items-center justify-center w-[42px] h-[42px] rounded-[10px] bg-brand text-white cursor-pointer border-none hover:bg-brand-strong transition-colors";

  return (
    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-line flex-wrap font-ui">
      <span className="font-bold text-[16px] text-ink-2">Поделиться:</span>
      <button type="button" title="ВКонтакте" aria-label="Поделиться во ВКонтакте" onClick={() => share("vk")} className={btn}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.9 16.6c-5 0-8.2-3.5-8.3-9.2h2.6c.1 4.2 2 6 3.5 6.4V7.4h2.4v3.6c1.5-.2 3-1.8 3.6-3.6h2.4c-.5 2.2-2.1 3.8-3.2 4.5 1.1.6 2.9 2 3.6 4.7h-2.7c-.5-1.7-1.9-3.1-3.7-3.2v3.2h-.2Z" />
        </svg>
      </button>
      <button type="button" title="Telegram" aria-label="Поделиться в Telegram" onClick={() => share("tg")} className={btn}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.9 5.3 18.9 19c-.2 1-.8 1.2-1.6.8l-4.4-3.3-2.1 2c-.24.24-.43.43-.88.43l.31-4.5 8.2-7.4c.36-.32-.08-.5-.55-.18L7.5 13.3l-4.4-1.4c-.95-.3-.97-.95.2-1.4L20.6 3.9c.8-.3 1.5.18 1.3 1.4Z" />
        </svg>
      </button>
      <button type="button" title="Скопировать ссылку" aria-label="Скопировать ссылку" onClick={copy} className={btn}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 15l6-6M8 12H6a3 3 0 0 1 0-6h3M16 6h2a3 3 0 0 1 0 6h-2" />
        </svg>
      </button>
      {copied && <span className="text-[14px] text-[rgb(30,160,80)] font-bold">Ссылка скопирована</span>}
    </div>
  );
}
