import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getUnits,
  getUnit,
  getChildren,
  getUnitExtra,
  typeMeta,
  initials,
  avatarColor,
} from "@/lib/content/structure";
import { getPersonIdByFio } from "@/lib/content/persons";
import { makeDocItem } from "@/lib/sveden/documents";
import { DocCards } from "@/components/sveden/DocCards";
import { SectionToc } from "@/components/SectionToc";
import { asset } from "@/lib/asset";

export const dynamicParams = false;

export function generateStaticParams() {
  return getUnits().map((u) => ({ id: u.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const u = getUnit(id);
  return u ? { title: u.name } : {};
}

const DASH = "—";

// Пустой раздел — не спрятанный: показываем, что не заполнено.
function Blank({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[16px] text-ink-3 bg-white border border-dashed border-line-strong rounded-xl px-6 py-5">
      {children} {DASH}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display font-bold text-[28px] text-brand leading-none">{value || DASH}</div>
      <div className="text-[15px] text-ink-3 mt-1">{label}</div>
    </div>
  );
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const u = getUnit(id);
  if (!u) notFound();

  const m = typeMeta(u.type);
  const extra = getUnitExtra(id);
  // Сотрудники — списком ФИО из units-extra.yml. Автоматически собрать нельзя:
  // в данных sveden (teachingStaff) у преподавателей нет подразделения, оно
  // пустое у всех 178 карточек. По ФИО подтягиваем ссылку на профиль.
  const staff = (extra.employees ?? []).map((fio) => ({ fio, id: getPersonIdByFio(fio) }));
  const children = getChildren(id);
  const hasHead = !!u.head.fio && u.head.fio !== "—";
  const headPersonId = hasHead ? getPersonIdByFio(u.head.fio) : undefined;
  const docItem = u.doc ? makeDocItem("divisionClauseDocLink", u.doc.text || "Положение о подразделении", u.doc.href) : null;

  // Порядок совпадает с порядком секций на странице. Разделы, которые
  // показываются всегда (даже пустыми), в списке тоже всегда.
  const sections = [
    { id: "about", label: "О подразделении" },
    { id: "directions", label: "Направления работы" },
    { id: "staff", label: "Сотрудники" },
    { id: "teaching", label: "Учебная работа" },
    { id: "schedule", label: "Расписание" },
    ...(hasHead ? [{ id: "head", label: "Руководитель" }] : []),
    { id: "contacts", label: "Контакты" },
    ...(docItem ? [{ id: "docs", label: "Документы" }] : []),
    ...(children.length ? [{ id: "sostav", label: "В составе" }] : []),
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
            <span>{m.label}</span>
          </div>
          <h1 className="m-0 font-display font-bold text-[36px] leading-[1.1] max-[768px]:text-[26px]">
            {u.name}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 py-10 box-border grid grid-cols-[264px_1fr] gap-10 max-[768px]:grid-cols-1 max-[768px]:px-5">
        {/* Сайдбар «Разделы» */}
        <aside>
          {/* Общий SectionToc: подсветка текущего раздела при скролле и селект
              на мобиле — вместо самописного списка, который этого не умел. */}
          <div className="min-[769px]:sticky min-[769px]:top-6">
            <SectionToc title="Разделы" items={sections} />
          </div>
        </aside>

        {/* Контент */}
        <article className="min-w-0 flex flex-col gap-6 font-ui">
          <div
            className="a11y-decorative w-full aspect-[21/9] rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url('${asset("/brand/corpus.jpg")}')` }}
            aria-hidden
          />

          {/* Статы (год основания / преподавателей / докторов — прочерки, где нет данных) */}
          <div className="flex gap-6 flex-wrap px-[22px] py-[18px] bg-white border border-line rounded-xl">
            <Stat value={extra.founded ?? ""} label="год основания" />
            <div className="w-px bg-line self-stretch" />
            <Stat value={extra.staff ?? ""} label="сотрудников" />
            <div className="w-px bg-line self-stretch" />
            <Stat value={extra.doctors ?? ""} label="докторов наук" />
            {children.length > 0 && (
              <>
                <div className="w-px bg-line self-stretch" />
                <Stat value={String(children.length)} label="в составе" />
              </>
            )}
          </div>

          {/* О подразделении */}
          <section id="about" className="scroll-mt-6">
            <h2 className="m-0 mb-3 font-display font-bold text-[26px] text-brand">О подразделении</h2>
            {extra.description ? (
              <div className="text-[18px] leading-[1.6] text-ink whitespace-pre-line">{extra.description}</div>
            ) : (
              <div className="text-[16px] text-ink-3 bg-white border border-dashed border-line-strong rounded-xl px-6 py-5">
                Описание подразделения уточняется. {DASH}
              </div>
            )}
          </section>

          {/* Разделы макета Department. Показываем всегда: исчезнувший раздел
              читается как «этого у подразделения нет», пустой — как «не
              заполнено». Данные — content/structure/units-extra.yml. */}
          <section id="directions" className="scroll-mt-6">
            <h2 className="m-0 mb-3 font-display font-bold text-[26px] text-brand">Направления работы</h2>
            {extra.directions && extra.directions.length > 0 ? (
              <ul className="list-disc pl-6 flex flex-col gap-2 text-[17px] text-ink">
                {extra.directions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            ) : (
              <Blank>Направления работы не заполнены.</Blank>
            )}
          </section>

          <section id="staff" className="scroll-mt-6">
            <h2 className="m-0 mb-3 font-display font-bold text-[26px] text-brand">
              Сотрудники
              {staff.length > 0 && (
                <span className="ml-3 font-ui text-[14px] font-bold text-ink-3 bg-[rgb(240,243,246)] rounded-full px-[11px] py-[3px] align-middle">
                  {staff.length}
                </span>
              )}
            </h2>
            {staff.length > 0 ? (
              <div className="flex flex-col gap-2">
                {staff.map((s, i) => {
                  const inner = (
                    <>
                      <span
                        className="shrink-0 w-10 h-10 rounded-full text-white font-display font-bold text-[13px] flex items-center justify-center"
                        style={{ background: avatarColor(s.fio) }}
                      >
                        {initials(s.fio)}
                      </span>
                      <span className="flex-1 min-w-0 font-bold text-[17px] text-brand">{s.fio}</span>
                    </>
                  );
                  const cls =
                    "flex items-center gap-4 bg-white border border-line rounded-[10px] px-[18px] py-[13px]";
                  return s.id ? (
                    <Link key={i} href={`/persony/${s.id}`} className={`${cls} no-underline hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-shadow`}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={i} className={cls}>{inner}</div>
                  );
                })}
              </div>
            ) : (
              <Blank>Список сотрудников не заполнен.</Blank>
            )}
          </section>

          <section id="teaching" className="scroll-mt-6">
            <h2 className="m-0 mb-3 font-display font-bold text-[26px] text-brand">Учебная работа</h2>
            {extra.teaching && extra.teaching.length > 0 ? (
              <ul className="list-disc pl-6 flex flex-col gap-2 text-[17px] text-ink">
                {extra.teaching.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            ) : (
              <Blank>Сведения об учебной работе не заполнены.</Blank>
            )}
          </section>

          <section id="schedule" className="scroll-mt-6">
            <h2 className="m-0 mb-3 font-display font-bold text-[26px] text-brand">Расписание</h2>
            {extra.schedule && extra.schedule.length > 0 ? (
              <div className="flex flex-col gap-2">
                {extra.schedule.map((x, i) => (
                  <a
                    key={i}
                    href={x.href}
                    className="inline-flex items-center gap-2 font-bold text-[17px] text-accent no-underline hover:underline"
                  >
                    {x.label}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                  </a>
                ))}
              </div>
            ) : (
              <Blank>Расписание не заполнено.</Blank>
            )}
          </section>

          {hasHead && (
            <section id="head" className="scroll-mt-6">
              <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Руководитель</h2>
              {(() => {
                const inner = (
                  <>
                    <span
                      className="shrink-0 w-14 h-14 rounded-full text-white font-display font-bold text-[18px] flex items-center justify-center"
                      style={{ background: avatarColor(u.head.fio) }}
                    >
                      {initials(u.head.fio)}
                    </span>
                    <div>
                      <div className="font-bold text-[20px] text-brand">{u.head.fio}</div>
                      <div className="text-[16px] text-steel">{u.head.post || DASH}</div>
                    </div>
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
                ["Место нахождения", u.address],
                ["Телефон", u.phone],
                ["Сайт", u.site],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-5 px-[22px] py-[15px] border-b border-line last:border-0 flex-wrap">
                  <div className="flex-[0_0_200px] max-w-full text-[15px] text-ink-2">{label}</div>
                  <div className={`flex-1 min-w-[180px] text-[16px] ${value ? "font-medium text-ink" : "text-ink-3"}`}>
                    {value || DASH}
                  </div>
                </div>
              ))}
              <div className="flex gap-5 px-[22px] py-[15px] border-b border-line last:border-0 flex-wrap">
                <div className="flex-[0_0_200px] max-w-full text-[15px] text-ink-2">Электронная почта</div>
                <div className="flex-1 min-w-[180px] text-[16px]">
                  {u.email ? (
                    <a href={`mailto:${u.email}`} className="text-accent underline">{u.email}</a>
                  ) : (
                    <span className="text-ink-3">{DASH}</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {docItem && (
            <section id="docs" className="scroll-mt-6">
              <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Документы</h2>
              <DocCards docs={[docItem]} />
            </section>
          )}

          {children.length > 0 && (
            <section id="sostav" className="scroll-mt-6">
              <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">
                В составе<span className="text-ink-3 font-normal text-[16px]"> · {children.length}</span>
              </h2>
              <div className="flex flex-col gap-2">
                {children.map((c) => {
                  const cm = typeMeta(c.type);
                  return (
                    <Link
                      key={c.id}
                      href={`/struktura/${c.id}`}
                      className="flex items-center gap-3 bg-white border border-line rounded-[10px] px-[18px] py-[13px] no-underline hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                      style={{ borderLeft: `4px solid ${cm.color}` }}
                    >
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.04em] rounded-[5px] px-2 py-[2px]"
                        style={{ color: cm.color, background: cm.soft }}
                      >
                        {cm.label}
                      </span>
                      <span className="font-bold text-[16px] text-brand">{c.name}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
