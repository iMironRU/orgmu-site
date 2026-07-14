import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPersonIds, getPerson } from "@/lib/content/persons";
import { initials, avatarColor } from "@/lib/content/persons-types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPersonIds().map((id) => ({ id }));
}

const ip = (value: string) => ({ itemprop: value }) as Record<string, string>;

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
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-5 font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href={backHref} className="text-white/90 no-underline">{backLabel}</Link>
            <span>/</span>
            <span className="truncate">{p.fio}</span>
          </div>
          <div className="flex items-center gap-5 max-[560px]:flex-col max-[560px]:text-center">
            <span
              className="shrink-0 flex w-[76px] h-[92px] rounded-xl text-white font-display font-bold text-[26px] items-center justify-center"
              style={{ background: avatarColor(p.fio) }}
            >
              {initials(p.fio)}
            </span>
            <div>
              {p.isLead && p.leadRole && (
                <span className="inline-block text-[12px] font-bold uppercase tracking-[0.04em] bg-white/20 rounded-[5px] px-[10px] py-[3px] mb-2">
                  {p.leadRole}
                </span>
              )}
              <h1 {...ip("fio")} className="m-0 font-display font-bold text-[32px] leading-[1.1] max-[768px]:text-[24px]">
                {p.fio}
              </h1>
              <div {...ip("post")} className="text-[18px] text-white/90 mt-1">{p.position}</div>
              {degreeLine && <div className="text-[16px] text-white/70 mt-1">{degreeLine}</div>}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-10 pb-16 box-border max-[768px]:px-5 grid grid-cols-[1fr_320px] gap-8 max-[760px]:grid-cols-1">
        <div className="flex flex-col gap-8 min-w-0">
          {p.disciplines.length > 0 && (
            <section>
              <h2 className="m-0 mb-4 font-display font-bold text-[22px] text-brand">Преподаваемые дисциплины</h2>
              <div className="flex flex-wrap gap-2">
                {p.disciplines.map((d, i) => (
                  <span
                    key={i}
                    {...ip("teachingDiscipline")}
                    className="text-[14px] font-bold text-steel bg-white border border-line rounded-full px-[13px] py-[6px]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </section>
          )}

          {p.education && (
            <section>
              <h2 className="m-0 mb-3 font-display font-bold text-[22px] text-brand">Образование и квалификация</h2>
              <p {...ip("teachingLevel")} className="m-0 bg-white border border-line rounded-xl px-6 py-5 text-[16px] leading-[1.6] text-ink whitespace-pre-line">
                {p.education}
              </p>
            </section>
          )}

          {p.qualifications.length > 0 && (
            <section>
              <h2 className="m-0 mb-3 font-display font-bold text-[22px] text-brand">Повышение квалификации</h2>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                {p.qualifications.map((qz, i) => (
                  <li
                    key={i}
                    {...ip("qualification")}
                    className="bg-white border border-line rounded-[10px] px-5 py-[14px] text-[15px] leading-[1.5] text-ink"
                  >
                    {qz}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.profDevelopment && (
            <section>
              <h2 className="m-0 mb-3 font-display font-bold text-[22px] text-brand">Профессиональная переподготовка</h2>
              <p {...ip("profDevelopment")} className="m-0 bg-white border border-line rounded-xl px-6 py-5 text-[15px] leading-[1.6] text-ink whitespace-pre-line">
                {p.profDevelopment}
              </p>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          {(p.phone || p.email || p.dept) && (
            <div className="bg-white border border-line rounded-xl p-5">
              <div className="font-display font-bold text-[17px] text-brand mb-3">Контакты</div>
              {p.dept && <div className="text-[15px] text-steel mb-2">{p.dept}</div>}
              {p.phone && <div className="text-[15px] text-ink mb-1">{p.phone}</div>}
              {p.email && (
                <a href={`mailto:${p.email}`} className="text-[15px] text-accent underline break-words">
                  {p.email}
                </a>
              )}
            </div>
          )}
          {p.experience && (
            <div className="bg-white border border-line rounded-xl p-5">
              <div className="font-display font-bold text-[28px] text-brand leading-none" {...ip("specExperience")}>
                {p.experience}
              </div>
              <div className="text-[14px] text-ink-3 mt-1">стаж работы по специальности</div>
            </div>
          )}
        </aside>
      </main>
    </>
  );
}
