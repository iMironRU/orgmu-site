"use client";

import { useMemo, useState } from "react";
import { Link } from "@/components/Link";
import { FilterSelect } from "@/components/FilterSelect";
import type { Phone } from "@/lib/phone";

export type ContactUnit = {
  id: string;
  name: string;
  type: string;
  /** Русская подпись типа и его цвета — из TYPE_META, считаны на сервере. */
  typeLabel: string;
  color: string;
  soft: string;
  phones: Phone[];
  email?: string;
};

// Телефонный справочник: 125 подразделений с контактами. Раньше телефон
// кафедры можно было найти, только зная, что она есть, и открыв её карточку.
//
// Карточки — из макета Contacts.dc.html (блок «Быстрые контакты»): цветной
// бейдж типа, название, телефон и почта с иконками, «Подробнее». До этого
// здесь были строки с фиксированными min-width, и всё, что длиннее (три
// номера у деканата лечебного факультета), вылезало за колонку.
export function PhoneBook({ units }: { units: ContactUnit[] }) {
  const [q, setQ] = useState("");
  const [types, setTypes] = useState<string[]>([]);

  // В фильтр идут русские подписи, а не машинные коды: раньше в списке стояли
  // faculty, kafedra, podrazdelenie, upravlenie — как есть из units.json.
  const allTypes = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of units) if (u.type) m.set(u.type, u.typeLabel);
    return [...m.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "ru"));
  }, [units]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return units.filter(
      (u) =>
        (types.length === 0 || types.includes(u.type)) &&
        (!s ||
          u.name.toLowerCase().includes(s) ||
          u.phones.some((p) => p.display.toLowerCase().includes(s)) ||
          (u.email ?? "").toLowerCase().includes(s)),
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
            placeholder="Подразделение, телефон, почта…"
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
        <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[680px]:grid-cols-1">
          {list.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-line border-l-4 rounded-xl px-5 py-[18px] flex flex-col gap-[10px]"
              style={{ borderLeftColor: u.color }}
            >
              <span
                className="self-start text-[11px] font-bold tracking-[0.04em] uppercase rounded-[5px] px-[9px] py-[3px]"
                style={{ color: u.color, background: u.soft }}
              >
                {u.typeLabel}
              </span>
              <Link
                href={`/struktura/${u.id}`}
                className="font-display font-bold text-[17px] leading-[1.25] text-brand no-underline hover:underline"
              >
                {u.name}
              </Link>

              {/* Номеров может быть несколько и у части есть подпись
                  («1-2 курс») — каждый отдельной строкой, карточка растёт
                  вниз, а не разъезжается вширь. */}
              {u.phones.map((p) => (
                <a
                  key={p.tel + (p.label ?? "")}
                  href={`tel:${p.tel}`}
                  className="flex items-start gap-2 text-[15px] font-bold text-steel no-underline hover:text-brand"
                >
                  <svg className="shrink-0 mt-[3px]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z" />
                  </svg>
                  <span className="tabular-nums">
                    {p.label && <span className="font-normal text-ink-3">{p.label}: </span>}
                    {p.display}
                  </span>
                </a>
              ))}

              {u.email && (
                <a
                  href={`mailto:${u.email}`}
                  className="flex items-start gap-2 text-[15px] text-steel no-underline hover:text-brand break-all"
                >
                  <svg className="shrink-0 mt-[3px]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m3 6 9 7 9-7" />
                  </svg>
                  {u.email}
                </a>
              )}

              <Link
                href={`/struktura/${u.id}`}
                className="mt-auto pt-[2px] inline-flex items-center gap-[6px] font-bold text-[14px] text-accent no-underline hover:text-brand"
              >
                Подробнее
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
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
