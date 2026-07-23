"use client";

import { createContext, useContext, useEffect } from "react";
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

  // <html lang> проставляется после сборки, по адресу страницы. При переходе
  // внутри сайта разметка не перезагружается, и атрибут остаётся от прежней
  // страницы: скринридер продолжает читать английский текст по-русски. Держим
  // его в соответствии с текущим адресом.
  useEffect(() => {
    if (document.documentElement.lang !== locale) document.documentElement.lang = locale;
  }, [locale]);

  return <LocaleCtx.Provider value={{ locale, translatedPaths }}>{children}</LocaleCtx.Provider>;
}

export function useLocaleCtx(): Ctx {
  return useContext(LocaleCtx);
}

// Приводит внутренний адрес к текущему языку.
//   • внешние адреса, якоря, mailto/tel — не трогаем;
//   • адрес, уже начинающийся с языка (/en/…), не префиксуем повторно;
//   • остальное префиксуем БЕЗУСЛОВНО: у каждой русской страницы есть языковая
//     пара, поэтому в 404 упереться нельзя. Раньше здесь была проверка «есть ли
//     перевод», из-за неё часть ссылок уводила на русский адрес и язык терялся.
export function localizeHref(href: string, locale: Locale): string {
  if (locale === SOURCE_LOCALE) return href;
  if (!href.startsWith("/")) return href;
  if (/^\/(en|kk)(\/|$)/.test(href)) return href;
  const path = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  return path === "/" ? `/${locale}` : `/${locale}${href}`;
}
