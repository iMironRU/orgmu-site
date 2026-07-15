"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/content/pages-types";

// Аккордеон «Частые вопросы» по макету PageTemplate.dc.html: открыт один пункт.
export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((q, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="bg-white border border-line rounded-[10px] overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-none border-none cursor-pointer text-left font-ui font-bold text-[18px] text-brand"
            >
              {q.q}
              <span className="text-sky-soft text-[22px] leading-none">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="px-5 pb-[18px] text-[17px] leading-[1.6] text-steel whitespace-pre-line">
                {q.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
