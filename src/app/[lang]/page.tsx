import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllNews } from "@/lib/content/news";
import { toCardItem, kindStyle, newsKind } from "@/lib/content/news-types";
import { getSubsites } from "@/lib/content/navigation";
import { getBanners, getAnnouncements } from "@/lib/content/home";
import { NewsCard } from "@/components/NewsCard";
import { SubsiteTile } from "@/components/SubsiteTile";
import { BannerSlider } from "@/components/BannerSlider";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { TranslationNotice } from "@/components/TranslationNotice";
import { asset } from "@/lib/asset";
import { TARGET_LOCALES, isTargetLocale } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { alternatesFor } from "@/lib/i18n/alternates";
import { t } from "@/lib/i18n/t";

// Главная на другом языке — ТА ЖЕ страница, что русская, только с переведёнными
// данными: те же блоки, тот же порядок, та же вёрстка. Отдельного «списка того,
// что переведено» здесь быть не должно: человек, переключивший язык, ожидает
// увидеть привычную главную, а не другую страницу.
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
  return {
    title: t("Оренбургский государственный медицинский университет", lang),
    alternates: alternatesFor("/", lang),
  };
}

export default async function TranslatedHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isTargetLocale(lang)) notFound();

  const news = translateData(getAllNews().slice(0, 6).map(toCardItem), lang);
  const subsites = translateData(getSubsites(), lang);
  const banners = translateData(getBanners(), lang);
  const announcements = translateData(getAnnouncements(), lang);
  const machine = news.machine || subsites.machine || banners.machine || announcements.machine;

  // Подписи видов новостей переводим здесь: карточки — клиентский компонент,
  // словарь (он читает файлы) внутрь клиентского бандла не затащить.
  const kindLabels = Object.fromEntries(
    (["event", "announce", "congrats", "science", "dept"] as const).map((k) => [
      k,
      t(kindStyle(k).label, lang),
    ]),
  );

  return (
    <>
      <section className="relative bg-brand text-white" data-a11y-surface="brand">
        <div
          className="a11y-decorative absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url('${asset("/brand/corpus.jpg")}')` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1146px] px-10 py-20 max-[768px]:px-5 max-[768px]:py-12">
          <p className="font-ui font-bold uppercase tracking-[0.08em] text-sky-soft text-[14px] mb-4">
            {t("Минздрав России", lang)}
          </p>
          <h1 className="font-display font-bold text-[50px] leading-[1.05] max-w-[820px] m-0 max-[768px]:text-[32px]">
            {t("Оренбургский государственный медицинский университет", lang)}
          </h1>
          <p className="font-ui text-[20px] text-white/85 max-w-[640px] mt-5">
            {t("Более 80 лет готовим врачей и провизоров для здравоохранения России.", lang)}
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href={`/${lang}/novosti`}
              className="font-ui font-bold text-[16px] no-underline px-6 py-3 rounded-[10px] bg-accent text-white hover:bg-[rgb(150,46,3)] transition-colors"
            >
              {t("Новости университета", lang)}
            </Link>
          </div>
        </div>
      </section>

      {machine && (
        <div className="mx-auto max-w-[1146px] w-full px-10 pt-8 box-border max-[768px]:px-5">
          <TranslationNotice lang={lang} originalHref="/" />
        </div>
      )}

      {banners.data.length > 0 && (
        <section className="mx-auto max-w-[1146px] w-full px-10 pt-12 box-border max-[768px]:px-5 max-[768px]:pt-8">
          <BannerSlider banners={banners.data} />
        </section>
      )}

      {announcements.data.length > 0 && (
        <section className="mx-auto max-w-[1146px] w-full px-10 pt-12 box-border max-[768px]:px-5 max-[768px]:pt-10">
          <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
            <h2 className="m-0 font-display font-bold text-[33px] text-brand">{t("Известия", lang)}</h2>
          </div>
          <AnnouncementBar items={announcements.data} />
        </section>
      )}

      <section className="mx-auto max-w-[1146px] w-full px-10 pt-12 pb-16 box-border max-[768px]:px-5 max-[768px]:py-10">
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <h2 className="m-0 font-display font-bold text-[33px] text-brand">
            {t("Новости и события", lang)}
          </h2>
          <Link href={`/${lang}/novosti`} className="font-ui font-bold text-[17px] text-accent no-underline">
            {t("Все новости", lang)} →
          </Link>
        </div>

        {news.data.length === 0 ? (
          <p className="text-steel font-ui text-[18px]">{t("Новостей пока нет.", lang)}</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
            {news.data.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                langPrefix={`/${lang}`}
                lang={lang}
                kindLabel={kindLabels[newsKind(item)]}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border-t border-line">
        <div className="mx-auto max-w-[1146px] w-full px-10 py-16 box-border max-[768px]:px-5 max-[768px]:py-10">
          <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
            <h2 className="m-0 font-display font-bold text-[33px] text-brand">{t("Сайты вуза", lang)}</h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {subsites.data.map((s) => (
              <SubsiteTile key={s.label} s={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
