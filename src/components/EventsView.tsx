"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/lib/content/events-types";
import { EVENT_CATEGORIES } from "@/lib/content/events-types";
import { EventCard } from "@/components/EventCard";

// Витрина мероприятий по макету Events.dc.html: чипы-фильтры по категориям + сетка карточек.
export function EventsView({ events }: { events: EventItem[] }) {
  const [cat, setCat] = useState<string | null>(null);

  // Показываем только те категории, что реально встречаются.
  const cats = useMemo(
    () => EVENT_CATEGORIES.filter((c) => events.some((e) => e.category === c)),
    [events],
  );
  const list = useMemo(() => (cat ? events.filter((e) => e.category === cat) : events), [events, cat]);

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
      <div className="flex flex-wrap gap-[10px] mb-8">
        <Chip label="Все" active={cat === null} onClick={() => setCat(null)} />
        {cats.map((c) => (
          <Chip key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
        ))}
      </div>

      {list.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl">
          <div className="font-display font-bold text-[20px] text-brand mb-[6px]">Мероприятий нет</div>
          <div className="text-[16px] text-ink-2">В этой категории пока ничего не запланировано.</div>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {list.map((e) => (
            <EventCard key={e.slug} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}
