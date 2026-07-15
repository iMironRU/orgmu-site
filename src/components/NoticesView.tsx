"use client";

import { useMemo, useState } from "react";
import type { NoticeItem, NoticeKind } from "@/lib/content/notices-types";
import { NOTICE_KIND } from "@/lib/content/notices-types";
import { NoticeCard } from "@/components/NoticeCard";

const PER_PAGE = 12;

const KIND_ORDER: NoticeKind[] = ["urgent", "important", "info"];

// Витрина известий по образцу News.dc.html: чипы-фильтры (здесь — по виду
// известия) + сетка карточек + пагинация.
export function NoticesView({ items }: { items: NoticeItem[] }) {
  const [kind, setKind] = useState<NoticeKind | null>(null);
  const [page, setPage] = useState(1);

  // Показываем только те виды, что реально встречаются.
  const kinds = useMemo(
    () => KIND_ORDER.filter((k) => items.some((n) => n.kind === k)),
    [items],
  );
  const list = useMemo(() => (kind ? items.filter((n) => n.kind === kind) : items), [items, kind]);

  const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pageCount);
  const slice = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  const go = (n: number) => {
    setPage(Math.min(Math.max(1, n), pageCount));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pick = (k: NoticeKind | null) => {
    setKind(k);
    setPage(1);
  };

  // номера страниц: 1 … cur-1 cur cur+1 … last
  const nums: (number | "…")[] = [];
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || (i >= cur - 1 && i <= cur + 1)) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }

  const cell =
    "w-10 h-10 flex items-center justify-center rounded-lg border border-line-strong text-steel cursor-pointer font-ui";

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="text-[15px] font-medium rounded-full px-[17px] py-[7px] border cursor-pointer transition-colors"
      style={{
        color: active ? "#fff" : "var(--c-steel)",
        background: active ? "var(--c-accent)" : "#fff",
        borderColor: active ? "var(--c-accent)" : "var(--c-line-strong)",
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="font-ui">
      {kinds.length > 1 && (
        <div className="flex flex-wrap gap-[10px] mb-8">
          <Chip label="Все" active={kind === null} onClick={() => pick(null)} />
          {kinds.map((k) => (
            <Chip key={k} label={NOTICE_KIND[k].tag} active={kind === k} onClick={() => pick(k)} />
          ))}
        </div>
      )}

      {slice.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl">
          <div className="font-display font-bold text-[20px] text-brand mb-[6px]">Известий нет</div>
          <div className="text-[16px] text-ink-2">В этой категории сейчас нет действующих известий.</div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {slice.map((n) => (
            <NoticeCard key={n.id} n={n} />
          ))}
        </div>
      )}

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
    </div>
  );
}
