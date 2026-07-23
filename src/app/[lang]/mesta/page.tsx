import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RuPage from "@/app/mesta/page";
import { TARGET_LOCALES, isTargetLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/alternates";
import { t } from "@/lib/i18n/t";

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
  return { title: t("Места осуществления образовательной деятельности", lang), alternates: alternatesFor("/mesta", lang) };
}

export default async function Mirror({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isTargetLocale(lang)) notFound();
  return <RuPage lang={lang} />;
}
