"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/FilterSelect";

export type PriceRow = {
  lab: string;
  section: string;
  code: string;
  name: string;
  unit: string;
  price: string;
  num: number | null;
};

// Прайс лаборатории одной таблицей. На прежнем сайте это были три отдельные
// таблицы по лабораториям, спрятанные в аккордеоны: чтобы найти анализ, надо
// было знать, в какой лаборатории его делают, и просмотреть 300+ строк глазами.
// Здесь всё вместе — с поиском, фильтрами и сортировкой по цене.
type Sort = "name" | "price-asc" | "price-desc";
const SORTS: { value: Sort; label: string }[] = [
  { value: "name", label: "По названию (А–Я)" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
];

const DASH = "—";

// Поиск по основе слова. В прайсе названия стоят в косвенных падежах
// («определение глюкозы», «исследование мочи»), и подстрочный поиск по
// «глюкоза» или «моча» не находил ничего. Отрезаем у запроса хвостовую
// гласную/мягкий знак — «глюкоза» → «глюкоз» находит «глюкозы» и «глюкозе».
// Порог 4 буквы: короче отрезать опасно («кал», «ДНК»), а «моча» → «моч» нужен.
function stem(w: string): string {
  return w.length >= 4 ? w.replace(/[аяыиеёуюоь]$/i, "") : w;
}

function matches(haystack: string, query: string): boolean {
  const words = query.split(/\s+/).filter(Boolean).map(stem);
  return words.every((w) => haystack.includes(w));
}

export function PriceList({ items }: { items: PriceRow[] }) {
  const [q, setQ] = useState("");
  const [labs, setLabs] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("name");

  const labOptions = useMemo(
    () => [...new Set(items.map((r) => r.lab).filter(Boolean))].map((v) => ({ value: v, label: v })),
    [items],
  );
  // Разделы показываем только те, что есть в выбранных лабораториях — иначе
  // фильтр предлагал бы заведомо пустые сочетания.
  const sectionOptions = useMemo(() => {
    const pool = labs.length ? items.filter((r) => labs.includes(r.lab)) : items;
    return [...new Set(pool.map((r) => r.section).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "ru"))
      .map((v) => ({ value: v, label: v }));
  }, [items, labs]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const rows = items.filter(
      (r) =>
        (labs.length === 0 || labs.includes(r.lab)) &&
        (sections.length === 0 || sections.includes(r.section)) &&
        (!s || matches(r.name.toLowerCase(), s) || r.code.toLowerCase().includes(s)),
    );
    return [...rows].sort((a, b) => {
      if (sort !== "name") {
        // Позиции без разобранной цены — всегда в конце, чтобы не мешались.
        if (a.num === null || b.num === null) return a.num === null ? 1 : -1;
        return sort === "price-asc" ? a.num - b.num : b.num - a.num;
      }
      return a.name.localeCompare(b.name, "ru");
    });
  }, [items, q, labs, sections, sort]);

  const isFiltered = !!q.trim() || labs.length > 0 || sections.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-line rounded-2xl p-[18px] flex flex-wrap gap-3 items-end">
        <label className="flex-[1_1_240px] min-w-[200px] flex flex-col gap-[6px]">
          <span className="font-bold text-[14px] text-ink-2">Поиск по названию или коду</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Например: моча, глюкоза, А26…"
            className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
          />
        </label>
        <label className="flex-[1_1_210px] min-w-[180px] flex flex-col gap-[6px]">
          <span className="font-bold text-[14px] text-ink-2">Лаборатория</span>
          <FilterSelect
            multi
            value={labs}
            onChange={(v) => {
              setLabs(v);
              setSections([]); // разделы зависят от лаборатории
            }}
            searchable={false}
            placeholder="Все лаборатории"
            options={labOptions}
          />
        </label>
        <label className="flex-[1_1_210px] min-w-[180px] flex flex-col gap-[6px]">
          <span className="font-bold text-[14px] text-ink-2">Раздел</span>
          <FilterSelect
            multi
            value={sections}
            onChange={setSections}
            placeholder="Все разделы"
            options={sectionOptions}
          />
        </label>
        <label className="flex-[1_1_190px] min-w-[170px] flex flex-col gap-[6px]">
          <span className="font-bold text-[14px] text-ink-2">Сортировка</span>
          <FilterSelect
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            searchable={false}
            placeholder="По названию (А–Я)"
            options={SORTS}
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-[16px] text-ink-2">
          Позиций: <b className="text-brand">{list.length}</b>
          {list.length !== items.length && <span className="text-ink-3"> из {items.length}</span>}
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setLabs([]);
              setSections([]);
            }}
            className="font-bold text-[15px] text-accent bg-none border-none cursor-pointer"
          >
            Сбросить ✕
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="py-10 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl text-ink-2">
          Ничего не найдено — измените запрос.
        </div>
      ) : (
        // Широкая таблица прокручивается внутри себя: на телефоне страница не
        // должна ездить вбок целиком.
        <div className="overflow-x-auto border border-line rounded-xl bg-white">
          <table className="w-full border-collapse text-[15px] min-w-[640px]">
            <thead>
              <tr className="bg-bg-muted">
                <th className="text-left font-bold text-ink-2 px-4 py-3 border-b border-line whitespace-nowrap">
                  Код
                </th>
                <th className="text-left font-bold text-ink-2 px-4 py-3 border-b border-line">Услуга</th>
                <th className="text-left font-bold text-ink-2 px-4 py-3 border-b border-line whitespace-nowrap">
                  Единица
                </th>
                <th className="text-right font-bold text-ink-2 px-4 py-3 border-b border-line whitespace-nowrap">
                  Цена, ₽
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={i} className="align-top even:bg-[rgba(0,101,155,0.02)]">
                  <td className="px-4 py-3 border-b border-line text-ink-3 tabular-nums whitespace-nowrap">
                    {r.code || DASH}
                  </td>
                  <td className="px-4 py-3 border-b border-line text-ink">
                    {r.name}
                    {(r.section || r.lab) && (
                      <span className="block text-[13px] text-ink-3 mt-[2px]">
                        {[r.section, r.lab].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-line text-steel whitespace-nowrap">
                    {r.unit || DASH}
                  </td>
                  <td className="px-4 py-3 border-b border-line text-right font-bold text-brand tabular-nums whitespace-nowrap">
                    {r.num !== null ? r.num.toLocaleString("ru-RU") : r.price || DASH}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
