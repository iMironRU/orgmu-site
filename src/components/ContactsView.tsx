"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FilterSelect } from "@/components/FilterSelect";

export type ContactUnit = {
  id: string;
  name: string;
  type?: string;
  head?: { fio: string; post: string };
  address?: string;
  phone?: string;
  email?: string;
  site?: string;
};

const DASH = "—";

// Телефонный справочник: 125 подразделений с контактами. Раньше телефон
// кафедры можно было найти, только зная, что она есть, и открыв её карточку.
export function PhoneBook({ units }: { units: ContactUnit[] }) {
  const [q, setQ] = useState("");
  const [types, setTypes] = useState<string[]>([]);

  const allTypes = useMemo(
    () => [...new Set(units.map((u) => u.type).filter(Boolean) as string[])].sort(),
    [units],
  );

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return units.filter(
      (u) =>
        (types.length === 0 || (u.type ? types.includes(u.type) : false)) &&
        (!s ||
          u.name.toLowerCase().includes(s) ||
          (u.phone ?? "").toLowerCase().includes(s) ||
          (u.email ?? "").toLowerCase().includes(s) ||
          (u.head?.fio ?? "").toLowerCase().includes(s)),
    );
  }, [units, q, types]);

  return (
    <div>
      <div className="bg-white border border-line rounded-2xl p-[18px] mb-4 flex flex-wrap gap-3 items-end">
        <label className="flex-[1_1_260px] min-w-[200px] flex flex-col gap-[6px]">
          <span className="font-bold text-[14px] text-ink-2">Поиск</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Подразделение, телефон, почта, ФИО…"
            className="text-[16px] text-ink px-[14px] py-[11px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
          />
        </label>
        {allTypes.length > 1 && (
          <label className="flex-[1_1_200px] min-w-[170px] flex flex-col gap-[6px]">
            <span className="font-bold text-[14px] text-ink-2">Тип подразделения</span>
            <FilterSelect multi value={types} onChange={setTypes} placeholder="Любой" options={allTypes} />
          </label>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="text-[16px] text-ink-2">
          Найдено: <b className="text-brand">{list.length}</b>
        </div>
        {(q.trim() || types.length > 0) && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setTypes([]);
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
        <div className="flex flex-col gap-2">
          {list.map((u) => (
            <div key={u.id} className="bg-white border border-line rounded-[10px] px-[18px] py-[14px] flex gap-4 flex-wrap items-baseline">
              <Link
                href={`/struktura/${u.id}`}
                className="flex-1 min-w-[220px] font-bold text-[17px] text-brand no-underline hover:underline"
              >
                {u.name}
              </Link>
              <span className="shrink-0 text-[15px] text-steel tabular-nums min-w-[170px]">
                {u.phone ? (
                  <a href={`tel:${u.phone.replace(/[^+\d]/g, "")}`} className="text-steel no-underline hover:text-accent">
                    {u.phone}
                  </a>
                ) : (
                  DASH
                )}
              </span>
              <span className="shrink-0 text-[15px] min-w-[180px]">
                {u.email ? (
                  <a href={`mailto:${u.email}`} className="text-accent no-underline hover:underline break-words">
                    {u.email}
                  </a>
                ) : (
                  <span className="text-ink-3">{DASH}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Карта грузится ТОЛЬКО по клику: виджет Яндекса тянет чужие скрипты и ставит
// куки. Загружать его сразу — значит поставить трекер до того, как человек
// ответил на наш баннер согласия. Для сайта с политикой ПДн это подлог.
export function MapEmbed({ src, address }: { src: string; address: string }) {
  const [show, setShow] = useState(false);

  if (show) {
    return (
      <iframe
        src={src}
        title="Карта: как нас найти"
        loading="lazy"
        className="w-full h-[420px] max-[768px]:h-[300px] border border-line rounded-xl"
        allowFullScreen
      />
    );
  }

  return (
    <div className="bg-white border border-dashed border-line-strong rounded-xl p-7 flex flex-col items-center gap-3 text-center">
      <span className="text-brand">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </span>
      <div className="font-bold text-[18px] text-brand">{address}</div>
      <div className="text-[15px] text-steel max-w-[520px]">
        Карту показывает Яндекс. Она загрузит свои скрипты и файлы cookie, поэтому
        мы не включаем её без вашего согласия.
      </div>
      <button
        type="button"
        onClick={() => setShow(true)}
        className="mt-1 font-ui font-bold text-[16px] text-white bg-accent rounded-[10px] px-6 py-3 border-none cursor-pointer hover:bg-[rgb(150,46,3)] transition-colors"
      >
        Показать карту
      </button>
      <a
        href={`https://yandex.ru/maps/?text=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[15px] text-accent font-bold no-underline hover:underline"
      >
        Открыть в Яндекс.Картах →
      </a>
    </div>
  );
}
