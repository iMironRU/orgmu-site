import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { getTeachers } from "@/lib/content/persons";
import { toPersonCard, POSITION_CATS, DEGREE_CATS, positionCat, formatExperience } from "@/lib/content/persons-types";
import { StaffDirectory } from "@/components/StaffDirectory";
import { isTargetLocale } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { STAFF_UI } from "@/lib/i18n/ui-defs";
import { personName } from "@/lib/i18n/translit";
import { t } from "@/lib/i18n/t";
import { TranslationNotice } from "@/components/TranslationNotice";

export const metadata: Metadata = {
  title: "Педагогический (научно-педагогический) состав",
  description:
    "Персональный состав педагогических работников ОрГМУ: должности, преподаваемые дисциплины, учёные степени и звания, квалификация.",
};

// lang приходит от языкового зеркала ([lang]/persony); без него — русская версия.
export default function StaffDirectoryPage({ lang }: { lang?: string } = {}) {
  const loc = lang && isTargetLocale(lang) ? lang : null;
  const S = (ru: string) => (loc ? t(ru, loc) : ru);

  // Срез для плиток: без education/qualifications/profDevelopment/dept —
  // каталог их не показывает, а в разметку уезжали у всех 178 персон.
  const people = getTeachers().map(toPersonCard).map((p) => {
    if (!loc) return p;
    // Ключи фильтров считаем ДО перевода: после него слов «доцент» и «доктор»
    // в полях не останется, и фильтры оказались бы пустыми.
    const posKey = positionCat(p.position);
    const degKey = DEGREE_CATS.find((c) => p.degree.toLowerCase().includes(c.key))?.key ?? null;
    const tr = translateData(p, loc).data;
    return { ...tr, fio: personName(p.fio, loc), experience: formatExperience(p.experience, S("лет")), posKey, degKey };
  });

  const catLabels = Object.fromEntries(
    [...POSITION_CATS, ...DEGREE_CATS].map((c) => [c.key, S(c.label)]),
  );
  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">{S("Главная")}</Link>
            <span>/</span>
            <Link href="/sveden" className="text-white/90 no-underline">{S("Сведения об организации")}</Link>
            <span>/</span>
            <span>{S("Педагогический состав")}</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            {S("Педагогический состав")}
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            {S("Персональный состав педагогических (научно-педагогических) работников с данными о квалификации, стаже и преподаваемых дисциплинах.")}
          </p>
        </div>
      </div>

      {/* Сетку (боковая панель фильтров + список) держит сам StaffDirectory —
          фильтры и список должны жить в одном клиентском компоненте. */}
      {loc && (
        <div className="mx-auto max-w-[1146px] w-full px-10 pt-6 box-border max-[768px]:px-5">
          <TranslationNotice lang={loc} originalHref="/persony" />
        </div>
      )}
      <StaffDirectory people={people} ui={uiStrings(STAFF_UI, lang)} catLabels={catLabels} />
    </>
  );
}
