import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug, getNewsSlugs } from "@/lib/content/news";
import { formatDate, newsKind, kindStyle } from "@/lib/content/news-types";
import { NewsGallery } from "@/components/NewsGallery";
import { TranslationNotice } from "@/components/TranslationNotice";
import { TARGET_LOCALES, isTargetLocale } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { t } from "@/lib/i18n/t";

export const dynamicParams = false;

export function generateStaticParams() {
  return TARGET_LOCALES.flatMap((lang) => getNewsSlugs().map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item || !isTargetLocale(lang)) return {};
  const { data } = translateData(item, lang);
  return { title: data.title, description: data.excerpt };
}

export default async function TranslatedArticle({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isTargetLocale(lang)) notFound();
  const src = getNewsBySlug(slug);
  if (!src) notFound();

  const { data: item, machine } = translateData(src, lang);
  const k = kindStyle(newsKind(item));
  const images = [
    ...(item.cover?.remote ? [item.cover.remote] : []),
    ...item.gallery.map((g) => g.remote),
  ];

  return (
    <main className="mx-auto max-w-[900px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5">
      <div className="flex items-center gap-2 text-[15px] text-ink-3 mb-5 flex-wrap font-ui">
        <Link href={`/${lang}`} className="text-accent no-underline">{t("Главная", lang)}</Link>
        <span>/</span>
        <Link href={`/${lang}/novosti`} className="text-accent no-underline">{t("Новости", lang)}</Link>
      </div>

      <div className="flex items-center gap-3 mb-3 font-ui flex-wrap">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.04em] rounded-md px-2 py-[3px]"
          style={{ color: k.color, background: k.bg }}
        >
          {t(k.label, lang)}
        </span>
        <span className="text-[15px] text-ink-3">{formatDate(item.published_at, lang)}</span>
      </div>

      <h1 className="m-0 mb-5 font-display font-bold text-[38px] leading-[1.12] text-brand max-[768px]:text-[27px]">
        {item.title}
      </h1>

      {machine && (
        <div className="mb-6">
          <TranslationNotice lang={lang} originalHref={`/novosti/${slug}`} />
        </div>
      )}

      {images.length > 0 && <NewsGallery images={images} caption={`${t("Фото", lang)}: ${item.author}`} />}

      <div
        className="font-ui text-[19px] leading-[1.7] text-ink [&_p]:mb-4 [&_a]:text-accent"
        dangerouslySetInnerHTML={{ __html: item.body_html }}
      />
    </main>
  );
}
