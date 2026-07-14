"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/content/news-types";
import { NewsCard } from "@/components/NewsCard";

const PER_PAGE = 12;

// Лента новостей с пагинацией (по макету News.dc.html).
export function NewsListView({ items }: { items: NewsItem[] }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const cur = Math.min(page, pageCount);
  const slice = items.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  const go = (n: number) => {
    setPage(Math.min(Math.max(1, n), pageCount));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // номера страниц: 1 … cur-1 cur cur+1 … last
  const nums: (number | "…")[] = [];
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || (i >= cur - 1 && i <= cur + 1)) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }

  const cell =
    "w-10 h-10 flex items-center justify-center rounded-lg border border-line-strong text-steel cursor-pointer font-ui";

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
        {slice.map((item) => (
          <NewsCard key={item.source.item_id} item={item} />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex gap-[6px] items-center justify-center mt-10 flex-wrap">
          <button type="button" aria-label="Назад" onClick={() => go(cur - 1)} className={`${cell} ${cur === 1 ? "opacity-40 cursor-default" : "hover:border-accent"}`}>
            ‹
          </button>
          {nums.map((n, i) =>
            n === "…" ? (
              <span key={`e${i}`} className="text-ink-3 px-1">…</span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => go(n)}
                className="w-10 h-10 flex items-center justify-center rounded-lg font-ui cursor-pointer"
                style={{
                  background: n === cur ? "var(--c-accent)" : "var(--c-bg)",
                  color: n === cur ? "#fff" : "var(--c-steel)",
                  fontWeight: n === cur ? 700 : 400,
                  border: n === cur ? "none" : "1px solid var(--c-line-strong)",
                }}
              >
                {n}
              </button>
            ),
          )}
          <button type="button" aria-label="Вперёд" onClick={() => go(cur + 1)} className={`${cell} ${cur === pageCount ? "opacity-40 cursor-default" : "hover:border-accent"}`}>
            ›
          </button>
        </div>
      )}
    </>
  );
}
