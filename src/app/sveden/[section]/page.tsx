import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listSectionKeys, getSection } from "@/lib/sveden/vocab";
import { SECTION_LABELS, SECTION_SHORT } from "@/lib/sveden/labels";
import { SvedenSection } from "@/components/sveden/SvedenSection";

export const dynamicParams = false;

export function generateStaticParams() {
  return listSectionKeys().map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const title = SECTION_LABELS[section];
  if (!title) return {};
  return { title: `${title} — Сведения об ОО` };
}

export default async function SvedenSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: key } = await params;
  const section = getSection(key);
  if (!section) notFound();

  const title = SECTION_LABELS[key] ?? key;

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">
              Главная
            </Link>
            <span>/</span>
            <Link href="/sveden" className="text-white/90 no-underline">
              Сведения об ОО
            </Link>
            <span>/</span>
            <span>{SECTION_SHORT[key] ?? key}</span>
          </div>
          <h1 className="m-0 font-display font-bold text-[32px] leading-[1.12] max-[768px]:text-[24px]">
            {title}
          </h1>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-10 pb-16 box-border max-[768px]:px-5">
        {/* Навигация по подразделам */}
        <div className="flex flex-wrap gap-2 mb-8">
          {listSectionKeys().map((k) => (
            <Link
              key={k}
              href={`/sveden/${k}`}
              className="text-[13px] font-ui rounded-full px-3 py-[6px] no-underline border"
              style={{
                color: k === key ? "#fff" : "var(--c-steel)",
                background: k === key ? "var(--c-brand)" : "var(--c-bg)",
                borderColor: k === key ? "var(--c-brand)" : "var(--c-line-strong)",
              }}
            >
              {SECTION_SHORT[k] ?? k}
            </Link>
          ))}
        </div>

        <SvedenSection sectionKey={key} section={section} />

        <p className="mt-10 text-[14px] text-ink-3 font-ui border-t border-line pt-5">
          Подраздел размечен машиночитаемой микроразметкой по спецификации
          Рособрнадзора (приказ № 1493): значения полей выше проставлены в
          атрибутах <code>itemprop</code> для автоматического сбора мониторингом.
          {section.source ? ` Источник структуры: ${section.source}.` : ""}
        </p>
      </main>
    </>
  );
}
