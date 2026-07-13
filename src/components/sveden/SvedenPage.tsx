import Link from "next/link";
import { listSectionKeys, getSection } from "@/lib/sveden/vocab";
import { SECTION_LABELS, SECTION_SHORT, SECTION_LEADS } from "@/lib/sveden/labels";
import { SvedenSection } from "@/components/sveden/SvedenSection";

// Страница раздела «Сведения об ОО» по макету Svedenia: титульная плашка +
// две колонки (слева навигация по 14 подразделам, справа контент подраздела).
export function SvedenPage({ sectionKey }: { sectionKey: string }) {
  const keys = listSectionKeys();
  const section = getSection(sectionKey)!;
  const num = keys.indexOf(sectionKey) + 1;
  const title = SECTION_LABELS[sectionKey] ?? sectionKey;

  return (
    <>
      {/* Титульная плашка */}
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1200px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">
              Главная
            </Link>
            <span>/</span>
            <span>Сведения об образовательной организации</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            Сведения об образовательной организации
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            Специальный раздел по приказу Рособрнадзора № 1493 и ст. 29 ФЗ-273.
            Структура и состав сведений фиксированы; данные продублированы в
            машиночитаемом виде.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[300px_1fr] gap-9 max-[900px]:grid-cols-1 max-[768px]:px-5">
        {/* Левая навигация */}
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6 flex flex-col gap-4">
            <nav className="bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-[18px] py-[15px] bg-bg-muted border-b border-line font-ui font-bold text-[15px] uppercase tracking-[0.04em] text-ink-2">
                Подразделы
              </div>
              <div className="flex flex-col p-2">
                {keys.map((k, i) => {
                  const active = k === sectionKey;
                  return (
                    <Link
                      key={k}
                      href={`/sveden/${k}`}
                      className="flex items-center gap-[11px] px-3 py-[10px] rounded-lg no-underline font-ui text-[16px] hover:bg-[rgb(245,248,251)]"
                      style={{
                        background: active ? "rgba(184,57,4,0.12)" : "transparent",
                        color: active ? "var(--c-brand)" : "var(--c-steel)",
                        fontWeight: active ? 700 : 400,
                      }}
                    >
                      <span
                        className="shrink-0 w-[22px] h-[22px] rounded-md font-display text-[12px] font-bold flex items-center justify-center"
                        style={{
                          background: active ? "var(--c-brand)" : "rgb(240,243,246)",
                          color: active ? "#fff" : "rgb(120,140,160)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1">{SECTION_SHORT[k] ?? k}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="flex gap-[11px] px-4 py-[15px] bg-teal/10 rounded-xl">
              <span className="shrink-0 text-teal flex">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6 3 12l5 6M16 6l5 6-5 6M13 4l-2 16" />
                </svg>
              </span>
              <div className="text-[14px] leading-[1.45] text-steel font-ui">
                Каждый подраздел размечен по спецификации для автоматического
                сбора мониторингом.
              </div>
            </div>
          </div>
        </aside>

        {/* Контент подраздела */}
        <article className="min-w-0 flex flex-col gap-[22px]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="shrink-0 w-10 h-10 rounded-[10px] bg-brand text-white font-display text-[17px] font-bold flex items-center justify-center">
              {num}
            </span>
            <h2 className="m-0 font-display font-bold text-[28px] text-brand leading-[1.1] max-[768px]:text-[22px]">
              {title}
            </h2>
          </div>

          {SECTION_LEADS[sectionKey] && (
            <p className="m-0 font-ui font-medium text-[18px] leading-[1.5] text-steel">
              {SECTION_LEADS[sectionKey]}
            </p>
          )}

          <SvedenSection sectionKey={sectionKey} section={section} />

          {/* Плашка про машиночитаемость */}
          <div className="flex gap-3 px-[18px] py-4 bg-bg-muted border border-dashed border-line-strong rounded-[10px] mt-1">
            <span className="shrink-0 text-teal flex">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M7 9h10M7 13h6" />
              </svg>
            </span>
            <div className="text-[14px] leading-[1.5] text-ink-2 font-ui">
              Подраздел содержит машиночитаемую разметку по спецификации
              Рособрнадзора (приказ № 1493): значения полей проставлены в
              атрибутах <code>itemprop</code> для автоматического сбора
              мониторингом.
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
