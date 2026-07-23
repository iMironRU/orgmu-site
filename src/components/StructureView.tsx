"use client";

import { useMemo, useState } from "react";
import { Link } from "@/components/Link";
import { IconPin, IconPhone, IconMail } from "@/components/contact-icons";

import { formatPhone } from "@/lib/phone";
import type { Unit } from "@/lib/content/structure-types";
import { typeMeta, initials, avatarColor, TYPE_META } from "@/lib/content/structure-types";
import { STRUCTURE_UI } from "@/lib/i18n/ui-defs";

function Meta({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center gap-[6px]">
      <span className="shrink-0 text-ink-3">{icon}</span>
      {children}
    </span>
  );
}


// Формат файла из адреса — для компактного бейджа в плитке подразделения.
function docFmt(href: string): string {
  const e = decodeURIComponent(href).match(/\.([a-z0-9]+)(?:$|[?#])/i)?.[1]?.toUpperCase();
  return e || "—";
}

export function StructureView({
  units,
  ui,
  typeLabels,
}: {
  units: Unit[];
  ui?: Partial<typeof STRUCTURE_UI>;
  /** Переведённые подписи типов (kafedra → Department): TYPE_META знает только русские. */
  typeLabels?: Record<string, string>;
}) {
  const s_ = { ...STRUCTURE_UI, ...ui };
  const [q, setQ] = useState("");
  const [types, setTypes] = useState<string[]>([]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return units.filter(
      (u) =>
        (types.length === 0 || types.includes(u.type)) &&
        (!query || u.name.toLowerCase().includes(query)),
    );
  }, [units, q, types]);

  const filtering = !!q.trim() || types.length > 0;
  const isFiltered = filtering;

  // типы, реально встречающиеся в данных, в порядке TYPE_META
  const presentTypes = Object.keys(TYPE_META).filter((t) => units.some((u) => u.type === t));

  const toggleType = (t: string) =>
    setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  return (
    <div className="font-ui">
      {/* Фильтры */}
      <div className="bg-white border border-line rounded-2xl p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-4">
        <label className="flex flex-col gap-[6px] mb-3">
          <span className="font-bold text-[14px] text-ink-2">{s_.search}</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={s_.searchHint}
            className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent max-w-[420px]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {presentTypes.map((t) => {
            const active = types.includes(t);
            const m = typeMeta(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className="text-[14px] font-medium rounded-full px-[14px] py-[7px] border cursor-pointer"
                style={{
                  color: active ? "#fff" : "var(--c-steel)",
                  background: active ? m.color : "var(--c-bg)",
                  borderColor: active ? m.color : "var(--c-line-strong)",
                }}
              >
                {typeLabels?.[t] ?? m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="text-[16px] text-ink-2">
          {s_.count}: <b className="text-brand">{list.length}</b>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setTypes([]);
            }}
            className="font-bold text-[15px] text-accent bg-none border-none cursor-pointer"
          >
            {s_.reset} ✕
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl">
          <div className="font-display font-bold text-[20px] text-brand mb-[6px]">{s_.emptyTitle}</div>
          <div className="text-[16px] text-ink-2">{s_.emptyHint}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {list.map((u) => {
            const m = typeMeta(u.type);
            const indent = filtering ? 0 : Math.min(u.depth, 2) * 28;
            const hasHead = !!u.head.fio && u.head.fio !== "—";
            return (
              <div key={u.id} style={{ marginLeft: indent }}>
                <div
                  className="st-card flex items-stretch bg-white border border-line rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] max-[680px]:flex-col"
                  style={{ borderLeft: `4px solid ${m.color}` }}
                >
                  <div className="flex-1 min-w-0 px-5 py-4">
                    <span
                      className="text-[11px] font-bold tracking-[0.04em] uppercase rounded-[5px] px-[9px] py-[3px]"
                      style={{ color: m.color, background: m.soft }}
                    >
                      {typeLabels?.[u.type] ?? m.label}
                    </span>
                    <Link
                      href={`/struktura/${u.id}`}
                      className="block mt-[7px] font-bold text-[20px] leading-[1.15] text-brand no-underline hover:text-accent"
                    >
                      {u.name}
                    </Link>
                    <div className="flex flex-wrap gap-x-[18px] gap-y-2 mt-2 text-[15px] text-ink-2">
                      <Meta icon={IconPin}>{u.address}</Meta>
                      <Meta icon={IconPhone}>{formatPhone(u.phone)}</Meta>
                      <Meta icon={IconMail}>
                        {u.email && (
                          <a href={`mailto:${u.email}`} className="text-ink-2 no-underline hover:text-accent">
                            {u.email}
                          </a>
                        )}
                      </Meta>
                    </div>
                  </div>

                  <div className="flex-[0_0_296px] flex flex-col justify-center gap-3 px-5 py-4 border-l border-line max-[680px]:flex-auto max-[680px]:border-l-0 max-[680px]:border-t">
                    {hasHead &&
                      (() => {
                        const inner = (
                          <>
                            <span
                              className="shrink-0 w-9 h-9 rounded-full text-white font-display font-bold text-[13px] flex items-center justify-center"
                              style={{ background: avatarColor(u.head.fio) }}
                            >
                              {initials(u.head.fio)}
                            </span>
                            <span className="leading-[1.2] min-w-0">
                              <span className="block font-bold text-[15px] text-brand truncate">
                                {u.head.fio}
                              </span>
                              {u.head.post && (
                                <span className="block text-[12px] text-ink-3">{u.head.post}</span>
                              )}
                            </span>
                          </>
                        );
                        return u.headPersonId ? (
                          <Link
                            href={`/persony/${u.headPersonId}`}
                            className="flex items-center gap-[10px] min-h-[38px] no-underline hover:opacity-85"
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-[10px] min-h-[38px]">{inner}</div>
                        );
                      })()}
                    {u.doc && (
                      <a
                        href={u.doc.href.startsWith("http") ? u.doc.href : `https://www.orgma.ru${u.doc.href}`}
                        className="inline-flex items-center gap-2 text-[14px] font-bold text-steel no-underline hover:text-brand"
                      >
                        {/* Компактная ссылка внутри плитки — не карточка DocCards.
                            Формат берём из адреса: раньше стояло жёсткое «PDF». */}
                        <span className="shrink-0 flex items-center justify-center w-[26px] h-[26px] rounded-md bg-[rgba(255,59,48,0.10)] text-[rgb(214,54,44)] text-[9px] font-display font-bold">
                          {docFmt(u.doc.href)}
                        </span>
                        {u.doc.text}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
