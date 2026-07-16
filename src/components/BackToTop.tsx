"use client";

import { useEffect, useState } from "react";

// Кнопка «Наверх». В макетах её нет — сделана в языке дизайн-системы.
// Появляется, только когда есть куда возвращаться (прокрутили больше экрана),
// иначе мозолила бы глаза на коротких страницах.
// Показываем и на мобиле: жест «в начало» есть только на iPhone (тап по
// строке состояния), на Android его нет вовсе — а после страницы со 120
// файлами листать вверх руками невыносимо. На мобиле поднята над нижней
// панелью (56px), чтобы не перекрывать её.
const SHOW_AFTER = 700;

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    // Уважаем системную настройку «уменьшить движение»: для тех, кому от
    // плавной прокрутки плохо, прыгаем сразу.
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Наверх"
      title="Наверх"
      className="fixed right-4 max-[768px]:bottom-[68px] bottom-6 min-[769px]:right-6 z-40 flex items-center gap-2 font-ui font-bold text-[15px] text-brand bg-white border border-line-strong rounded-full pl-3 pr-4 py-[10px] shadow-[0_6px_20px_rgba(15,40,70,0.16)] cursor-pointer hover:border-accent hover:text-accent transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
      Наверх
    </button>
  );
}
