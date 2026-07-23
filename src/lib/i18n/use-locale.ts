"use client";

import { usePathname } from "next/navigation";
import { SOURCE_LOCALE, TARGET_LOCALES, type Locale } from "./config";

export function localeFromPath(pathname: string): Locale | null {
  return (TARGET_LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ??
    null) as Locale | null;
}

// Язык страницы — ТОЛЬКО из адреса. Раньше он ещё запоминался в localStorage,
// потому что у части разделов не было языкового адреса и при переходе туда
// выбор терялся. Теперь у каждой русской страницы есть пара /en/… и /kk/…,
// поэтому память не нужна: адрес — единственный источник правды.
//
// Это важнее, чем кажется: два источника правды рано или поздно расходятся, и
// ссылкой с запомненным языком нельзя было поделиться — у получателя открывался
// русский. Плюс исчезло мигание (первый кадр приходил русским и «переобувался»
// после гидрации).
export function usePreferredLocale(): Locale {
  const pathname = usePathname() || "/";
  return localeFromPath(pathname) ?? (SOURCE_LOCALE as Locale);
}
