import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { getPriem } from "@/lib/content/priem";
import { parsePhones } from "@/lib/phone";

// Приёмная комиссия по макету AdmissionsCommittee.dc.html. Контакты — реальные
// (из priem.yml, собраны с abitur.orgma.ru), состав и ФИО секретаря пока
// прочерки: видно, что нужно заполнить. Персональный состав утверждается
// приказом ректора ежегодно.

export const metadata: Metadata = {
  title: "Приёмная комиссия",
  description:
    "Приёмная комиссия Оренбургского государственного медицинского университета: контакты, часы работы, способы подачи документов, состав.",
};

const CARD = "bg-white border border-line rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]";
const BTN =
  "inline-flex items-center gap-2 px-4 py-[10px] border border-line-strong rounded-[10px] no-underline font-bold text-[15px] text-brand hover:bg-[rgb(251,251,251)] transition-colors";

function Dash({ value }: { value: string }) {
  return value ? <span className="text-ink">{value}</span> : <span className="text-ink-3">—</span>;
}

function initials(fio: string): string {
  return fio.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export default function CommitteePage() {
  const p = getPriem();
  const c = p.committee;

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/postupayushchim" className="text-white/90 no-underline">Поступающим</Link>
            <span>/</span>
            <span>Приёмная комиссия</span>
          </div>
          <span className="inline-flex items-center gap-2 bg-white/[0.14] px-[14px] py-[7px] rounded-full text-[14px] font-bold mb-[14px] font-ui">
            <span className="w-2 h-2 rounded-full bg-[rgb(90,220,140)] shadow-[0_0_0_4px_rgba(90,220,140,0.28)]" />
            Работает · приёмная кампания {p.year}
          </span>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            Приёмная комиссия
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[18px] text-white/85">
            Центральная приёмная комиссия — структурное подразделение, отвечающее за
            организацию приёма на все уровни обучения.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border flex flex-col gap-10 max-[768px]:px-5 font-ui">
        {/* Контакты + подача */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-4 max-[860px]:grid-cols-1">
          <div className={`${CARD} p-[26px] flex flex-col gap-5`}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-[520px]:grid-cols-1">
              <Info label="Ответственный секретарь" value={c.secretary} />
              <Info label="Часы работы" value={c.hours} />
              <Info label="Адрес" value={c.address} />
              <Info label="Электронная почта" value={c.email} href={c.email ? `mailto:${c.email}` : undefined} />
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
            <div className="flex gap-[10px] flex-wrap">
              <Link href="/mesta" className={BTN}>Схема проезда</Link>
              <a href="https://abitur.orgma.ru" target="_blank" rel="noopener noreferrer" className={BTN}>Правила приёма</a>
              <Link href="/reytingovye-spiski" className={BTN}>Конкурсные списки</Link>
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

        {/* Способы подачи */}
        <section className="flex flex-col gap-4">
          <h2 className="m-0 font-display font-bold text-[24px] text-brand">Способы подачи документов</h2>
          <div className="grid grid-cols-3 gap-4 max-[760px]:grid-cols-1">
            {p.ways.map((w, i) => (
              <div key={w.title} className={`${CARD} p-[22px] flex flex-col gap-[10px]`}>
                <span className="w-9 h-9 rounded-lg bg-[rgba(0,101,155,0.10)] text-brand font-display font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="font-display font-bold text-[18px] text-brand">{w.title}</div>
                <div className="text-[15px] text-ink-2 leading-[1.5]">{w.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Состав комиссии — заготовка, ФИО прочерками */}
        <section className="flex flex-col gap-4">
          <h2 className="m-0 font-display font-bold text-[24px] text-brand">
            Состав приёмной комиссии
            <span className="ml-3 font-ui text-[14px] font-normal text-ink-3">утверждается приказом ректора · {p.year}</span>
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {p.members.map((m, i) => (
              <div key={i} className={`${CARD} px-5 py-4 flex items-center gap-4`} style={{ borderLeft: "4px solid rgb(175,82,222)" }}>
                <span className="shrink-0 w-11 h-11 rounded-full bg-[rgb(240,240,245)] text-ink-3 font-display font-bold text-[14px] flex items-center justify-center">
                  {m.fio ? initials(m.fio) : "—"}
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-[rgb(175,82,222)] mb-[2px]">{m.role}</div>
                  <div className="font-bold text-[16px] leading-[1.2]"><Dash value={m.fio} /></div>
                  {m.position && <div className="text-[13px] text-ink-3">{m.position}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3 px-[18px] py-4 bg-[rgb(251,251,251)] border border-dashed border-line-strong rounded-[10px]">
          <span className="shrink-0 text-cyan flex">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <div className="text-[14px] leading-[1.5] text-ink-2">
            Приёмная комиссия действует на основании Положения о приёмной комиссии и Порядка
            приёма. Персональный состав ежегодно утверждается приказом ректора.
          </div>
        </div>
      </main>
    </>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <div className="text-[13px] text-ink-3 mb-[2px]">{label}</div>
      {href && value ? (
        <a href={href} className="text-[16px] font-medium text-ink no-underline hover:text-brand break-words">{value}</a>
      ) : (
        <div className="text-[16px] font-medium break-words"><Dash value={value} /></div>
      )}
    </div>
  );
}
