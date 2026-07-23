import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { notFound } from "next/navigation";
import { getAllPersonIds, getPerson } from "@/lib/content/persons";
import { initials, avatarColor } from "@/lib/content/persons-types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPersonIds().map((id) => ({ id }));
}

const ip = (value: string) => ({ itemprop: value }) as Record<string, string>;
const DASH = "—";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = getPerson(id);
  return p ? { title: `${p.fio} — ${p.position}` } : {};
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getPerson(id);
  if (!p) notFound();

  const degreeLine = [p.degree, p.academStat].filter(Boolean).join(", ");
  const backHref = p.isLead ? "/rukovodstvo" : "/persony";
  const backLabel = p.isLead ? "Руководство" : "Педагогический состав";

  return (
    <main className="mx-auto max-w-[1000px] w-full px-10 pt-8 pb-16 box-border max-[760px]:px-5 font-ui">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-[15px] text-ink-2 mb-5 flex-wrap">
        <Link href="/sveden" className="text-steel no-underline">Сведения об организации</Link>
        <span>/</span>
        <Link href={backHref} className="text-steel no-underline">{backLabel}</Link>
        <span>/</span>
        <span className="text-ink">{p.fio}</span>
      </div>

      {/* Шапка-карточка */}
      <div className="bg-white border border-line rounded-2xl p-7 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex gap-6 items-start max-[760px]:flex-col max-[760px]:items-center max-[760px]:text-center">
          <span
            className="shrink-0 w-[118px] h-[150px] rounded-[14px] text-white font-display font-bold text-[38px] flex items-center justify-center"
            style={{ background: avatarColor(p.fio) }}
          >
            {initials(p.fio)}
          </span>
          <div className="flex-1 min-w-0">
            {p.isLead && p.leadRole && (
              <span className="inline-block text-[12px] font-bold uppercase tracking-[0.04em] text-[rgb(175,82,222)] bg-[rgba(175,82,222,0.10)] rounded-md px-[10px] py-1 mb-2">
                {p.leadRole}
              </span>
            )}
            <h1 {...ip("fio")} className="m-0 font-display font-bold text-[30px] leading-[1.12] text-brand">
              {p.fio}
            </h1>
            <div {...ip("post")} className="text-[19px] text-steel mt-[6px]">{p.position}</div>
            {degreeLine && <div className="text-[17px] text-ink-2 mt-1">{degreeLine}</div>}
            {p.dept && (
              <Link href="/struktura" className="inline-flex items-center gap-[7px] mt-3 font-bold text-[16px] text-accent no-underline max-[760px]:justify-center">
                {p.dept}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Контакты руководства */}
      {p.isLead && (p.phone || p.email) && (
        <div className="flex gap-[14px] flex-wrap mt-4">
          <a
            href={p.email ? `mailto:${p.email}` : p.phone ? `tel:${p.phone.replace(/[^+\d]/g, "")}` : "#"}
            className="flex-1 min-w-[220px] flex items-center gap-3 bg-brand rounded-xl px-5 py-[18px] no-underline hover:bg-brand-strong transition-colors"
          >
            <span className="shrink-0 text-white flex">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
            </span>
            <span className="font-bold text-[18px] text-white">Записаться на приём</span>
          </a>
          {p.phone && (
            <div className="flex-1 min-w-[200px] bg-white border border-line rounded-xl px-5 py-[18px]">
              <div className="text-[14px] text-ink-3 mb-1">Телефон</div>
              <div className="font-bold text-[18px] text-brand">{p.phone}</div>
            </div>
          )}
          {p.email && (
            <div className="flex-1 min-w-[200px] bg-white border border-line rounded-xl px-5 py-[18px]">
              <div className="text-[14px] text-ink-3 mb-1">Эл. почта</div>
              <a href={`mailto:${p.email}`} className="font-bold text-[18px] text-brand no-underline break-words">
                {p.email}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Две колонки */}
      <div className="grid grid-cols-2 gap-4 mt-4 items-start max-[760px]:grid-cols-1">
        {/* Дисциплины + стаж */}
        <div className="bg-white border border-line rounded-xl p-[22px]">
          <h3 className="m-0 mb-[14px] font-display font-bold text-[18px] text-brand">
            Преподаваемые дисциплины
          </h3>
          {p.disciplines.length > 0 ? (
            <div>
              {p.dept && (
                <Link href="/struktura" className="inline-flex items-center gap-[9px] no-underline font-bold text-[16px] text-brand mb-2">
                  <span className="shrink-0 text-accent flex">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8l6-4 6 4v13" /><path d="M9 21v-5h4v5M19 21V11l-4-2.6" /></svg>
                  </span>
                  {p.dept}
                </Link>
              )}
              <div className="ml-2 pl-[14px] border-l-2 border-[rgb(228,232,236)] flex flex-col gap-2">
                {p.disciplines.map((d, i) => (
                  <div key={i} className="flex items-start gap-[9px] text-[16px] text-steel">
                    <span className="shrink-0 w-[6px] h-[6px] rounded-full bg-accent mt-[8px]" />
                    <span {...ip("teachingDiscipline")}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[16px] text-ink-3">Учебные дисциплины не закреплены.</div>
          )}
          <div className="flex gap-6 mt-5 pt-[18px] border-t border-line">
            <div className="text-center whitespace-nowrap">
              <div className="text-[13px] text-ink-3 mb-[5px]">стаж по специальности</div>
              <div {...ip("specExperience")}>
                <span className="font-display font-bold text-[24px] text-brand">
                  {p.experience ? p.experience.split(" ")[0] : DASH}
                </span>{" "}
                <span className="text-[15px] text-steel">
                  {p.experience ? p.experience.split(" ").slice(1).join(" ") : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Образование + ПК */}
        <div className="bg-white border border-line rounded-xl p-[22px]">
          <h3 className="m-0 mb-3 font-display font-bold text-[18px] text-brand">
            Образование и квалификация
          </h3>
          {p.education.length > 0 ? (
            <ul {...ip("teachingLevel")} className="m-0 pl-5 text-[16px] text-ink leading-[1.6] list-disc marker:text-brand/40 flex flex-col gap-1">
              {p.education.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : (
            <div className="text-[16px] text-ink-3">{DASH}</div>
          )}

          {p.qualifications.length > 0 && (
            <>
              <div className="text-[14px] text-ink-3 mt-4 mb-2 font-bold uppercase tracking-[0.03em]">
                Повышение квалификации
              </div>
              <ul className="m-0 pl-5 text-[15px] text-steel leading-[1.7] list-disc">
                {p.qualifications.map((q, i) => (
                  <li key={i} {...ip("qualification")}>{q}</li>
                ))}
              </ul>
            </>
          )}

          {p.profDevelopment.length > 0 && (
            <>
              <div className="text-[14px] text-ink-3 mt-4 mb-2 font-bold uppercase tracking-[0.03em]">
                Профессиональная переподготовка
              </div>
              <ul className="m-0 pl-5 text-[15px] text-steel leading-[1.7] list-disc">
                {p.profDevelopment.map((d, i) => (
                  <li key={i} {...ip("profDevelopment")}>{d}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Плашка про машиночитаемость */}
      {!p.isLead && (
        <div className="flex gap-3 px-[18px] py-4 bg-bg-muted border border-dashed border-line-strong rounded-[10px] mt-4">
          <span className="shrink-0 text-teal flex">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h6" />
            </svg>
          </span>
          <div className="text-[14px] leading-[1.5] text-ink-2">
            Карточка размечена по спецификации Рособрнадзора (приказ № 1493):
            должность, преподаваемые дисциплины, образование, повышение
            квалификации и стаж — в атрибутах <code>itemprop</code> для
            автоматического сбора мониторингом.
          </div>
        </div>
      )}
    </main>
  );
}
