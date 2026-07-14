"use client";

import { useMemo, useState } from "react";
import type { Person } from "@/lib/content/persons-types";
import { POSITION_CATS, DEGREE_CATS, positionCat } from "@/lib/content/persons-types";
import { PersonTile } from "@/components/PersonTile";

const SELECT =
  "font-ui text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent bg-white cursor-pointer w-full";

export function StaffDirectory({ people }: { people: Person[] }) {
  const [q, setQ] = useState("");
  const [pos, setPos] = useState("");
  const [deg, setDeg] = useState("");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return people.filter(
      (p) =>
        (!pos || positionCat(p.position) === pos) &&
        (!deg || p.degree.toLowerCase().includes(deg)) &&
        (!query ||
          p.fio.toLowerCase().includes(query) ||
          p.disciplines.some((d) => d.toLowerCase().includes(query))),
    );
  }, [people, q, pos, deg]);

  const isFiltered = !!q.trim() || !!pos || !!deg;
  const presentPos = POSITION_CATS.filter((c) => people.some((p) => positionCat(p.position) === c.key));
  const presentDeg = DEGREE_CATS.filter((c) => people.some((p) => p.degree.toLowerCase().includes(c.key)));

  return (
    <div className="font-ui">
      <div className="bg-white border border-line rounded-2xl p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-4">
        <div className="flex flex-wrap gap-3 items-end max-[640px]:flex-col max-[640px]:items-stretch">
          <label className="flex-[1_1_240px] min-w-[200px] flex flex-col gap-[6px]">
            <span className="font-bold text-[14px] text-ink-2">Поиск по ФИО или дисциплине</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Фамилия, дисциплина…"
              className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
            />
          </label>
          <label className="flex-[1_1_200px] min-w-[170px] flex flex-col gap-[6px]">
            <span className="font-bold text-[14px] text-ink-2">Должность</span>
            <select value={pos} onChange={(e) => setPos(e.target.value)} className={SELECT}>
              <option value="">Все должности</option>
              {presentPos.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="flex-[1_1_200px] min-w-[170px] flex flex-col gap-[6px]">
            <span className="font-bold text-[14px] text-ink-2">Учёная степень</span>
            <select value={deg} onChange={(e) => setDeg(e.target.value)} className={SELECT}>
              <option value="">Любая степень</option>
              {presentDeg.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="text-[16px] text-ink-2">
          Сотрудников: <b className="text-brand">{list.length}</b>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={() => { setQ(""); setPos(""); setDeg(""); }}
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
