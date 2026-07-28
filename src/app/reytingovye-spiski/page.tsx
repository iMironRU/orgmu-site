import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { RatingListsView } from "@/components/RatingListsView";
import { isTargetLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/t";
import { TranslationNotice } from "@/components/TranslationNotice";

// Рейтинговые (конкурсные) списки по макету RatingLists.dc.html. Синяя шапка
// статична; сам список — клиентский компонент, грузит данные fetch-ем, потому
// что в 1С они меняются ежедневно и кладутся прямо на сервер, минуя сборку.

export const metadata: Metadata = {
  title: "Рейтинговые списки",
  description:
    "Обезличенные ранжированные (конкурсные) списки поступающих в Оренбургский государственный медицинский университет. Обновляются в период приёма.",
};

// lang приходит от языкового зеркала ([lang]/reytingovye-spiski).
export default function RatingListsPage({ lang }: { lang?: string } = {}) {
  const loc = lang && isTargetLocale(lang) ? lang : null;
  const S = (ru: string) => (loc ? t(ru, loc) : ru);

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">{S("Главная")}</Link>
            <span>/</span>
            <span>{S("Поступающим")}</span>
            <span>/</span>
            <span>{S("Рейтинговые списки")}</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            {S("Рейтинговые списки")}
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[18px] text-white/85">
            {S("Обезличенные ранжированные списки поступающих. Обновляются в период приёма. Списки носят информационный характер; итог определяют приказы о зачислении.")}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-7 pb-16 box-border flex flex-col gap-4 max-[768px]:px-5 max-[640px]:pt-6">
        {loc && <TranslationNotice lang={loc} originalHref="/reytingovye-spiski" />}
        <RatingListsView />
      </main>
    </>
  );
}
