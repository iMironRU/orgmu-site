"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "orgma-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "1");
    } catch {
      // приватный режим — просто скрываем
    }
    setVisible(false);
  };

  return (
    <div className="fixed left-4 right-4 bottom-4 z-[1000] flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-4 flex-wrap max-w-[640px] w-full bg-white border border-line rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.10)] px-[18px] py-[14px] font-ui">
        <div className="flex-1 min-w-[260px] text-[14px] leading-[1.45] text-ink-2">
          Мы используем файлы cookie для корректной работы сайта. Продолжая
          пользоваться сайтом, вы соглашаетесь с{" "}
          <Link href="#" className="text-brand underline hover:text-brand-strong">
            политикой обработки данных
          </Link>
          .
        </div>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 cursor-pointer border-none bg-brand text-white font-ui font-bold text-[14px] px-[18px] py-[9px] rounded-lg transition-colors hover:bg-brand-strong"
        >
          Хорошо
        </button>
      </div>
    </div>
  );
}
