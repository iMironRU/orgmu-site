"use client";

import { useState } from "react";

// Вкладки типовой страницы (макет InfoSecurity: памятки по аудиториям).
export function Tabs({ items }: { items: { label: string; items: string[] }[] }) {
  const [active, setActive] = useState(0);
  const cur = items[active];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-[10px]">
        {items.map((t, i) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setActive(i)}
            className="text-[15px] font-medium rounded-full px-[17px] py-[7px] border cursor-pointer transition-colors"
            style={{
              color: i === active ? "#fff" : "var(--c-steel)",
              background: i === active ? "var(--c-accent)" : "#fff",
              borderColor: i === active ? "var(--c-accent)" : "var(--c-line-strong)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {cur && (
        <ul className="m-0 pl-[22px] flex flex-col gap-2 list-disc">
          {cur.items.map((x, k) => (
            <li key={k}>{x}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
