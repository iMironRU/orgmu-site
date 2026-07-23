import type { Metadata } from "next";
import { SOURCE_LOCALE, TARGET_LOCALES } from "./config";

// Теги hreflang: говорят поисковику, что /novosti, /en/novosti и /kk/novosti —
// одна и та же страница на разных языках. Без них Google не связывает версии и
// англоязычному пользователю показывает русскую страницу — то есть иностранный
// абитуриент, ради которого всё и делается, просто не найдёт английскую версию.
//
// path — адрес РУССКОЙ версии, всегда со слэша: "/novosti", "/antiterror".
// x-default — куда вести, если язык пользователя не совпал ни с одним: русская
// версия, она полная и первоисточник.
export function alternates(path: string): Metadata["alternates"] {
  const ru = path === "/" ? "/" : path;
  const languages: Record<string, string> = { [SOURCE_LOCALE]: ru };
  for (const l of TARGET_LOCALES) {
    languages[l] = ru === "/" ? `/${l}` : `/${l}${ru}`;
  }
  languages["x-default"] = ru;
  return { canonical: ru, languages };
}

// То же самое для страницы перевода: canonical указывает на неё саму, а список
// языков общий — он одинаков для всех версий одной страницы.
export function alternatesFor(path: string, locale: string): Metadata["alternates"] {
  const base = alternates(path)!;
  return { ...base, canonical: locale === SOURCE_LOCALE ? path : `/${locale}${path === "/" ? "" : path}` };
}
