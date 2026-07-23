"use client";

import { createContext, useContext } from "react";
import { SOURCE_LOCALE, type Locale } from "./config";
import { usePreferredLocale } from "./use-locale";

// Единая точка знания о языке для всего клиента: какой язык выбран и какие
// разделы переведены. Провайдер ставится один раз в корневом layout.
type Ctx = { locale: Locale; translatedPaths: string[] };

const LocaleCtx = createContext<Ctx>({ locale: SOURCE_LOCALE as Locale, translatedPaths: [] });

export function LocaleProvider({
  translatedPaths,
  children,
}: {
  translatedPaths: string[];
  children: React.ReactNode;
}) {
  const locale = usePreferredLocale();
  return <LocaleCtx.Provider value={{ locale, translatedPaths }}>{children}</LocaleCtx.Provider>;
}

export function useLocaleCtx(): Ctx {
  return useContext(LocaleCtx);
}

// Приводит внутренний адрес к текущему языку. Правила:
//   • внешние адреса, якоря, mailto/tel — не трогаем;
//   • адрес, уже начинающийся с языка (/en/…), не префиксуем повторно;
//   • префикс ставим только если перевод РАЗДЕЛА существует — иначе повели бы
//     в 404. Язык при этом не теряется: он запомнен, и на русской странице
//     появится полоса-пояснение.
export function localizeHref(href: string, locale: Locale, translatedPaths: string[]): string {
  if (locale === SOURCE_LOCALE) return href;
  if (!href.startsWith("/")) return href;
  if (/^\/(en|kk)(\/|$)/.test(href)) return href;

  const path = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (path === "/") return `/${locale}`;
  const known = translatedPaths.some((p) => path === p || path.startsWith(`${p}/`));
  return known ? `/${locale}${href}` : href;
}
