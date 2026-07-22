import type { Metadata } from "next";
import Link from "next/link";
import { getAllNews } from "@/lib/content/news";
import { toCardItem } from "@/lib/content/news-types";
import { NewsListView } from "@/components/NewsListView";
import { TranslationNotice } from "@/components/TranslationNotice";
import { TARGET_LOCALES, isTargetLocale } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { t } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

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
  return { title: t("Новости и события", lang) };
}

export default async function TranslatedNewsList({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isTargetLocale(lang)) notFound();

  // Срез для карточек — без тела статей и галерей, как в русской версии.
  const { data: news, machine } = translateData(getAllNews().map(toCardItem), lang);

  return (
    <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 max-[768px]:pt-6">
      <div className="flex items-center gap-2 text-[15px] text-ink-3 mb-5 flex-wrap font-ui">
        <Link href={`/${lang}`} className="text-accent no-underline">{t("Главная", lang)}</Link>
        <span>/</span>
        <span className="text-ink-2">{t("Новости", lang)}</span>
      </div>

      <h1 className="m-0 mb-6 font-display font-bold text-[40px] text-brand max-[768px]:text-[30px]">
        {t("Новости и события", lang)}
      </h1>

      {machine && (
        <div className="mb-6">
          <TranslationNotice lang={lang} originalHref="/novosti" />
        </div>
      )}

      {news.length === 0 ? (
        <p className="text-steel font-ui text-[18px]">{t("Новостей пока нет.", lang)}</p>
      ) : (
        <NewsListView items={news} langPrefix={`/${lang}`} />
      )}
    </main>
  );
}
