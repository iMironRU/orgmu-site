"use client";

import { useEffect, useState } from "react";

// Оглавление служебных страниц (макеты NOK/Dissovet/Zakupki и др.):
// «Содержание», нумерованные пункты, подсветка текущего раздела при скролле
// и плавная прокрутка со смещением под шапку.
export function SectionToc({
  title = "Содержание",
  items,
}: {
  title?: string;
  items: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      let current = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= 120) current = it.id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" });
  };

  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-bg-muted border-b border-line font-bold text-[16px] uppercase tracking-[0.04em] text-ink-2">
        {title}
      </div>
      <nav className="flex flex-col p-2">
        {items.map((t, i) => {
          const on = t.id === active;
          return (
            <a
              key={t.id}
              href={`#${t.id}`}
              onClick={(e) => go(e, t.id)}
              className="px-[14px] py-[10px] rounded-lg text-[15.5px] leading-[1.3] no-underline hover:bg-bg-muted"
              style={{
                fontWeight: on ? 700 : 400,
                color: on ? "var(--c-brand)" : "var(--c-steel)",
                background: on ? "rgba(184,57,4,0.12)" : "transparent",
              }}
            >
              <span className="opacity-65 mr-[6px]">{i + 1}.</span>
              {t.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
