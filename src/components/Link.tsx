"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocaleCtx, localizeHref } from "@/lib/i18n/LocaleContext";

// ЕДИНСТВЕННАЯ ссылка, которой пользуется сайт. Импортировать next/link
// напрямую больше нельзя: тогда адрес не узнает о выбранном языке, и переход
// молча выбросит человека на русскую версию — так и случилось с логотипом,
// хлебными крошками и кнопками карточек.
//
// Здесь один раз решается, нужен ли языковой префикс. Любая новая ссылка в
// проекте получает это поведение даром, ничего не зная про языки.
export function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const { locale } = useLocaleCtx();
  const raw = typeof href === "string" ? href : null;
  return <NextLink href={raw ? localizeHref(raw, locale) : href} {...rest} />;
}

export default Link;
