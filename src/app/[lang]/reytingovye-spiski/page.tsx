import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RuPage from "@/app/reytingovye-spiski/page";
import { TARGET_LOCALES, isTargetLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/alternates";
import { t } from "@/lib/i18n/t";

// Рейтинговые списки на другом языке: ТА ЖЕ страница, что русская, только с
// переведёнными подписями — она сама принимает lang.
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
  return { title: t("Рейтинговые списки", lang), alternates: alternatesFor("/reytingovye-spiski", lang) };
}

export default async function Mirror({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isTargetLocale(lang)) notFound();
  return <RuPage lang={lang} />;
}
