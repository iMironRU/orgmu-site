import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrograms, getProgram } from "@/lib/content/programs";
import { DocCards } from "@/components/sveden/DocCards";
import type { DocItem } from "@/lib/sveden/documents";
import type { ProgramDoc } from "@/lib/content/programs-types";

export const dynamicParams = false;
const DASH = "—";

export function generateStaticParams() {
  return getPrograms().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getProgram(id);
  return p ? { title: `${p.name} (${p.code})` } : {};
}

const toDocItem = (d: ProgramDoc): DocItem => ({
  itemprop: "",
  title: d.label,
  href: d.href,
  fmt: d.fmt,
  date: d.date,
  size: d.size,
  missing: false,
});

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display font-bold text-[24px] leading-none">{value || DASH}</div>
      <div className="text-[14px] text-white/70 mt-1">{label}</div>
    </div>
  );
}

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getProgram(id);
  if (!p) notFound();

  const docs: ProgramDoc[] = [
    ...p.opDocs,
    ...(p.disciplinesDoc ? [p.disciplinesDoc] : []),
    ...(p.practicesDoc ? [p.practicesDoc] : []),
  ];
  const vacantRows = p.vacant
    ? [
        ["Бюджет РФ", p.vacant.bf],
        ["Бюджет субъекта", p.vacant.br],
        ["Местный бюджет", p.vacant.bm],
        ["По договорам", p.vacant.paid],
      ].filter(([, v]) => v && v !== "0")
    : [];

  return (
    <>
      {/* Герой */}
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1000px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-4 font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/programmy" className="text-white/90 no-underline">Образование</Link>
            <span>/</span>
            <span>{p.name}</span>
          </div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-[13px] font-bold uppercase tracking-[0.04em] bg-white/20 rounded-md px-[10px] py-1">
              {p.level}
            </span>
            <span className="font-display font-bold text-[15px] text-white/80">{p.code}</span>
          </div>
          <h1 className="m-0 font-display font-bold text-[36px] leading-[1.08] max-[768px]:text-[26px]">{p.name}</h1>
          <div className="text-[17px] text-white/85 mt-2">
            {[p.faculty, p.qualification].filter(Boolean).join(" · ") || `Профиль: ${p.profile || DASH}`}
          </div>
          <div className="flex gap-8 mt-6 flex-wrap">
            <Fact value={p.form} label="форма обучения" />
            <Fact value={p.term} label="срок обучения" />
            {p.graduates?.total && <Fact value={p.graduates.total} label="выпускников за год" />}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1000px] w-full px-10 pt-10 pb-16 box-border max-[768px]:px-5 flex flex-col gap-8 font-ui">
        {/* О программе */}
        <section>
          <h2 className="m-0 mb-3 font-display font-bold text-[24px] text-brand">О программе</h2>
          {p.description ? (
            <div className="text-[18px] leading-[1.6] text-ink whitespace-pre-line">{p.description}</div>
          ) : (
            <div className="text-[16px] text-ink-3 bg-white border border-dashed border-line-strong rounded-xl px-6 py-5">
              Описание программы уточняется. {DASH}
            </div>
          )}
        </section>

        {/* Вступительные испытания */}
        <section>
          <h2 className="m-0 mb-3 font-display font-bold text-[24px] text-brand">Вступительные испытания</h2>
          {p.exams && p.exams.length > 0 ? (
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[17px] text-ink">
              {p.exams.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          ) : (
            <div className="text-[16px] text-ink-3 bg-white border border-dashed border-line-strong rounded-xl px-6 py-5">
              Перечень вступительных испытаний уточняется. {DASH}
            </div>
          )}
        </section>

        {/* Вакантные места */}
        {vacantRows.length > 0 && (
          <section>
            <h2 className="m-0 mb-3 font-display font-bold text-[24px] text-brand">Вакантные места для приёма</h2>
            <div className="flex gap-4 flex-wrap">
              {vacantRows.map(([label, value]) => (
                <div key={label} className="bg-white border border-line rounded-xl px-6 py-4 min-w-[160px]">
                  <div className="font-display font-bold text-[28px] text-brand leading-none">{value}</div>
                  <div className="text-[14px] text-ink-3 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Документы */}
        {docs.length > 0 && (
          <section>
            <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Документы программы</h2>
            <DocCards docs={docs.map(toDocItem)} />
          </section>
        )}

        {/* Трудоустройство */}
        {p.graduates && (p.graduates.total || p.graduates.employed) && (
          <section>
            <h2 className="m-0 mb-3 font-display font-bold text-[24px] text-brand">Трудоустройство выпускников</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white border border-line rounded-xl px-6 py-4 min-w-[160px]">
                <div className="font-display font-bold text-[28px] text-brand leading-none">{p.graduates.total || DASH}</div>
                <div className="text-[14px] text-ink-3 mt-1">выпускников прошлого года</div>
              </div>
              <div className="bg-white border border-line rounded-xl px-6 py-4 min-w-[160px]">
                <div className="font-display font-bold text-[28px] text-brand leading-none">{p.graduates.employed || DASH}</div>
                <div className="text-[14px] text-ink-3 mt-1">трудоустроено</div>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
