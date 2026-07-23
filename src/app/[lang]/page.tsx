import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPage, getPageSlugs } from "@/lib/content/pages";
import { TranslationNotice } from "@/components/TranslationNotice";
import { TARGET_LOCALES, isTargetLocale, LOCALE_NAMES } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { alternatesFor } from "@/lib/i18n/alternates";
import { t } from "@/lib/i18n/t";

// Языковая главная. Нужна не «для красоты»: переключатель с любой русской
// страницы, у которой нет перевода, ведёт сюда — иначе человек попадал бы в 404.
// Здесь честно перечислено то, что уже есть на его языке.
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
  return { title: `${LOCALE_NAMES[lang].native} · ОрГМУ`, alternates: alternatesFor("/", lang) };
}

export default async function LocaleHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isTargetLocale(lang)) notFound();

  const pages = getPageSlugs("info")
    .map((slug) => {
      const p = getPage("info", slug);
      if (!p) return null;
      const { data } = translateData(p, lang);
      return { slug, title: data.title, lead: data.lead };
    })
    .filter((x) => x !== null);

  return (
    <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 font-ui">
      <h1 className="m-0 mb-3 font-display font-bold text-[40px] text-brand max-[768px]:text-[30px]">
        Orenburg State Medical University
      </h1>
      <p className="m-0 mb-6 text-[18px] text-steel max-w-[760px]">
        {LOCALE_NAMES[lang].native}
      </p>

      <div className="mb-8 max-w-[860px]">
        <TranslationNotice lang={lang} originalHref="/" />
      </div>

      <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">
        {t("Новости и события", lang)}
      </h2>
      <Link
        href={`/${lang}/novosti`}
        className="inline-block mb-9 font-bold text-[17px] text-accent no-underline hover:underline"
      >
        {t("Все новости", lang)} →
      </Link>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        {pages.map((p) => (
          <Link
            key={p.slug}
            href={`/${lang}/${p.slug}`}
            className="flex flex-col gap-2 bg-white border border-line rounded-[14px] p-6 no-underline shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:border-accent transition-colors"
          >
            <span className="font-display font-bold text-[19px] text-brand leading-[1.2]">
              {p.title}
            </span>
            {p.lead && <span className="text-[15px] leading-[1.5] text-steel">{p.lead}</span>}
          </Link>
        ))}
      </div>
    </main>
  );
}
