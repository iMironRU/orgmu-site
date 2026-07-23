import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { getPrograms } from "@/lib/content/programs";
import { getProgramPage } from "@/lib/content/program-page";
import { getPaidServices } from "@/lib/content/paid-services";
import { getSectionFileDocs } from "@/lib/sveden/documents";
import { DocCards } from "@/components/sveden/DocCards";
import { PaidPrograms, OrderTabs } from "@/components/PaidServicesView";
import { SectionToc } from "@/components/SectionToc";

// Платные образовательные услуги по макету PaidServices.dc.html: три раздела —
// стоимость по программам (с фильтрами), стоимость по курсам (вкладки по годам)
// и приказы (вкладки по годам). Цены не дублируются: за год — из парсинга
// sveden, по курсам — из content/programs/pages/<код>.yml (ключ cost).
// Приказы — content/platnye-uslugi.yml.

export const metadata: Metadata = {
  title: "Платные образовательные услуги",
  description:
    "Стоимость обучения по образовательным программам Оренбургского медицинского университета, стоимость по курсам и приказы об утверждении стоимости.",
};

const DASH = "—";

const SECTIONS = [
  { id: "po-programmam", label: "Стоимость по программам" },
  { id: "po-kursam", label: "Стоимость по курсам" },
  { id: "prikazy", label: "Приказы об утверждении стоимости" },
];

export default function PaidServicesPage() {
  const all = getPrograms();
  // Раздел про платные услуги — показываем то, где есть договорная основа.
  const paid = all.filter((p) => p.basis !== "budget");
  const ps = getPaidServices();
  const docs = getSectionFileDocs("paid_edu");

  // Матрица «программа × курсы» за первый год: собирается из cost в
  // content/programs/pages/<код>.yml. Пока файлов нет — матрица пустая.
  const year = ps.years[0];
  const matrix = year
    ? paid
        .map((p) => ({ p, rows: getProgramPage(p.code).cost?.[year] ?? [] }))
        .filter((x) => x.rows.length > 0)
    : [];
  const maxCourses = matrix.reduce((n, x) => Math.max(n, x.rows.length), 0);

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/sveden" className="text-white/90 no-underline">Сведения об организации</Link>
            <span>/</span>
            <span>Платные образовательные услуги</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            Платные образовательные услуги
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[18px] text-white/85">
            {ps.lead && ps.lead !== DASH
              ? ps.lead
              : "Стоимость обучения по договорам об оказании платных образовательных услуг, стоимость по курсам для действующих наборов и приказы об утверждении стоимости."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[250px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6">
            <SectionToc title="Разделы" items={SECTIONS} />
          </div>
        </aside>

        <article className="min-w-0 flex flex-col gap-7">
          <section className="flex flex-col gap-4">
            <h2 id="po-programmam" className="m-0 font-display font-bold text-[26px] text-brand scroll-mt-[100px]">
              Стоимость по программам
            </h2>
            <PaidPrograms programs={paid} />
          </section>

          <section className="flex flex-col gap-4">
            <h2 id="po-kursam" className="m-0 font-display font-bold text-[26px] text-brand scroll-mt-[100px]">
              Стоимость по курсам{year ? ` — набор ${year}` : ""}
            </h2>
            {matrix.length === 0 ? (
              <p className="m-0 text-[17px] text-ink-3">
                Стоимость по курсам заполняется в content/programs/pages/&lt;код&gt;.yml (ключ cost).
              </p>
            ) : (
              <div className="overflow-x-auto border border-line rounded-xl">
                <table className="w-full border-collapse text-[16px]">
                  <thead>
                    <tr className="bg-bg-muted">
                      <th className="text-left px-4 py-3 font-bold text-brand border-b-2 border-sky-soft">Программа</th>
                      {Array.from({ length: maxCourses }, (_, i) => (
                        <th key={i} className="text-left px-4 py-3 font-bold text-brand border-b-2 border-sky-soft whitespace-nowrap">
                          {i + 1} курс
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map(({ p, rows }) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 border-b border-line text-ink">{p.name}</td>
                        {Array.from({ length: maxCourses }, (_, i) => (
                          <td key={i} className="px-4 py-3 border-b border-line text-steel whitespace-nowrap">
                            {rows[i]?.price ?? DASH}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 id="prikazy" className="m-0 font-display font-bold text-[26px] text-brand scroll-mt-[100px]">
              Приказы об утверждении стоимости
            </h2>
            <OrderTabs years={ps.years} orders={ps.orders} />
            {docs.length > 0 && (
              <>
                <div className="font-bold text-[17px] text-ink-2 mt-2">Документы раздела</div>
                <DocCards docs={docs} />
              </>
            )}
          </section>
        </article>
      </div>
    </>
  );
}
