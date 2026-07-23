import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RuPage, { generateStaticParams as ruParams } from "@/app/programmy/[id]/page";
import { TARGET_LOCALES, isTargetLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/alternates";

// Зеркало русской страницы под языковым адресом. Список адресов берём у самой
// русской страницы — второго источника правды заводить нельзя.
export const dynamicParams = false;
export function generateStaticParams() {
  return TARGET_LOCALES.flatMap((lang) => ruParams().map((p) => ({ lang, ...p })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isTargetLocale(lang)) return {};
  const ru = `/programmy/${id}`;
  return { alternates: { ...alternatesFor(ru, lang), canonical: ru } };
}

export default async function Mirror({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isTargetLocale(lang)) notFound();
  return <RuPage params={Promise.resolve({ id })} />;
}
