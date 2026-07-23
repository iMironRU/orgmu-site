import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { notFound } from "next/navigation";
import { getPrograms, getProgram } from "@/lib/content/programs";
import { getProgramPage } from "@/lib/content/program-page";
import { levelColor } from "@/lib/content/programs-types";
import { SectionToc } from "@/components/SectionToc";
import { CostTabs, DocTabs } from "@/components/ProgramTabs";
import { DocCards } from "@/components/sveden/DocCards";
import type { DocItem } from "@/lib/sveden/documents";
import type { ProgramDoc } from "@/lib/content/programs-types";

// Страница программы по макету ProgramPage.dc.html: шапка с плашками-фактами,
// слева липкая навигация, справа семь разделов. Данные, которых нет в парсинге
// sveden, берутся из content/programs/pages/<код>.yml (шаблон _TEMPLATE.yml);
// файла нет — разделы на месте, значения прочерками.

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

// Разделы макета. Показываем все, даже пустые: перечень обязательный,
// исчезнувший раздел читается как «у вуза этого нет».
const SECTIONS = [
  { id: "o-programme", label: "О программе" },
  { id: "ispytaniya", label: "Вступительные испытания" },
  { id: "mesta-i-stoimost", label: "Места приёма и стоимость" },
  { id: "gruppy", label: "Конкурсные группы" },
  { id: "chislennost", label: "Численность обучающихся" },
  { id: "vakantnye", label: "Вакантные места для приёма (перевода)" },
  { id: "dokumenty", label: "Учебные планы и документы" },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="m-0 font-display font-bold text-[26px] text-brand scroll-mt-[100px]">
      {children}
    </h2>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | undefined)[][] }) {
  return (
    <div className="overflow-x-auto border border-line rounded-xl">
      <table className="w-full border-collapse text-[17px]">
        <thead>
          <tr className="bg-bg-muted">
            {head.map((h) => (
              <th key={h} className="text-left px-[18px] py-[14px] font-bold text-brand border-b-2 border-sky-soft whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={`px-[18px] py-[13px] border-b border-line align-top ${j === 0 ? "text-ink" : "text-steel"}`}>
                  {c || DASH}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getProgram(id);
  if (!p) notFound();
  const d = getProgramPage(p.code);

  // Плашки-факты: заполненные вручную, иначе — из парсинга.
  const facts =
    d.facts.length > 0
      ? d.facts
      : [
          { value: p.term || DASH, label: "Срок обучения" },
          { value: p.form || DASH, label: "Форма" },
          { value: p.kcpBudget || DASH, label: "Бюджетных мест" },
          { value: p.score || DASH, label: "Проходной балл" },
        ];

  // Документы из парсинга sveden — запасной вариант, пока не заполнены
  // вкладки по годам набора в <код>.yml.
  const docs: DocItem[] = [p.disciplinesDoc, p.practicesDoc, ...(p.opDocs ?? [])]
    .filter((x): x is ProgramDoc => !!x)
    .map(toDocItem);

  return (
    <>
      {/* Шапка */}
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/programmy" className="text-white/90 no-underline">Образовательные программы</Link>
            <span>/</span>
            <span>{p.code}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span
              className="font-ui font-bold text-[13px] uppercase tracking-[0.04em] text-white rounded-md px-[10px] py-1"
              style={{ background: levelColor(p.levelCat) }}
            >
              {p.level}
            </span>
            <span className="font-ui text-[15px] text-white/75">{p.code}</span>
          </div>
          <h1 className="m-0 mb-[6px] font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            {p.name}
          </h1>
          {p.faculty && <div className="font-ui text-[17px] text-white/85">{p.faculty}</div>}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mt-6 font-ui">
            {facts.map((f, i) => (
              <div key={i}>
                <div className="font-display font-bold text-[24px] leading-none">{f.value || DASH}</div>
                <div className="text-[14px] text-white/70 mt-1">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[250px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6">
            <SectionToc title="Разделы" items={SECTIONS} />
          </div>
        </aside>

        <article className="min-w-0 flex flex-col gap-6 text-[18px] leading-[1.6] text-ink">
          <section className="flex flex-col gap-4">
            <H2 id="o-programme">О программе</H2>
            <p className="m-0 whitespace-pre-line">{d.about || p.description || DASH}</p>
            {d.career.length > 0 && (
              <>
                <div className="font-bold text-[17px] text-ink-2">Кем работать</div>
                <ul className="m-0 pl-[22px] flex flex-col gap-2 list-disc">
                  {d.career.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <H2 id="ispytaniya">Вступительные испытания</H2>
            <Table
              head={["Предмет", "Минимальный балл", "Приоритет"]}
              rows={d.exams.length > 0 ? d.exams.map((e) => [e.subject, e.min, e.prio]) : [[DASH, DASH, DASH]]}
            />
            {d.scores.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                {d.scores.map((s, i) => (
                  <div key={i} className="bg-white border border-line rounded-xl px-5 py-4">
                    <div className="font-display font-bold text-[26px] leading-none text-brand">{s.value}</div>
                    <div className="text-[14px] text-ink-3 mt-1">Проходной {s.year}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <H2 id="mesta-i-stoimost">Места приёма и стоимость</H2>
            <Table
              head={["Бюджет", "Целевая квота", "По договору"]}
              rows={[[d.places?.budget ?? p.kcpBudget, d.places?.target ?? p.kcpTarget, d.places?.paid ?? p.kcpPaid]]}
            />
            <CostTabs cost={d.cost} />
          </section>

          <section className="flex flex-col gap-4">
            <H2 id="gruppy">Конкурсные группы</H2>
            <Table
              head={["Группа", "Пояснение", "Мест"]}
              rows={d.groups.length > 0 ? d.groups.map((g) => [g.name, g.note, g.places]) : [[DASH, DASH, DASH]]}
            />
          </section>

          <section className="flex flex-col gap-4">
            <H2 id="chislennost">Численность обучающихся</H2>
            <Table
              head={["Форма обучения", "За счёт бюджета", "По договорам", "Иностранные граждане"]}
              rows={d.counts.length > 0 ? d.counts.map((c) => [c.form, c.budget, c.paid, c.foreign]) : [[DASH, DASH, DASH, DASH]]}
            />
          </section>

          <section className="flex flex-col gap-4">
            <H2 id="vakantnye">Вакантные места для приёма (перевода)</H2>
            <Table
              head={["Курс", "Бюджет", "По договору"]}
              rows={d.vacant.length > 0 ? d.vacant.map((v) => [v.course, v.budget, v.paid]) : [[DASH, DASH, DASH]]}
            />
          </section>

          <section className="flex flex-col gap-4">
            <H2 id="dokumenty">Учебные планы и документы</H2>
            {d.docs.length > 0 ? <DocTabs docs={d.docs} /> : docs.length > 0 ? <DocCards docs={docs} /> : (
              <p className="m-0 text-[17px] text-ink-3">Учебные планы и документы не заполнены.</p>
            )}
            {(d.sign?.signer || d.sign?.valid) && (
              <div className="text-[14px] text-ink-3">
                Утвердил: {d.sign?.signer || DASH} · действует до {d.sign?.valid || DASH}
              </div>
            )}
          </section>
        </article>
      </div>
    </>
  );
}
