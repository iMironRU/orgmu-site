import Link from "next/link";
import { asset } from "@/lib/asset";
import type { Block, ContentPageData } from "@/lib/content/pages-types";
import { anchorId, fileExt } from "@/lib/content/pages-types";
import { Faq } from "@/components/Faq";
import { SectionToc } from "@/components/SectionToc";

// Типовая страница по макету PageTemplate.dc.html: титульная плашка, слева
// липкая навигация «В разделе» (строится из заголовков h2) и карточка помощи,
// справа — контент блоками (текст, списки, врезка, таблица, документы, FAQ).

function FilesBlock({ items }: { items: Extract<Block, { type: "files" }>["items"] }) {
  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((f, i) => (
        <a
          key={i}
          // Файлы из public — обычный <a>, basePath добавляем сами.
          href={f.href.startsWith("/") ? asset(f.href) : f.href}
          className="flex items-center gap-[14px] px-[18px] py-[14px] bg-white border border-line rounded-[10px] no-underline hover:border-accent transition-colors"
        >
          <span className="shrink-0 flex items-center justify-center w-[42px] h-[42px] rounded-lg bg-[rgba(184,57,4,0.12)] text-accent font-display font-bold text-[12px]">
            {fileExt(f)}
          </span>
          <span className="flex-1 font-bold text-[17px] text-brand break-words">{f.name}</span>
          <span className="shrink-0 text-[15px] text-ink-3">{f.size || ""}</span>
        </a>
      ))}
    </div>
  );
}

function BlockView({ b, i, num }: { b: Block; i: number; num?: number }) {
  switch (b.type) {
    case "h2":
      return (
        <h2
          id={anchorId(b.text, i)}
          className="mt-2 mb-0 font-display font-bold text-[28px] text-brand scroll-mt-[100px]"
        >
          {num ? `${num}. ${b.text}` : b.text}
        </h2>
      );
    case "text":
      return <p className="m-0 whitespace-pre-line">{b.text}</p>;
    case "list":
      return (
        <ul className="m-0 pl-[22px] flex flex-col gap-2 list-disc">
          {b.items.map((x, k) => (
            <li key={k}>{x}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className="flex gap-[14px] px-5 py-[18px] bg-[rgba(184,57,4,0.10)] rounded-[10px]">
          <span className="shrink-0 text-accent flex">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 7.5v.01" />
            </svg>
          </span>
          <div className="text-[17px] text-steel whitespace-pre-line">{b.text}</div>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto border border-line rounded-xl">
          <table className="w-full border-collapse text-[17px]">
            <thead>
              <tr className="bg-bg-muted">
                {b.head.map((h, k) => (
                  <th
                    key={k}
                    className="text-left px-[18px] py-[14px] font-bold text-brand border-b-2 border-sky-soft whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, k) => (
                <tr key={k}>
                  {row.map((c, j) => (
                    <td
                      key={j}
                      className={`px-[18px] py-[13px] border-b border-line align-top ${j === 0 ? "text-ink" : "text-steel"}`}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "files":
      return <FilesBlock items={b.items} />;
    case "faq":
      return <Faq items={b.items} />;
    default:
      return null;
  }
}

export function ContentPage({ page }: { page: ContentPageData }) {
  // Оглавление — заголовки h2 страницы.
  const nav = page.blocks
    .map((b, i) => (b.type === "h2" ? { label: b.text, id: anchorId(b.text, i) } : null))
    .filter((x): x is { label: string; id: string } => x !== null);
  const numbered = page.toc?.numbered === true;
  // Порядковый номер раздела по индексу блока — для нумерации h2.
  const numByIndex = new Map<number, number>();
  if (numbered) {
    let n = 0;
    page.blocks.forEach((b, i) => {
      if (b.type === "h2") numByIndex.set(i, ++n);
    });
  }

  return (
    <>
      {/* Титульная плашка */}
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            {page.breadcrumb && (
              <>
                <Link href={page.breadcrumb.href} className="text-white/90 no-underline">
                  {page.breadcrumb.label}
                </Link>
                <span>/</span>
              </>
            )}
            <span>{page.title}</span>
          </div>
          <h1 className="m-0 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            {page.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 py-10 box-border grid grid-cols-[264px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        {/* Навигация по разделу */}
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6 flex flex-col gap-4">
            {nav.length > 0 &&
              (numbered ? (
                <SectionToc title={page.toc?.title ?? "Содержание"} items={nav} />
              ) : (
                <div className="bg-white border border-line rounded-xl overflow-hidden">
                  <div className="px-5 py-4 bg-bg-muted border-b border-line font-bold text-[16px] uppercase tracking-[0.04em] text-ink-2">
                    {page.toc?.title ?? "В разделе"}
                  </div>
                  <nav className="flex flex-col p-2">
                    {nav.map((n) => (
                      <a
                        key={n.id}
                        href={`#${n.id}`}
                        className="px-[14px] py-[11px] rounded-lg text-[17px] text-steel no-underline hover:bg-bg-muted"
                      >
                        {n.label}
                      </a>
                    ))}
                  </nav>
                </div>
              ))}

            {page.help && (
              <div className="bg-brand rounded-xl p-5 text-white">
                <div className="font-display font-bold text-[18px] mb-[6px]">
                  {page.help.title ?? "Нужна помощь?"}
                </div>
                {page.help.text && (
                  <div className="text-[16px] text-white/85 mb-[14px]">{page.help.text}</div>
                )}
                {page.help.href && page.help.linkLabel && (
                  <a
                    href={page.help.href}
                    className="inline-block font-bold text-[15px] text-brand bg-white rounded-lg px-4 py-[9px] no-underline"
                  >
                    {page.help.linkLabel}
                  </a>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Контент */}
        <article className="min-w-0 flex flex-col gap-[26px] text-[19px] leading-[1.65] text-ink">
          {page.lead && (
            <p className="m-0 font-medium text-[22px] leading-[1.5] text-steel">{page.lead}</p>
          )}
          {page.blocks.map((b, i) => (
            <BlockView key={i} b={b} i={i} num={numByIndex.get(i)} />
          ))}
        </article>
      </div>
    </>
  );
}
