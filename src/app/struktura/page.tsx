import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { getUnits } from "@/lib/content/structure";
import { getPersonIdByFio } from "@/lib/content/persons";
import { StructureView, STRUCTURE_UI } from "@/components/StructureView";
import { TYPE_META } from "@/lib/content/structure-types";
import { isTargetLocale } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { personName } from "@/lib/i18n/translit";
import { t } from "@/lib/i18n/t";
import { TranslationNotice } from "@/components/TranslationNotice";

export const metadata: Metadata = {
  title: "Структура и органы управления",
  description:
    "Структура и органы управления Оренбургского государственного медицинского университета: факультеты, кафедры, институты, управления и отделы с руководителями и контактами.",
};

// lang приходит от языкового зеркала ([lang]/struktura); без него — русская
// версия. Названия и должности переводятся, ФИО транслитерируются: машина
// переводит фамилии как слова, см. lib/i18n/translit.ts.
export default function StructurePage({ lang }: { lang?: string } = {}) {
  const loc = lang && isTargetLocale(lang) ? lang : null;
  const S = (ru: string) => (loc ? t(ru, loc) : ru);

  const units = getUnits().map((u) => {
    const withId = {
      ...u,
      headPersonId: u.head.fio ? getPersonIdByFio(u.head.fio) : undefined,
    };
    if (!loc) return withId;
    const tr = translateData(withId, loc).data;
    // fio исключён из перевода правилами (rules.json), поэтому подставляем
    // транслитерацию отдельно — и только для латинских языков.
    return { ...tr, head: { ...tr.head, fio: personName(tr.head.fio, loc) } };
  });

  const typeLabels = Object.fromEntries(
    Object.entries(TYPE_META).map(([k, v]) => [k, S(v.label)]),
  );

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">
              {S("Главная")}
            </Link>
            <span>/</span>
            <Link href="/sveden" className="text-white/90 no-underline">
              {S("Сведения об организации")}
            </Link>
            <span>/</span>
            <span>{S("Структура и органы управления")}</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            {S("Структура и органы управления")}
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            {S("Подразделения университета с руководителями, адресами и положениями. Отступ показывает подчинённость.")}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-7 pb-16 box-border max-[768px]:px-5 flex flex-col gap-5">
        {loc && <TranslationNotice lang={loc} originalHref="/struktura" />}
        <StructureView units={units} ui={uiStrings(STRUCTURE_UI, lang)} typeLabels={typeLabels} />
      </main>
    </>
  );
}
