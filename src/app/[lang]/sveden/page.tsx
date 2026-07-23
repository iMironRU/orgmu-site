import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RuPage from "@/app/sveden/page";
import { TARGET_LOCALES, isTargetLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/alternates";

// Зеркало русской страницы под языковым адресом. Содержимое то же самое
// (перевода у раздела нет), но адрес несёт язык — значит шапка, крошки и
// переключатель остаются на языке, ссылку можно передать, и язык не теряется.
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
  // canonical — на русскую версию: содержимое идентично, и поисковик не должен
  // считать это отдельной страницей.
  return { alternates: { ...alternatesFor("/sveden", lang), canonical: "/sveden" } };
}

export default async function Mirror({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isTargetLocale(lang)) notFound();
  return <RuPage />;
}
