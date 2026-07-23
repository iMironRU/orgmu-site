import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getPageSlugs } from "@/lib/content/pages";
import { ContentPage } from "@/components/ContentPage";
import { TranslationNotice } from "@/components/TranslationNotice";
import { TARGET_LOCALES, isTargetLocale } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { alternatesFor } from "@/lib/i18n/alternates";

// Переводы типовых страниц: /en/<slug>, /kk/<slug>. Русские адреса (/antiterror)
// не меняются — переводы лежат отдельной веткой, поэтому действующие ссылки и
// поисковая выдача не поедут.
//
// dynamicParams: false + перечисленные параметры — маршрут ловит ТОЛЬКО
// известные пары «язык + страница», а не любой первый сегмент адреса.
const GROUP = "info";

export const dynamicParams = false;

export function generateStaticParams() {
  return TARGET_LOCALES.flatMap((lang) =>
    getPageSlugs(GROUP).map((slug) => ({ lang, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = getPage(GROUP, slug);
  if (!p || !isTargetLocale(lang)) return {};
  const { data } = translateData(p, lang);
  return { title: data.title, description: data.lead, alternates: alternatesFor(`/${slug}`, lang) };
}

export default async function TranslatedPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isTargetLocale(lang)) notFound();
  const page = getPage(GROUP, slug);
  if (!page) notFound();

  // Переводим ДАННЫЕ, а не компонент: ContentPage получает привычную структуру,
  // просто на другом языке, и о переводе ничего не знает.
  const { data, machine } = translateData(page, lang);

  return (
    <ContentPage
      page={data}
      notice={
        machine ? <TranslationNotice lang={lang} originalHref={`/${slug}`} /> : null
      }
    />
  );
}
