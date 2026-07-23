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

// Подписи интерфейса: русский текст — ключ перевода и запасной вариант,
// переведённый набор приходит пропсом ui (см. lib/i18n/ui-strings.ts).
export const STAFF_UI = {
  sortFio: "По алфавиту (А–Я)",
  sortDegree: "По учёной степени",
  search: "Поиск по ФИО или дисциплине",
  searchHint: "Фамилия, дисциплина…",
  position: "Должность",
  anyPosition: "Все должности",
  degree: "Учёная степень",
  anyDegree: "Любая степень",
  discipline: "Дисциплина",
  anyDiscipline: "Все дисциплины",
  sort: "Сортировка",
  filters: "Фильтры",
  collapse: "свернуть",
  expand: "показать",
  found: "Найдено",
  reset: "Сбросить",
  emptyTitle: "Ничего не найдено",
  emptyHint: "Измените параметры фильтра.",
  experience: "стаж",
};

// Ранг степени для сортировки: доктор → кандидат → без степени.
// Ключи категорий: на переведённых данных их считает сервер (posKey/degKey),
// иначе выводим из русских полей — на русской версии это то же самое.
const posKeyOf = (p: PersonCardItem) => p.posKey ?? positionCat(p.position);
const degKeyOf = (p: PersonCardItem) =>
  p.degKey ?? DEGREE_CATS.find((c) => p.degree.toLowerCase().includes(c.key))?.key ?? null;

function degreeRank(degree: string): number {
  const d = degree.toLowerCase();
  if (d.includes("доктор")) return 0;
  if (d.includes("кандидат")) return 1;
  return 2;
}

export function StaffDirectory({
  people,
  ui,
  catLabels,
}: {
  people: PersonCardItem[];
  ui?: Partial<typeof STAFF_UI>;
  /** Переведённые подписи категорий должностей и степеней: ключ → подпись. */
  catLabels?: Record<string, string>;
}) {
  const s_ = { ...STAFF_UI, ...ui };
  const catLabel = (key: string, ru: string) => catLabels?.[key] ?? ru;
  const SORTS: { value: Sort; label: string }[] = [
    { value: "fio", label: s_.sortFio },
    { value: "degree", label: s_.sortDegree },
  ];
  const [q, setQ] = useState("");
  const [pos, setPos] = useState<string[]>([]);
  const [deg, setDeg] = useState<string[]>([]);
  const [disc, setDisc] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("fio");

  // Список дисциплин для фильтра: собираем из состава, схлопываем регистр (в
  // источнике «Микробиология» и «микробиология» — одно и то же), каноничная
  // подпись — самая частая форма написания. 270+ дисциплин, поэтому селект с
  // поиском (searchable). Значение — ключ в нижнем регистре, по нему и матчим.
  const discOptions = useMemo(() => {
    // key (нижний регистр) → сколько раз встретилась каждая точная форма записи.
    const forms = new Map<string, Map<string, number>>();
    for (const p of people) {
      for (const raw of p.disciplines) {
        const label = raw.trim();
        if (!label) continue;
        const key = label.toLowerCase();
        const m = forms.get(key) ?? new Map<string, number>();
        m.set(label, (m.get(label) ?? 0) + 1);
        forms.set(key, m);
      }
    }
    return [...forms.entries()]
      .map(([value, m]) => {
        const label = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
        return { value, label };
      })
      .sort((a, b) => a.label.localeCompare(b.label, "ru"));
  }, [people]);
  // На мобиле панель свёрнута по умолчанию, чтобы список был виден сразу (как
  // «Разделы»); на десктопе класс min-[901px]:flex всегда показывает тело.
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = people.filter(
      (p) =>
        (pos.length === 0 || pos.includes(posKeyOf(p) ?? "")) &&
        (deg.length === 0 || deg.includes(degKeyOf(p) ?? "")) &&
        (disc.length === 0 || p.disciplines.some((d) => disc.includes(d.trim().toLowerCase()))) &&
        (!query ||
          p.fio.toLowerCase().includes(query) ||
          p.disciplines.some((d) => d.toLowerCase().includes(query))),
    );
    // Сортируем всегда (в источнике порядок — блоками по выгрузке кафедр, читался
    // как «алфавит сбоит»). При равной степени — по алфавиту, вторичным ключом.
    // Ранг степени: доктор → кандидат → без степени. На переведённых данных
    // берём его из degKey — слова «доктор» в английском тексте уже нет.
    const rankOf = (p: PersonCardItem) =>
      p.degKey === undefined ? degreeRank(p.degree) : p.degKey === "доктор" ? 0 : p.degKey === "кандидат" ? 1 : 2;
    return [...filtered].sort((a, b) => {
      if (sort === "degree") {
        const r = rankOf(a) - rankOf(b);
        if (r !== 0) return r;
      }
      return a.fio.localeCompare(b.fio, "ru");
    });
  }, [people, q, pos, deg, disc, sort]);

  const isFiltered = !!q.trim() || pos.length > 0 || deg.length > 0 || disc.length > 0;
  // Показываем только те категории, что реально есть в составе, — иначе фильтр
  // предлагал бы заведомо пустые варианты.
  const presentPos = POSITION_CATS.filter((c) => people.some((p) => posKeyOf(p) === c.key));
  const presentDeg = DEGREE_CATS.filter((c) => people.some((p) => degKeyOf(p) === c.key));

  const filters = (
    <div className={`${open ? "flex" : "hidden"} min-[901px]:flex flex-col gap-4 p-4`}>
      <label className="flex flex-col gap-[6px]">
        <span className="font-bold text-[14px] text-ink-2">{s_.search}</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={s_.searchHint}
          className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-[6px]">
        <span className="font-bold text-[14px] text-ink-2">{s_.position}</span>
        <FilterSelect
          multi
          value={pos}
          onChange={setPos}
          searchable={false}
          placeholder={s_.anyPosition}
          options={presentPos.map((c) => ({ value: c.key, label: catLabel(c.key, c.label) }))}
        />
      </label>
      <label className="flex flex-col gap-[6px]">
        <span className="font-bold text-[14px] text-ink-2">{s_.degree}</span>
        <FilterSelect
          multi
          value={deg}
          onChange={setDeg}
          searchable={false}
          placeholder={s_.anyDegree}
          options={presentDeg.map((c) => ({ value: c.key, label: catLabel(c.key, c.label) }))}
        />
      </label>
      <label className="flex flex-col gap-[6px]">
        <span className="font-bold text-[14px] text-ink-2">{s_.discipline}</span>
        <FilterSelect
          multi
          value={disc}
          onChange={setDisc}
          placeholder={s_.anyDiscipline}
          options={discOptions}
        />
      </label>
      <label className="flex flex-col gap-[6px]">
        <span className="font-bold text-[14px] text-ink-2">{s_.sort}</span>
        <FilterSelect
          value={sort}
          onChange={(v) => setSort(v as Sort)}
          searchable={false}
          placeholder={s_.sortFio}
          options={SORTS}
        />
      </label>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-line">
        <span className="text-[15px] text-ink-2">
          {s_.found}: <b className="text-brand">{list.length}</b>
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setPos([]);
              setDeg([]);
              setDisc([]);
            }}
            className="font-bold text-[15px] text-accent bg-none border-none cursor-pointer"
          >
            {s_.reset} ✕
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
              {s_.filters}
              {isFiltered && (
                <span className="ml-2 normal-case tracking-normal text-accent">· {list.length}</span>
              )}
            </span>
            <span className="min-[901px]:hidden text-ink-3 text-[13px] normal-case tracking-normal">
              {open ? `${s_.collapse} ▲` : `${s_.expand} ▾`}
            </span>
          </button>
          {filters}
        </div>
      </aside>

      <main className="min-w-0">
        {list.length === 0 ? (
          <div className="py-12 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl">
            <div className="font-display font-bold text-[20px] text-brand mb-[6px]">{s_.emptyTitle}</div>
            <div className="text-[16px] text-ink-2">{s_.emptyHint}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {list.map((p) => (
              <PersonTile key={p.id} person={p} experienceLabel={s_.experience} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
