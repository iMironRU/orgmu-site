import Link from "next/link";
import { asset } from "@/lib/asset";
import type { Block, ContentPageData } from "@/lib/content/pages-types";
import { anchorId, encodeFileHref, fileExt } from "@/lib/content/pages-types";
import { Faq } from "@/components/Faq";
import { DocCards } from "@/components/sveden/DocCards";
import type { DocItem } from "@/lib/sveden/documents";
import { Tabs } from "@/components/Tabs";
import { SectionToc } from "@/components/SectionToc";
import { PriceList } from "@/components/PriceList";

// Типовая страница по макету PageTemplate.dc.html: титульная плашка, слева
// липкая навигация «В разделе» (строится из заголовков h2) и карточка помощи,
// справа — контент блоками (текст, списки, врезка, таблица, документы, FAQ).

// Документы оформляем везде одинаково — тем же DocCards, что в разделе
// «Документы» (макет Documents.dc.html): цветной бейдж формата, дата, размер,
// иконка скачивания. Заготовки без файла DocCards показывает сам.
// ЭЦП из макета не выводим: orgma не публикует подписи (.sig), подтвердить
// нечем — рисовать зелёную плашку «Подписан ЭЦП» было бы враньём.
function FilesBlock({ items }: { items: Extract<Block, { type: "files" }>["items"] }) {
  const docs: DocItem[] = items.map((f) => {
    const href = f.href && f.href !== "#" ? encodeFileHref(f.href.startsWith("/") ? asset(f.href) : f.href) : undefined;
    return {
      itemprop: "",
      title: f.name,
      href,
      fmt: fileExt(f),
      date: f.date ?? "",
      size: f.size ?? "",
      missing: !href || f.name === "—",
    };
  });
  return <DocCards docs={docs} />;
}

// Форма по макету (Feedback / Anticorruption). Сайт статический: поля живые,
// но отправка не подключена — кнопка отключена, под ней честная пометка.
// Ничего не «отправляем» молча и не показываем ложное «сообщение отправлено».
const FIELD =
  "font-ui text-[17px] px-[14px] py-[11px] border border-line-strong rounded-lg outline-none text-ink bg-white focus:border-accent";

function FormBlock({ b }: { b: Extract<Block, { type: "form" }> }) {
  return (
    <div className="bg-white border border-line rounded-xl p-6 flex flex-col gap-4">
      {b.fields.map((f, i) =>
        f.kind === "checkbox" ? (
          <label key={i} className="flex items-start gap-[10px] text-[15px] text-steel cursor-not-allowed">
            <input type="checkbox" disabled className="mt-[3px] shrink-0 accent-[rgb(184,57,4)]" />
            <span>
              {f.label}
              {f.required && <span className="text-accent"> *</span>}
            </span>
          </label>
        ) : (
          <label key={i} className="flex flex-col gap-[6px] text-[15px] font-bold text-ink-2">
            <span>
              {f.label}
              {f.required && <span className="text-accent"> *</span>}
            </span>
            {f.kind === "textarea" ? (
              <textarea rows={5} disabled className={`${FIELD} resize-y font-normal`} />
            ) : f.kind === "select" ? (
              <select disabled className={`${FIELD} font-normal cursor-not-allowed`}>
                {(f.options ?? []).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input type={f.kind} disabled className={`${FIELD} font-normal`} />
            )}
            {f.hint && <span className="text-[14px] font-normal text-ink-3">{f.hint}</span>}
          </label>
        ),
      )}

      <button
        type="button"
        disabled
        className="self-start font-ui font-bold text-[17px] text-white bg-accent rounded-[10px] px-6 py-3 border-none opacity-50 cursor-not-allowed"
      >
        {b.submitLabel ?? "Отправить"}
      </button>

      {b.note && (
        <div className="flex gap-3 px-4 py-3 bg-bg-muted border border-dashed border-line-strong rounded-[10px]">
          <span className="shrink-0 text-teal flex">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01M11 12h1v4h1" />
            </svg>
          </span>
          <div className="text-[14px] leading-[1.5] text-ink-2">
            {b.note}
            {b.noteLink && (
              <>
                {" "}
                <a href={b.noteLink.href} className="text-accent font-bold no-underline hover:underline">
                  {b.noteLink.label}
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BlockView({ b, i, num, count }: { b: Block; i: number; num?: number; count?: number }) {
  switch (b.type) {
    case "h2":
      return (
        <h2
          id={anchorId(b.text, i)}
          className="mt-2 mb-0 font-display font-bold text-[28px] text-brand scroll-mt-[100px] flex items-center gap-3 flex-wrap"
        >
          <span>{num ? `${num}. ${b.text}` : b.text}</span>
          {count !== undefined && (
            <span className="font-ui text-[14px] font-bold text-ink-3 bg-[rgb(240,243,246)] rounded-full px-[11px] py-[3px]">
              {count}
            </span>
          )}
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
    case "stats":
      return (
        <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
          {b.items.map((s, k) => (
            <div key={k} className="bg-white border border-line rounded-xl px-5 py-[18px]">
              <div className="font-display font-bold text-[32px] leading-none text-brand">{s.value}</div>
              <div className="text-[15px] text-ink-2 mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      );
    case "pricelist":
      return <PriceList items={b.items} />;
    case "contacts":
      return <ContactCards items={b.items} />;
    case "tabs":
      return <Tabs items={b.items} />;
    case "files":
      return <FilesBlock items={b.items} />;
    case "faq":
      return <Faq items={b.items} />;
    case "form":
      return <FormBlock b={b} />;
    default:
      return null;
  }
}

// Адрес/пункт приёма — карточка из макета Contacts.dc.html: полоса слева,
// название, затем строки с иконками. Единый вид для всех адресов на сайте.
function ContactRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[9px] text-[15px] text-steel leading-[1.45]">
      <span className="shrink-0 mt-[2px] text-brand/70">{icon}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

const ico = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ContactCards({
  items,
}: {
  items: { name: string; address?: string; phone?: string; email?: string; hours?: string; note?: string }[];
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      {items.map((c, k) => (
        <div
          key={k}
          className="bg-white border border-line border-l-4 border-l-accent rounded-xl px-5 py-[18px] grid grid-rows-subgrid row-span-6 gap-y-[10px] content-start"
        >
          {/* Пустые ячейки для незаполненных полей обязательны: без них строки
              съедут и выравнивание между карточками сломается. */}
          <div className="font-display font-bold text-[17px] leading-[1.25] text-brand">{c.name}</div>
          {c.address ? (
            <ContactRow
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" {...ico}>
                  <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              }
            >
              {c.address}
            </ContactRow>
          ) : (
            <span />
          )}
          {c.phone ? (
            <ContactRow
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" {...ico}>
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z" />
                </svg>
              }
            >
              {/* Несколько номеров через запятую — каждый отдельной ссылкой,
                  иначе на телефоне не позвонить ни по одному. */}
              {c.phone.split(/\s*,\s*/).map((t, i) => (
                <span key={i}>
                  {i > 0 && ", "}
                  <a href={`tel:${t.replace(/[^+\d]/g, "")}`} className="font-bold text-steel no-underline hover:text-accent">
                    {t}
                  </a>
                </span>
              ))}
            </ContactRow>
          ) : (
            <span />
          )}
          {c.email ? (
            <ContactRow
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" {...ico}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 6 10-6" />
                </svg>
              }
            >
              <a href={`mailto:${c.email}`} className="text-accent no-underline hover:underline">
                {c.email}
              </a>
            </ContactRow>
          ) : (
            <span />
          )}
          {c.hours ? (
            <ContactRow
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" {...ico}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              }
            >
              {c.hours}
            </ContactRow>
          ) : (
            <span />
          )}
          {c.note ? <div className="text-[14px] text-ink-3 leading-[1.45]">{c.note}</div> : <span />}
        </div>
      ))}
    </div>
  );
}

export function ContentPage({
  page,
  sideNav,
}: {
  page: ContentPageData;
  // Меню соседних страниц раздела (паттерн «Подразделы» из sveden). Ставится
  // над оглавлением этой страницы. Нужен разделам вроде НИЦ, где страниц
  // несколько; у одиночных типовых страниц его просто нет.
  sideNav?: React.ReactNode;
}) {
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
            {sideNav}
            {nav.length > 0 &&
              (numbered ? (
                <SectionToc title={page.toc?.title ?? "Разделы"} items={nav} />
              ) : (
                <div className="bg-white border border-line rounded-xl overflow-hidden">
                  <div className="px-5 py-4 bg-bg-muted border-b border-line font-bold text-[16px] uppercase tracking-[0.04em] text-ink-2">
                    {page.toc?.title ?? "Разделы"}
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
          {page.blocks.map((b, i) => {
            // Счётчик у заголовка — как в разделе «Документы»: число файлов
            // ближайшего следующего блока files (до следующего h2).
            let count: number | undefined;
            if (b.type === "h2") {
              for (let k = i + 1; k < page.blocks.length; k++) {
                const nb = page.blocks[k];
                if (nb.type === "h2") break;
                if (nb.type === "files") {
                  count = nb.items.length;
                  break;
                }
              }
            }
            return <BlockView key={i} b={b} i={i} num={numByIndex.get(i)} count={count} />;
          })}
        </article>
      </div>
    </>
  );
}
