import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { getUnits } from "@/lib/content/structure";
import { typeMeta } from "@/lib/content/structure-types";
import { getContactLines } from "@/lib/content/kontakty";
import { SOCIALS } from "@/components/socials";
import { PhoneBook, MapEmbed, PHONEBOOK_UI, MAP_UI } from "@/components/ContactsView";
import { parsePhones } from "@/lib/phone";
import { isTargetLocale } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { t } from "@/lib/i18n/t";
import { TranslationNotice } from "@/components/TranslationNotice";

// Страница по макету Contacts.dc.html: контактная карточка с левым кантом,
// синяя карточка «Не знаете, куда обратиться?», справочник карточками в три
// колонки, «Как нас найти», примечание про sveden.
//
// Единственное отступление от макета: там девять «быстрых контактов» вручную,
// а за остальным макет отсылает в структуру. У нас телефон и почта заполнены
// у 125 подразделений из 136, и прятать их за вторым переходом жалко —
// поэтому карточки те же, но над ними поиск и фильтр по типу.

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Контакты Оренбургского государственного медицинского университета: адрес, телефоны, электронная почта, телефонный справочник подразделений.",
};

const ADDRESS = "г. Оренбург, ул. Советская, д. 6";
// Встраиваемая карта Яндекса по адресу — грузится только по клику (см. MapEmbed).
const MAP_SRC =
  "https://yandex.ru/map-widget/v1/?text=" + encodeURIComponent("Оренбург, улица Советская, 6") + "&z=17";

const ICON = {
  pin: <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />,
  clock: <path d="M12 7v5l3 2" />,
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z" />
  ),
  mail: <path d="m3 6 9 7 9-7" />,
};

function ContactIcon({ kind }: { kind: keyof typeof ICON }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {kind === "pin" && <circle cx="12" cy="10" r="2.5" />}
      {kind === "clock" && <circle cx="12" cy="12" r="9" />}
      {kind === "mail" && <rect x="2" y="4" width="20" height="16" rx="2" />}
      {ICON[kind]}
    </svg>
  );
}

// Куда ведёт значение: телефон — на звонок, почта — на письмо, остальное текстом.
function hrefFor(icon: string, value: string): string | null {
  if (icon === "phone") {
    const p = parsePhones(value)[0];
    return p ? `tel:${p.tel}` : null;
  }
  if (icon === "mail") return `mailto:${value}`;
  return null;
}

const OUTLINE_BTN =
  "inline-flex items-center gap-2 px-4 py-[10px] border border-line-strong rounded-[10px] no-underline font-bold text-[15px] text-brand hover:bg-[rgb(251,251,251)] transition-colors";

// lang приходит от языкового зеркала ([lang]/kontakty). Без него — русская
// версия: та же страница, просто ничего не переводим.
export default function ContactsPage({ lang }: { lang?: string } = {}) {
  const loc = lang && isTargetLocale(lang) ? lang : null;
  const T = <D,>(d: D): D => (loc ? translateData(d, loc).data : d);
  const S = (ru: string) => (loc ? t(ru, loc) : ru);

  const contacts = T(getContactLines());
  // Только подразделения с контактами — остальным в справочнике делать нечего.
  const units = getUnits()
    .filter((u) => u.phone || u.email)
    .map((u) => ({
      id: u.id,
      name: T(u.name),
      type: u.type,
      typeLabel: S(typeMeta(u.type).label),
      color: typeMeta(u.type).color,
      soft: typeMeta(u.type).soft,
      phones: parsePhones(u.phone),
      email: u.email,
    }));

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">{S("Главная")}</Link>
            <span>/</span>
            <span>{S("Контакты")}</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[28px]">
            {S("Контакты")}
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            {S("Телефоны, почта и часы работы приёмной комиссии, деканатов и других подразделений университета.")}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-7 pb-16 box-border flex flex-col gap-[30px] max-[768px]:px-5 font-ui">
        {loc && <TranslationNotice lang={loc} originalHref="/kontakty" />}
        {/* Общие контакты + карточка обращения */}
        <div className="grid grid-cols-[1.55fr_1fr] gap-[18px] max-[900px]:grid-cols-1">
          <div className="bg-white border border-line border-l-4 border-l-brand rounded-[14px] px-7 py-[26px] flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-[600px]:grid-cols-1">
              {contacts.map((c) => {
                const href = hrefFor(c.icon, c.value);
                return (
                  <div key={c.label} className="flex gap-3">
                    <span className="text-cyan shrink-0 mt-px flex">
                      <ContactIcon kind={c.icon} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] text-ink-3 mb-[2px]">{c.label}</div>
                      {href ? (
                        <a href={href} className="text-[16px] font-medium text-ink no-underline hover:text-brand break-words">
                          {c.value}
                        </a>
                      ) : (
                        <div className="text-[16px] font-medium text-ink break-words">{c.value}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[10px] flex-wrap pt-1">
              <Link href="/mesta" className={OUTLINE_BTN}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {S("Схема проезда")}
              </Link>
              <Link href="/struktura" className={OUTLINE_BTN}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="8" r="3.2" />
                  <path d="M2.5 20c0-3.4 2.9-5 6.5-5s6.5 1.6 6.5 5" />
                  <circle cx="17.5" cy="8.5" r="2.6" />
                  <path d="M16 14.4c3 .2 5.5 1.8 5.5 5" />
                </svg>
                {S("Все подразделения")}
              </Link>
            </div>
          </div>

          <div
            data-a11y-surface="brand"
            className="text-white rounded-[14px] px-7 py-[26px] flex flex-col gap-[14px]"
            style={{ background: "linear-gradient(160deg, rgb(0,101,155), rgb(0,80,130))" }}
          >
            <div className="font-display font-bold text-[20px]">{S("Не знаете, куда обратиться?")}</div>
            <div className="text-[15px] leading-[1.5] text-white/85">
              {S("Опишите вопрос — направим его в нужное подразделение.")}
            </div>
            <Link
              href="/obratnaya-svyaz"
              className="inline-flex items-center justify-center gap-[9px] px-[18px] py-[13px] bg-white text-brand rounded-[11px] no-underline font-bold text-[16px] hover:bg-[rgb(230,240,248)] transition-colors"
            >
              {S("Написать нам")}
            </Link>
            <div className="mt-auto border-t border-white/[0.18] pt-[14px] flex items-center gap-3">
              <span className="text-[14px] font-bold text-white/85">{S("Мы в соцсетях")}</span>
              {SOCIALS.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  title={s.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[38px] h-[38px] rounded-[10px] bg-white/[0.14] flex items-center justify-center text-white no-underline hover:bg-white/[0.24] transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Справочник подразделений */}
        <div className="flex flex-col gap-[14px]">
          <h2 className="m-0 font-display font-bold text-[24px] text-brand">
            {S("Быстрые контакты")}
            <span className="ml-3 font-ui text-[14px] font-bold text-ink-3 bg-[rgb(240,243,246)] rounded-full px-[11px] py-[3px] align-middle">
              {units.length}
            </span>
          </h2>
          <PhoneBook units={units} ui={uiStrings(PHONEBOOK_UI, lang)} />
          <div className="text-[15px] text-ink-2">
            {S("Полный список кафедр, деканатов и управлений — в разделе")}{" "}
            <Link href="/struktura" className="text-accent font-bold no-underline hover:underline">
              {S("«Структура и органы управления»")}
            </Link>
            .
          </div>
        </div>

        {/* Как нас найти */}
        <div className="flex flex-col gap-[14px]">
          <h2 className="m-0 font-display font-bold text-[24px] text-brand">{S("Как нас найти")}</h2>
          <MapEmbed src={MAP_SRC} address={S(ADDRESS)} ui={uiStrings(MAP_UI, lang)} />
        </div>

        {/* Юридические сведения */}
        <div className="flex gap-3 px-[18px] py-4 bg-[rgb(251,251,251)] border border-dashed border-line-strong rounded-[10px]">
          <span className="shrink-0 text-cyan flex">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <div className="text-[14px] leading-[1.5] text-ink-2">
            {S("Официальное наименование, дата создания, учредитель и юридически значимые контакты организации — в разделе")}{" "}
            <Link href="/sveden" className="text-steel font-bold no-underline hover:underline">
              {S("«Сведения об образовательной организации»")}
            </Link>
            .
          </div>
        </div>
      </main>
    </>
  );
}
