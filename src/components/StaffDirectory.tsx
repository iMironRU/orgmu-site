"use client";

import { useMemo, useState } from "react";
import type { Person } from "@/lib/content/persons-types";
import { POSITION_CATS, DEGREE_CATS, positionCat } from "@/lib/content/persons-types";
import { PersonTile } from "@/components/PersonTile";

export function StaffDirectory({ people }: { people: Person[] }) {
  const [q, setQ] = useState("");
  const [pos, setPos] = useState<string[]>([]);
  const [deg, setDeg] = useState<string[]>([]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return people.filter(
      (p) =>
        (pos.length === 0 || pos.includes(positionCat(p.position) ?? "")) &&
        (deg.length === 0 || deg.some((k) => p.degree.toLowerCase().includes(k))) &&
        (!query ||
          p.fio.toLowerCase().includes(query) ||
          p.disciplines.some((d) => d.toLowerCase().includes(query))),
    );
  }, [people, q, pos, deg]);

  const isFiltered = !!q.trim() || pos.length > 0 || deg.length > 0;
  const toggle = (arr: string[], set: (v: string[]) => void, k: string) =>
    set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]);

  const presentPos = POSITION_CATS.filter((c) => people.some((p) => positionCat(p.position) === c.key));
  const presentDeg = DEGREE_CATS.filter((c) => people.some((p) => p.degree.toLowerCase().includes(c.key)));

  const Chip = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="text-[14px] font-medium rounded-full px-[14px] py-[7px] border cursor-pointer"
      style={{
        color: active ? "#fff" : "var(--c-steel)",
        background: active ? "var(--c-accent)" : "var(--c-bg)",
        borderColor: active ? "var(--c-accent)" : "var(--c-line-strong)",
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="font-ui">
      <div className="bg-white border border-line rounded-2xl p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-4">
        <label className="flex flex-col gap-[6px] mb-3">
          <span className="font-bold text-[14px] text-ink-2">Поиск по ФИО или дисциплине</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Фамилия, дисциплина…"
            className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent max-w-[420px]"
          />
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="text-[13px] font-bold text-ink-3 self-center mr-1">Должность:</span>
            {presentPos.map((c) => (
              <Chip key={c.key} active={pos.includes(c.key)} onClick={() => toggle(pos, setPos, c.key)}>
                {c.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[13px] font-bold text-ink-3 self-center mr-1">Учёная степень:</span>
            {presentDeg.map((c) => (
              <Chip key={c.key} active={deg.includes(c.key)} onClick={() => toggle(deg, setDeg, c.key)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="text-[16px] text-ink-2">
          Сотрудников: <b className="text-brand">{list.length}</b>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setPos([]);
              setDeg([]);
            }}
            className="font-bold text-[15px] text-accent bg-none border-none cursor-pointer"
          >
            Сбросить ✕
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl">
          <div className="font-display font-bold text-[20px] text-brand mb-[6px]">Ничего не найдено</div>
          <div className="text-[16px] text-ink-2">Измените параметры фильтра.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {list.map((p) => (
            <PersonTile key={p.id} person={p} />
          ))}
        </div>
      )}
    </div>
  );
}
