import type { Metadata } from "next";
import Link from "next/link";
import { getPrograms } from "@/lib/content/programs";
import { getSectionFileDocs } from "@/lib/sveden/documents";
import { DocCards } from "@/components/sveden/DocCards";

export const metadata: Metadata = {
  title: "Платные образовательные услуги",
  description:
    "Стоимость обучения по образовательным программам ОрГМУ, порядок оказания платных услуг и образец договора.",
};

const DASH = "—";

export default function PaidServicesPage() {
  const programs = getPrograms()
    .filter((p) => p.form) // действующие программы
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  const docs = getSectionFileDocs("paid_edu");

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
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            Платные образовательные услуги
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            Стоимость обучения по программам, порядок оказания платных услуг и
            образец договора.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 flex flex-col gap-8 font-ui">
        <section>
          <div className="flex items-end justify-between gap-3 mb-4 flex-wrap">
            <h2 className="m-0 font-display font-bold text-[24px] text-brand">
              Стоимость обучения по программам
            </h2>
            <span className="text-[15px] text-ink-3">Программ: {programs.length}</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
            {programs.map((p) => (
              <Link
                key={p.id}
                href={`/programmy/${p.id}`}
                className="flex flex-col gap-1 bg-white border border-line rounded-xl p-5 no-underline hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center gap-2 text-[13px] text-ink-3">
                  <span className="font-display font-bold">{p.code}</span>
                  <span>· {p.form}</span>
                  {p.term && <span>· {p.term}</span>}
                </div>
                <div className="font-bold text-[18px] leading-[1.2] text-brand">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display font-bold text-[22px] text-brand">
                    {p.price ? `${p.price} ₽` : DASH}
                  </span>
                  <span className="text-[13px] text-ink-3">за 1 курс</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-[14px] text-ink-3">
            Стоимость фиксируется в год поступления. Значения «{DASH}» уточняются —
            заполняются в{" "}
            <code>content/programs/programs-extra.yml</code> (поле <code>price</code>).
          </p>
        </section>

        {docs.length > 0 && (
          <section>
            <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Документы</h2>
            <DocCards docs={docs} />
          </section>
        )}
      </main>
    </>
  );
}
