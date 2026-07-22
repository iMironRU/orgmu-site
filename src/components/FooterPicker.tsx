"use client";

import { usePathname } from "next/navigation";
import { TARGET_LOCALES } from "@/lib/i18n/config";

// Выбирает язык подвала по адресу. Отдельный клиентский компонент нужен потому,
// что подвал рендерит корневой layout, а он про локаль страницы не знает —
// сегмент [lang] лежит глубже. Сам подвал остаётся серверным: сюда приходит
// уже готовая разметка на всех языках, клиент только показывает нужную.
export function FooterPicker({
  variants,
}: {
  variants: Record<string, React.ReactNode>;
}) {
  const pathname = usePathname() || "/";
  const locale =
    TARGET_LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ?? "ru";
  return <>{variants[locale] ?? variants.ru}</>;
}
