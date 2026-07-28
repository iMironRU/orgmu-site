import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { getPriem } from "@/lib/content/priem";
import { TracksView } from "@/components/TracksView";
import { parsePhones } from "@/lib/phone";

// Посадочная раздела «Поступающим» по макету Admissions.dc.html: приёмная
// кампания года, выбор уровня с этапами, приёмная комиссия, навигация по
// разделам, иностранным абитуриентам. Данные — content/priem.yml; чего в
// источнике нет (ФИО секретаря, статистика иностранцев), блок не показывает,
// пока не заполнено, — вместо выдуманных значений.

export const metadata: Metadata = {
  title: "Поступающим",
  description:
    "Приёмная кампания Оренбургского государственного медицинского университета: сроки и этапы поступления по уровням, приёмная комиссия, правила приёма, конкурсные списки.",
};

const CARD = "bg-white border border-line rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]";

export default function AdmissionsPage() {
  const p = getPriem();
  const c = p.committee;

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <span>Поступающим</span>
          </div>
          <span className="inline-flex items-center gap-2 bg-white/[0.14] px-[14px] py-[7px] rounded-full text-[14px] font-bold mb-[14px] font-ui">
            <span className="w-2 h-2 rounded-full bg-[rgb(90,220,140)] shadow-[0_0_0_4px_rgba(90,220,140,0.28)]" />
            Приёмная кампания {p.year} открыта
          </span>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            Поступающим
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[18px] text-white/85">
            Всё о поступлении: правила приёма, сроки, вступительные испытания, конкурсные
            списки и приказы о зачислении. Выберите уровень — этапы и сроки обновятся.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border flex flex-col gap-10 max-[768px]:px-5 font-ui">
        {/* Уровень и этапы */}
        <section className="flex flex-col gap-4">
          <h2 className="m-0 font-display font-bold text-[24px] text-brand">Этапы поступления</h2>
          <TracksView tracks={p.tracks} />
        </section>

        {/* Приёмная комиссия */}
        <section className="flex flex-col gap-4">
          <h2 className="m-0 font-display font-bold text-[24px] text-brand">Приёмная комиссия</h2>
          <div className="grid grid-cols-[1.4fr_1fr] gap-4 max-[860px]:grid-cols-1">
            <div className={`${CARD} p-[26px] flex flex-col gap-4`}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-[520px]:grid-cols-1">
                <Field label="Ответственный секретарь" value={c.secretary} />
                <Field label="Часы работы" value={c.hours} />
                <Field label="Адрес" value={c.address} />
                <Field label="Электронная почта" value={c.email} href={c.email ? `mailto:${c.email}` : undefined} />
              </div>
              <div className="border-t border-line pt-4">
                <div className="text-[13px] text-ink-3 mb-2">Телефоны по уровням</div>
                <div className="flex flex-col gap-2">
                  {c.phones.map((ph) => {
                    const tel = parsePhones(ph.value)[0];
                    return (
                      <div key={ph.label} className="flex justify-between gap-4 flex-wrap text-[15px]">
                        <span className="text-ink-2">{ph.label}</span>
                        {tel ? (
                          <a href={`tel:${tel.tel}`} className="font-bold text-steel no-underline hover:text-accent tabular-nums">
                            {ph.value}
                          </a>
                        ) : (
                          <span className="font-bold text-steel tabular-nums">{ph.value}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              data-a11y-surface="brand"
              className="text-white rounded-2xl px-[26px] py-[26px] flex flex-col gap-[14px]"
              style={{ background: "linear-gradient(160deg, rgb(0,101,155), rgb(0,80,130))" }}
            >
              <div className="font-display font-bold text-[20px]">Подать документы</div>
              <div className="text-[15px] leading-[1.5] text-white/85">
                Лично, по почте или онлайн — через суперсервис «Поступление в вуз онлайн» на Госуслугах.
              </div>
              <a
                href={c.gosuslugi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-[18px] py-[13px] bg-white text-brand rounded-[11px] no-underline font-bold text-[16px] hover:bg-[rgb(230,240,248)] transition-colors mt-auto"
              >
                Поступление в вуз онлайн →
              </a>
            </div>
          </div>
        </section>

        {/* Разделы для поступающих */}
        <section className="flex flex-col gap-4">
          <h2 className="m-0 font-display font-bold text-[24px] text-brand">Разделы для поступающих</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            {p.sections.map((s) => {
              const external = s.href.startsWith("http");
              const inner = (
                <>
                  {s.badge && (
                    <span className="self-start text-[11px] font-bold text-accent bg-[rgba(184,57,4,0.10)] rounded-full px-[10px] py-[3px]">
                      {s.badge}
                    </span>
                  )}
                  <div className="font-display font-bold text-[18px] text-brand leading-[1.2]">{s.title}</div>
                  <div className="text-[15px] text-ink-2 leading-[1.5] flex-1">{s.desc}</div>
                  <span className="inline-flex items-center gap-[6px] font-bold text-[15px] text-accent mt-1">
                    {s.cta}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                  </span>
                </>
              );
              const cls = `${CARD} p-[22px] flex flex-col gap-[10px] no-underline hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)] hover:-translate-y-[2px] transition-[box-shadow,transform]`;
              return external ? (
                <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link key={s.title} href={s.href} className={cls}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Иностранным абитуриентам. Заготовка с прочерком контакта: блок виден,
            чтобы было понятно, что раздел есть и что нужно заполнить. */}
        <section className={`${CARD} p-[26px] flex flex-col gap-3`}>
          <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-ink-3">International · EN · 中文</div>
          <h2 className="m-0 font-display font-bold text-[24px] text-brand">Иностранным абитуриентам</h2>
          <p className="m-0 text-[16px] text-ink-2 leading-[1.5] max-w-[720px]">
            Приём иностранных граждан по квоте Правительства РФ и на договорной основе.
            Признание документов, визовая поддержка и сопровождение на всех этапах.
          </p>
          <div className="text-[15px] text-steel">
            Международный отдел: <Dash value={p.international.contact} />
          </div>
        </section>

        {/* Примечание про Порядок приёма */}
        <div className="flex gap-3 px-[18px] py-4 bg-[rgb(251,251,251)] border border-dashed border-line-strong rounded-[10px]">
          <span className="shrink-0 text-cyan flex">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <div className="text-[14px] leading-[1.5] text-ink-2">
            Состав сведений соответствует Порядку приёма (приказы Минобрнауки, Минпросвещения
            и Минздрава по соответствующим уровням). Конкурсные списки публикуются с
            обезличенными идентификаторами и обновляются не реже одного раза в день в период приёма.
          </div>
        </div>
      </main>
    </>
  );
}

function Field({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <div className="text-[13px] text-ink-3 mb-[2px]">{label}</div>
      {href && value ? (
        <a href={href} className="text-[16px] font-medium text-ink no-underline hover:text-brand break-words">
          {value}
        </a>
      ) : (
        <div className="text-[16px] font-medium break-words">
          <Dash value={value} />
        </div>
      )}
    </div>
  );
}

// Прочерк для незаполненного значения — видно, что данные ещё готовятся.
function Dash({ value }: { value: string }) {
  return value ? <span className="text-ink">{value}</span> : <span className="text-ink-3">—</span>;
}
