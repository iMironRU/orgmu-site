"use client";

import Link from "next/link";
import { NavSelect } from "@/components/NavSelect";

// «Меню страницы» — тот же паттерн, что «Подразделы» в sveden: список
// СОСЕДНИХ СТРАНИЦ с подсветкой текущей. Не путать с SectionToc: тот про
// разделы одной страницы и умеет скролл-спай, здесь же выбор = переход,
// поэтому скролл-спая быть не может.
//
// На мобиле сворачивается в селект — список из шести пунктов выталкивал бы
// контент за экран.
export type PageNavItem = { label: string; href: string; note?: string };

export function PageNav({
  title,
  items,
  current,
}: {
  title: string;
  items: PageNavItem[];
  current?: string;
}) {
  return (
    <>
      {/* На мобиле селект показывает выбранный пункт, а не заголовок, — без
          подписи два соседних селекта (меню страниц и оглавление) неотличимы. */}
      <div className="min-[901px]:hidden sticky top-[60px] z-30 mb-4 -mx-1 px-1 py-2 bg-bg">
        <div className="font-ui font-bold text-[12px] uppercase tracking-[0.05em] text-ink-3 mb-[6px] px-[2px]">{title}</div>
        <NavSelect title={title} items={items} current={current} />
      </div>

      <nav className="max-[900px]:hidden bg-white border border-line rounded-xl overflow-hidden">
        <div className="px-[18px] py-[15px] bg-bg-muted border-b border-line font-ui font-bold text-[15px] uppercase tracking-[0.04em] text-ink-2">
          {title}
        </div>
        <div className="flex flex-col p-2">
          {items.map((it, i) => {
            const active = it.href === current;
            const inner = (
              <>
                <span
                  className="shrink-0 w-[22px] h-[22px] rounded-md font-display text-[12px] font-bold flex items-center justify-center"
                  style={{
                    background: active ? "var(--c-brand)" : "rgb(240,243,246)",
                    color: active ? "#fff" : "rgb(120,140,160)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block">{it.label}</span>
                  {it.note && <span className="block text-[13px] text-ink-3">{it.note}</span>}
                </span>
              </>
            );
            const cls =
              "flex items-center gap-[11px] px-3 py-[10px] rounded-lg no-underline font-ui text-[16px] hover:bg-[rgb(245,248,251)]";
            const style = {
              background: active ? "rgba(184,57,4,0.12)" : "transparent",
              color: active ? "var(--c-brand)" : "var(--c-steel)",
              fontWeight: active ? 700 : 400,
            };
            // Внешние адреса (другие хосты) — обычный <a>: next/link тут ни к чему.
            return it.href.startsWith("http") ? (
              <a key={it.href} href={it.href} className={cls} style={style}>
                {inner}
              </a>
            ) : (
              <Link key={it.href} href={it.href} className={cls} style={style}>
                {inner}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
