import type { Metadata } from "next";
import Link from "next/link";
import { PageNav } from "@/components/PageNav";
import { nicPages, nicNavItems, nicHref } from "@/lib/content/nic";

export const metadata: Metadata = {
  title: "Научно-исследовательский центр",
  description:
    "НИЦ ОрГМУ: лабораторные исследования, пункты забора анализов, перечень исследований и подготовка к сдаче материала.",
};

export default function NicIndexPage() {
  const pages = nicPages();
  const nav = nicNavItems();
  const noteBySlug = new Map(pages.map((p, i) => [p.slug, nav[i]?.note ?? ""]));

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <span>Научно-исследовательский центр</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            Научно-исследовательский центр
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[18px] text-white/85">
            Лабораторные исследования для населения и организаций: иммунология,
            микробиология, общеклиническая и биохимическая диагностика.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[264px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6">
            <PageNav title="Научно-исследовательский центр" items={nav} current={nicHref()} />
          </div>
        </aside>

        <main className="min-w-0">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            {pages.map((p) => (
              <Link
                key={p.slug}
                href={nicHref(p.slug)}
                className="flex flex-col gap-2 bg-white border border-line rounded-[14px] p-6 no-underline shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:border-accent transition-colors"
              >
                <span className="font-display font-bold text-[20px] text-brand leading-[1.2]">
                  {p.title}
                </span>
                {noteBySlug.get(p.slug) && (
                  <span className="text-[14px] text-ink-3">{noteBySlug.get(p.slug)}</span>
                )}
                {p.lead && <span className="text-[16px] leading-[1.5] text-steel">{p.lead}</span>}
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
