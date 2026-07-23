import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { getActiveNotices } from "@/lib/content/notices";
import { NoticesView } from "@/components/NoticesView";
import { isTargetLocale } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { NOTICES_UI } from "@/lib/i18n/ui-defs";
import { t } from "@/lib/i18n/t";
import { TranslationNotice } from "@/components/TranslationNotice";

export const metadata: Metadata = {
  title: "Известия",
  description:
    "Срочные уведомления администрации Оренбургского медицинского университета: приём, расписание, объявления.",
};

// Витрина по структуре News.dc.html: крошки + заголовок + чипы/сетка/пагинация.
// lang приходит от языкового зеркала ([lang]/izvestiya); без него — русская версия.
export default function NoticesPage({ lang }: { lang?: string } = {}) {
  const loc = lang && isTargetLocale(lang) ? lang : null;
  const S = (ru: string) => (loc ? t(ru, loc) : ru);
  const notices = loc ? translateData(getActiveNotices(), loc).data : getActiveNotices();

  return (
    <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 max-[768px]:pt-6">
      {loc && (
        <div className="mb-5">
          <TranslationNotice lang={loc} originalHref="/izvestiya" />
        </div>
      )}
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-[15px] text-ink-3 mb-5 flex-wrap font-ui">
        <Link href="/" className="text-accent no-underline">
          {S("Главная")}
        </Link>
        <span>/</span>
        <span className="text-ink-2">{S("Известия")}</span>
      </div>

      <h1 className="m-0 mb-6 font-display font-bold text-[40px] text-brand max-[768px]:text-[30px]">
        {S("Известия")}
      </h1>

      {notices.length === 0 ? (
        <p className="text-steel font-ui text-[18px]">{S("Действующих известий нет.")}</p>
      ) : (
        <NoticesView items={notices} ui={uiStrings(NOTICES_UI, lang)} />
      )}
    </main>
  );
}
