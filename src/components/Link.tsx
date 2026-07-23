"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocaleCtx, localizeHref } from "@/lib/i18n/LocaleContext";
import { localeHref, type Locale } from "@/lib/i18n/config";

// ЕДИНСТВЕННАЯ ссылка, которой пользуется сайт. Импортировать next/link
// напрямую больше нельзя: тогда адрес не узнает о выбранном языке, и переход
// молча выбросит человека на русскую версию — так и случилось с логотипом,
// хлебными крошками и кнопками карточек.
//
// Здесь один раз решается, нужен ли языковой префикс. Любая новая ссылка в
// проекте получает это поведение даром, ничего не зная про языки.
// locale — для переключателя языка: «этот же адрес, но на другом языке».
// Без него была ловушка: переключатель складывал адрес сам («/kontakty» для
// русского), а Link тут же возвращал текущий язык обратно — с /kk/kontakty
// кнопка «Русский» вела на /kk/kontakty. Теперь целевой язык говорится явно,
// и адрес собирается один раз, здесь же.
export function Link({
  href,
  locale: target,
  ...rest
}: ComponentProps<typeof NextLink> & { locale?: Locale }) {
  const { locale } = useLocaleCtx();
  const raw = typeof href === "string" ? href : null;
  if (!raw) return <NextLink href={href} {...rest} />;
  // localeHref сам снимает старый префикс, поэтому передавать можно любой адрес.
  return <NextLink href={target ? localeHref(raw, target) : localizeHref(raw, locale)} {...rest} />;
}

export default Link;
