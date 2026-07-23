import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { getUnit, getUnitExtra, initials, avatarColor } from "@/lib/content/structure";
import { getPersonIdByFio } from "@/lib/content/persons";
import { SectionToc } from "@/components/SectionToc";
import { PageNav } from "@/components/PageNav";
import { asset } from "@/lib/asset";
import { nicPages, nicNavItems, nicHref } from "@/lib/content/nic";

// Титульная НИЦ оформлена как карточка подразделения (макет Department): центр
// есть в оргструктуре под id 14-7, и руководитель, адрес и телефон берутся
// оттуда — дублировать их в данных раздела было бы двумя источниками правды.
// Отличие от обычного подразделения одно: у НИЦ есть свои страницы (перенесённый
// сайт nic.orgma.ru) — их список даёт PageNav в сайдбаре, общий «меню страницы».
const UNIT_ID = "14-7";
const DASH = "—";

export const metadata: Metadata = {
  title: "Научно-исследовательский центр",
  description:
    "НИЦ ОрГМУ: лабораторные исследования, пункты забора анализов, перечень исследований и подготовка к сдаче материала.",
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display font-bold text-[28px] text-brand leading-none">{value || DASH}</div>
      <div className="text-[15px] text-ink-3 mt-1">{label}</div>
    </div>
  );
}

export default function NicIndexPage() {
  const u = getUnit(UNIT_ID);
  const extra = getUnitExtra(UNIT_ID);
  const pages = nicPages();

  const headFio = u?.head?.fio && u.head.fio !== "—" ? u.head.fio : "";
  const headPersonId = headFio ? getPersonIdByFio(headFio) : undefined;

  const sections = [
    { id: "about", label: "О центре" },
    ...(extra.directions?.length ? [{ id: "directions", label: "Направления работы" }] : []),
    ...(headFio ? [{ id: "head", label: "Руководитель" }] : []),
    { id: "contacts", label: "Контакты" },
  ];

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/struktura" className="text-white/90 no-underline">Структура</Link>
            <span>/</span>
            <span>Научно-исследовательский центр</span>
          </div>
          <h1 className="m-0 font-display font-bold text-[36px] leading-[1.1] max-[768px]:text-[26px]">
            {u?.name ?? "Научно-исследовательский центр"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 py-10 box-border grid grid-cols-[264px_1fr] gap-10 max-[768px]:grid-cols-1 max-[768px]:px-5">
        <aside>
          {/* Меню разделов центра — общий паттерн «меню страницы» (PageNav),
              тот же, что на подстраницах НИЦ и в sveden. Ниже — оглавление
              этой страницы. Своей вёрстки списка разделов быть не должно. */}
          <div className="min-[769px]:sticky min-[769px]:top-6 flex flex-col gap-4">
            <PageNav title="Разделы центра" items={nicNavItems()} current={nicHref()} />
            <SectionToc title="На этой странице" items={sections} />
          </div>
        </aside>

        <article className="min-w-0 flex flex-col gap-6 font-ui">
          <div
            className="a11y-decorative w-full aspect-[21/9] rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url('${asset("/brand/corpus.jpg")}')` }}
            aria-hidden
          />

          <div className="flex gap-6 flex-wrap px-[22px] py-[18px] bg-white border border-line rounded-xl">
            <Stat value={extra.founded ?? ""} label="год основания" />
            <div className="w-px bg-line self-stretch" />
            <Stat value={extra.staff ?? ""} label="сотрудников" />
            <div className="w-px bg-line self-stretch" />
            <Stat value={String(pages.length)} label="разделов" />
          </div>

          <section id="about" className="scroll-mt-6">
            <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">О центре</h2>
            <div className="bg-white border border-line rounded-xl px-[22px] py-5 text-[17px] leading-[1.6] text-ink">
              {extra.description || <span className="text-ink-3">{DASH}</span>}
            </div>
          </section>

          {extra.directions && extra.directions.length > 0 && (
            <section id="directions" className="scroll-mt-6">
              <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Направления работы</h2>
              <ul className="m-0 pl-5 list-disc marker:text-accent flex flex-col gap-2 text-[16px] leading-[1.55] text-steel">
                {extra.directions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </section>
          )}

          {headFio && (
            <section id="head" className="scroll-mt-6">
              <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Руководитель</h2>
              {(() => {
                const inner = (
                  <>
                    <span
                      className="shrink-0 w-[54px] h-[54px] rounded-full flex items-center justify-center text-white font-display font-bold text-[18px]"
                      style={{ background: avatarColor(headFio) }}
                    >
                      {initials(headFio)}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold text-[18px] text-brand">{headFio}</span>
                      <span className="block text-[15px] text-ink-3">{u?.head?.post}</span>
                    </span>
                  </>
                );
                return headPersonId ? (
                  <Link
                    href={`/persony/${headPersonId}`}
                    className="flex items-center gap-4 bg-white border border-line rounded-xl px-6 py-5 no-underline hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                  >
                    {inner}
                    <span className="ml-auto text-accent font-bold text-[14px]">Профиль →</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 bg-white border border-line rounded-xl px-6 py-5">{inner}</div>
                );
              })()}
            </section>
          )}

          <section id="contacts" className="scroll-mt-6">
            <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Контакты</h2>
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              {[
                ["Место нахождения", u?.address ?? ""],
                ["Телефон", u?.phone ?? ""],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-5 px-[22px] py-[15px] border-b border-line flex-wrap">
                  <div className="flex-[0_0_200px] max-w-full text-[15px] text-ink-2">{label}</div>
                  <div className={`flex-1 min-w-[180px] text-[16px] ${value ? "font-medium text-ink" : "text-ink-3"}`}>
                    {value || DASH}
                  </div>
                </div>
              ))}
              {/* Адреса пунктов забора — на своей странице: там их два, с
                  режимом работы и телефонами лабораторий. */}
              <div className="flex gap-5 px-[22px] py-[15px] flex-wrap">
                <div className="flex-[0_0_200px] max-w-full text-[15px] text-ink-2">Пункты забора анализов</div>
                <div className="flex-1 min-w-[180px] text-[16px]">
                  <Link href={nicHref("punkty-zabora")} className="text-accent no-underline hover:underline">
                    Адреса и режим работы →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
