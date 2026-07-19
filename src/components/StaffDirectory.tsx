"use client";

import { useMemo, useState } from "react";
import type { PersonCardItem } from "@/lib/content/persons-types";
import { POSITION_CATS, DEGREE_CATS, positionCat } from "@/lib/content/persons-types";
import { PersonTile } from "@/components/PersonTile";
import { FilterSelect } from "@/components/FilterSelect";

// Каталог педсостава. Фильтры вынесены в левую боковую панель — тем же
// паттерном, что «Разделы» страницы и «Подразделы» в sveden: белая карточка с
// шапкой-капсом, липкая на десктопе, сворачивается наверх на мобиле. Раньше это
// была горизонтальная плашка над списком — своя, ни на что не похожая форма.
export function StaffDirectory({ people }: { people: PersonCardItem[] }) {
  const [q, setQ] = useState("");
  const [pos, setPos] = useState("");
  const [deg, setDeg] = useState("");
  // На мобиле панель свёрнута по умолчанию, чтобы список был виден сразу (как
  // «Разделы»); на десктопе класс min-[901px]:block всегда показывает тело.
  const [open, setOpen] = useState(false);

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
  // Показываем только те категории, что реально есть в составе, — иначе фильтр
  // предлагал бы заведомо пустые варианты.
  const presentPos = POSITION_CATS.filter((c) => people.some((p) => positionCat(p.position) === c.key));
  const presentDeg = DEGREE_CATS.filter((c) => people.some((p) => p.degree.toLowerCase().includes(c.key)));

  const filters = (
    <div className={`${open ? "flex" : "hidden"} min-[901px]:flex flex-col gap-4 p-4`}>
      <label className="flex flex-col gap-[6px]">
        <span className="font-bold text-[14px] text-ink-2">Поиск по ФИО или дисциплине</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Фамилия, дисциплина…"
          className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-[6px]">
        <span className="font-bold text-[14px] text-ink-2">Должность</span>
        <FilterSelect
          value={pos}
          onChange={setPos}
          searchable={false}
          placeholder="Все должности"
          options={presentPos.map((c) => ({ value: c.key, label: c.label }))}
        />
      </label>
      <label className="flex flex-col gap-[6px]">
        <span className="font-bold text-[14px] text-ink-2">Учёная степень</span>
        <FilterSelect
          value={deg}
          onChange={setDeg}
          searchable={false}
          placeholder="Любая степень"
          options={presentDeg.map((c) => ({ value: c.key, label: c.label }))}
        />
      </label>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-line">
        <span className="text-[15px] text-ink-2 pt-3">
          Найдено: <b className="text-brand">{list.length}</b>
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setPos("");
              setDeg("");
            }}
            className="pt-3 font-bold text-[15px] text-accent bg-none border-none cursor-pointer"
          >
            Сбросить ✕
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[250px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 max-[768px]:pt-6 font-ui">
      <aside>
        {/* Липкая панель фильтров — как «Разделы»/«Подразделы». Заголовок
            капсом, тот же каркас карточки. На мобиле грид схлопывается в одну
            колонку, и панель встаёт над списком. */}
        <div className="min-[901px]:sticky min-[901px]:top-6 bg-white border border-line rounded-xl overflow-hidden">
          {/* Шапка: на десктопе — обычный заголовок, на мобиле кнопка-раскрывашка
              со счётчиком и «галкой» состояния. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="w-full min-[901px]:cursor-default flex items-center justify-between gap-2 px-5 py-4 bg-bg-muted border-b border-line font-bold text-[16px] uppercase tracking-[0.04em] text-ink-2"
          >
            <span>
              Фильтры
              {isFiltered && (
                <span className="ml-2 normal-case tracking-normal text-accent">· {list.length}</span>
              )}
            </span>
            <span className="min-[901px]:hidden text-ink-3 text-[13px] normal-case tracking-normal">
              {open ? "свернуть ▲" : "показать ▾"}
            </span>
          </button>
          {filters}
        </div>
      </aside>

      <main className="min-w-0">
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
      </main>
    </div>
  );
}
