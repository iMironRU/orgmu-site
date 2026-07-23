"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SOURCE_LOCALE, TARGET_LOCALES, type Locale } from "./config";

const KEY = "orgmu-lang";

export function localeFromPath(pathname: string): Locale | null {
  return (TARGET_LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ??
    null) as Locale | null;
}

// Выбранный язык. Адрес главнее памяти: если человек открыл /en/…, это и есть
// его язык. Но когда он уходит на страницу без перевода (у неё русский адрес),
// выбор не должен пропадать — иначе меню молча возвращается к русскому и язык
// приходится переключать заново. Поэтому запоминаем.
//
// Первый рендер всегда отдаёт язык из адреса: он должен совпасть с тем, что
// пришло с сервера, иначе React ругается на расхождение гидратации. Память
// применяется уже после монтирования.
export function usePreferredLocale(): Locale {
  const pathname = usePathname() || "/";
  const fromUrl = localeFromPath(pathname);
  const [stored, setStored] = useState<Locale | null>(null);

  useEffect(() => {
    if (fromUrl) {
      // Пришли по языковому адресу — запоминаем выбор.
      try {
        window.localStorage.setItem(KEY, fromUrl);
      } catch {
        // приватный режим — переживём, просто не запомним
      }
      setStored(fromUrl);
      return;
    }
    try {
      const saved = window.localStorage.getItem(KEY);
      setStored(saved && TARGET_LOCALES.includes(saved as never) ? (saved as Locale) : null);
    } catch {
      setStored(null);
    }
  }, [fromUrl, pathname]);

  return fromUrl ?? stored ?? (SOURCE_LOCALE as Locale);
}
