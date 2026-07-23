"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TARGET_LOCALES, SOURCE_LOCALE, type Locale } from "@/lib/i18n/config";
import { localeFromPath } from "@/lib/i18n/use-locale";

// Полоса «сайт есть на вашем языке». ПРЕДЛАГАЕТ, а не перебрасывает.
//
// Почему не автоматический переход. Во-первых, у нас полно русскоязычных с
// английским интерфейсом браузера — их выбрасывало бы на английскую версию
// сайта родного вуза, которая содержательно беднее. Во-вторых, присланная
// коллегой ссылка на /novosti — осознанный выбор человека, и подменять его
// догадкой браузера неправильно. В-третьих, поисковые роботы ходят с разными
// настройками, и автоперенаправление путает индексацию.
//
// Показывается один раз: закрыл или переключился — больше не возвращается.
const DISMISS_KEY = "orgmu-lang-suggested";

const S: Record<string, { text: string; go: string; dismiss: string }> = {
  en: {
    text: "This site is available in English.",
    go: "Switch to English",
    dismiss: "Stay in Russian",
  },
  kk: {
    text: "Бұл сайт қазақ тілінде де қолжетімді.",
    go: "Қазақ тіліне ауысу",
    dismiss: "Орыс тілінде қалу",
  },
};

export function LanguageSuggestion() {
  const pathname = usePathname() || "/";
  const [suggest, setSuggest] = useState<Locale | null>(null);

  useEffect(() => {
    // Уже на языковом адресе — предлагать нечего.
    if (localeFromPath(pathname)) return;
    try {
      if (window.localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      return; // приватный режим — молчим, чтобы не навязываться каждый раз
    }
    // navigator.language вида «en-US» / «kk-KZ»; Accept-Language нам недоступен,
    // его читает только сервер, а у нас статика.
    const langs = [navigator.language, ...(navigator.languages ?? [])]
      .filter(Boolean)
      .map((l) => l.toLowerCase().split("-")[0]);
    if (langs.includes(SOURCE_LOCALE)) return; // русский знает — предлагать незачем
    const hit = TARGET_LOCALES.find((l) => langs.includes(l));
    if (hit) setSuggest(hit as Locale);
  }, [pathname]);

  const close = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* приватный режим */
    }
    setSuggest(null);
  };

  if (!suggest) return null;
  const s = S[suggest];

  return (
    <div className="bg-brand text-white" data-a11y-surface="brand">
      <div className="mx-auto max-w-[1146px] px-10 py-3 box-border max-[768px]:px-5 flex items-center gap-4 flex-wrap font-ui">
        <span className="shrink-0 flex" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
          </svg>
        </span>
        <span className="flex-1 min-w-[200px] text-[15px]">{s.text}</span>
        {/* Обычная ссылка, а не наш Link: тут нужен переход именно на языковой
            адрес, без дополнительного префиксования. */}
        <a
          href={`/${suggest}${pathname === "/" ? "" : pathname}`}
          onClick={close}
          className="shrink-0 font-bold text-[15px] text-brand bg-white rounded-lg px-4 py-2 no-underline hover:bg-white/90 transition-colors"
        >
          {s.go}
        </a>
        <button
          type="button"
          onClick={close}
          className="shrink-0 text-[14px] text-white/80 bg-transparent border-none cursor-pointer underline hover:text-white"
        >
          {s.dismiss}
        </button>
      </div>
    </div>
  );
}
