// Языки сайта. Русский — оригинал: он лежит в корне (/novosti, /sveden), его
// адреса не меняются. Переводы живут отдельными ветками (/en/…, /kk/…), чтобы
// действующие ссылки и поисковая выдача не поехали.
export const SOURCE_LOCALE = "ru";
export const TARGET_LOCALES = ["en", "kk"] as const;

export type TargetLocale = (typeof TARGET_LOCALES)[number];
export type Locale = typeof SOURCE_LOCALE | TargetLocale;

export const LOCALE_NAMES: Record<Locale, { native: string; code: string }> = {
  ru: { native: "Русский", code: "РУС" },
  en: { native: "English", code: "ENG" },
  kk: { native: "Қазақша", code: "ҚАЗ" },
};

export function isTargetLocale(v: string): v is TargetLocale {
  return (TARGET_LOCALES as readonly string[]).includes(v);
}

// Адрес той же страницы на другом языке. Русский — корень, остальные — префикс.
export function localeHref(path: string, locale: Locale): string {
  const clean = path.replace(/^\/(en|kk)(?=\/|$)/, "") || "/";
  return locale === SOURCE_LOCALE ? clean : `/${locale}${clean === "/" ? "" : clean}`;
}
