import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SvedenPage } from "@/components/sveden/SvedenPage";
import { TARGET_LOCALES, isTargetLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/alternates";

// Зеркало sveden. Переводятся ТОЛЬКО подписи разделов и полей — структура.
// Юридические значения (наименования, реквизиты, даты) и документы остаются
// русскими: переводить официальные формулировки Рособрнадзора мы сознательно
// не беремся, а переведённый заголовок над русским документом вводил бы в
// заблуждение.
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
  return <SvedenPage sectionKey="common" locale={lang} />;
}
