"use client";

import { useMemo, useState } from "react";
import type { PersonCardItem } from "@/lib/content/persons-types";
import { POSITION_CATS, DEGREE_CATS, positionCat } from "@/lib/content/persons-types";
import { PersonTile } from "@/components/PersonTile";
import { FilterSelect } from "@/components/FilterSelect";

// Каталог педсостава. Фильтры вынесены в левую боковую панель — тем же
// паттерном, что «Разделы» страницы и «Подразделы» в sveden: белая карточка с
// шапкой-капсом, липкая на десктопе, сворачивается наверх на мобиле.
//
// Должность и степень — мультивыбор (FilterSelect multi): у преподавателя одна
// должность, но фильтровать удобно по нескольким сразу (профессора + доценты).
// Порядок задаёт пользователь: по алфавиту или по учёной степени.

type Sort = "fio" | "degree";
const SORTS: { value: Sort; label: string }[] = [
  { value: "fio", label: "По алфавиту (А–Я)" },
  { value: "degree", label: "По учёной степени" },
];

// Ранг степени для сортировки: доктор → кандидат → без степени.
function degreeRank(degree: string): number {
  const d = degree.toLowerCase();
  if (d.includes("доктор")) return 0;
  if (d.includes("кандидат")) return 1;
  return 2;
}

export function StaffDirectory({ people }: { people: PersonCardItem[] }) {
  const [q, setQ] = useState("");
  const [pos, setPos] = useState<string[]>([]);
  const [deg, setDeg] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("fio");
  // На мобиле панель свёрнута по умолчанию, чтобы список был виден сразу (как
  // «Разделы»); на десктопе класс min-[901px]:flex всегда показывает тело.
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = people.filter(
      (p) =>
        (pos.length === 0 || pos.includes(positionCat(p.position) ?? "")) &&
        (deg.length === 0 || deg.some((k) => p.degree.toLowerCase().includes(k))) &&
        (!query ||
          p.fio.toLowerCase().includes(query) ||
          p.disciplines.some((d) => d.toLowerCase().includes(query))),
    );
    // Сортируем всегда (в источнике порядок — блоками по выгрузке кафедр, читался
    // как «алфавит сбоит»). При равной степени — по алфавиту, вторичным ключом.
    return [...filtered].sort((a, b) => {
      if (sort === "degree") {
        const r = degreeRank(a.degree) - degreeRank(b.degree);
        if (r !== 0) return r;
      }
      return a.fio.localeCompare(b.fio, "ru");
    });
  }, [people, q, pos, deg, sort]);

  const isFiltered = !!q.trim() || pos.length > 0 || deg.length > 0;
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
          multi
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
          multi
          value={deg}
          onChange={setDeg}
          searchable={false}
          placeholder="Любая степень"
          options={presentDeg.map((c) => ({ value: c.key, label: c.label }))}
        />
      </label>
      <label className="flex flex-col gap-[6px]">
        <span className="font-bold text-[14px] text-ink-2">Сортировка</span>
        <FilterSelect
          value={sort}
          onChange={(v) => setSort(v as Sort)}
          searchable={false}
          placeholder="По алфавиту (А–Я)"
          options={SORTS}
        />
      </label>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-line">
        <span className="text-[15px] text-ink-2">
          Найдено: <b className="text-brand">{list.length}</b>
        </span>
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
    </div>
  );

  return (
    <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[250px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 max-[768px]:pt-6 font-ui">
      <aside>
        {/* Липкая панель фильтров — как «Разделы»/«Подразделы». БЕЗ overflow-hidden:
            иначе выпадающие списки FilterSelect обрезаются краем карточки.
            Скруглённые углы держит сама карточка + rounded-t у шапки. */}
        <div className="min-[901px]:sticky min-[901px]:top-6 bg-white border border-line rounded-xl">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="w-full min-[901px]:cursor-default flex items-center justify-between gap-2 px-5 py-4 bg-bg-muted border-b border-line rounded-t-xl font-bold text-[16px] uppercase tracking-[0.04em] text-ink-2"
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
