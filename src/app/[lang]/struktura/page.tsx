import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RuPage from "@/app/struktura/page";
import { TARGET_LOCALES, isTargetLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/alternates";

// Зеркало русской страницы под языковым адресом: содержимое то же (перевода у
// раздела пока нет), но адрес несёт язык — шапка, крошки и переключатель
// остаются на выбранном языке, ссылкой можно поделиться.
export const dynamicParams = false;
export function generateStaticParams() {
  return TARGET_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isTargetLocale(lang)) return {};
  // canonical на русскую версию: содержимое идентично, дублем считать не надо.
  return { alternates: { ...alternatesFor("/struktura", lang), canonical: "/struktura" } };
}

export default async function Mirror({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isTargetLocale(lang)) notFound();
  return <RuPage />;
}
