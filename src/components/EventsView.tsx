"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/lib/content/events-types";
import { EVENT_CATEGORIES } from "@/lib/content/events-types";
import { EventCard } from "@/components/EventCard";

type Tab = "upcoming" | "past";

// Витрина мероприятий по макету Events.dc.html: чипы-фильтры + сетка карточек.
// Сверху — переключатель «Предстоящие / Прошедшие»: афиша показывает будущее,
// архив — то, что уже прошло.
export function EventsView({ upcoming, past }: { upcoming: EventItem[]; past: EventItem[] }) {
  // Если предстоящих нет — сразу открываем архив, чтобы раздел не выглядел пустым.
  const [tab, setTab] = useState<Tab>(upcoming.length > 0 ? "upcoming" : "past");
  const [cat, setCat] = useState<string | null>(null);

  const events = tab === "upcoming" ? upcoming : past;

  // Показываем только те категории, что реально встречаются во вкладке.
  const cats = useMemo(
    () => EVENT_CATEGORIES.filter((c) => events.some((e) => e.category === c)),
    [events],
  );
  const list = useMemo(() => (cat ? events.filter((e) => e.category === cat) : events), [events, cat]);

  const pick = (t: Tab) => {
    setTab(t);
    setCat(null);
  };

  const Chip = ({
    label,
    active,
    onClick,
    count,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
    count?: number;
  }) => (
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
      {count !== undefined && <span className={active ? "text-white/75" : "text-ink-3"}> · {count}</span>}
    </button>
  );

  return (
    <div className="font-ui">
      {/* Предстоящие / Прошедшие */}
      <div className="flex flex-wrap gap-[10px] mb-4">
        <Chip label="Предстоящие" active={tab === "upcoming"} onClick={() => pick("upcoming")} count={upcoming.length} />
        <Chip label="Прошедшие" active={tab === "past"} onClick={() => pick("past")} count={past.length} />
      </div>

      {/* Категории */}
      {cats.length > 1 && (
        <div className="flex flex-wrap gap-[10px] mb-8 pt-4 border-t border-line">
          <Chip label="Все" active={cat === null} onClick={() => setCat(null)} />
          {cats.map((c) => (
            <Chip key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl">
          <div className="font-display font-bold text-[20px] text-brand mb-[6px]">
            {tab === "upcoming" ? "Предстоящих мероприятий нет" : "Мероприятий нет"}
          </div>
          <div className="text-[16px] text-ink-2">
            {tab === "upcoming"
              ? "Как только появится новый план мероприятий, афиша заполнится. Посмотрите, что уже прошло."
              : "В этой категории ничего не найдено."}
          </div>
          {tab === "upcoming" && past.length > 0 && (
            <button
              type="button"
              onClick={() => pick("past")}
              className="mt-4 font-bold text-[15px] text-accent bg-none border-none cursor-pointer"
            >
              Показать прошедшие ({past.length}) →
            </button>
          )}
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
