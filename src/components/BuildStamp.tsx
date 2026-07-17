"use client";

import { useEffect, useState } from "react";

// Метка сборки в подвале. Время сборки известно только в UTC (собирает
// GitHub Actions), а смотрят её из разных поясов — поэтому пересчитываем на
// клиенте по поясу браузера и подписываем смещение: «16:52 (+5) 17-07-2026».
//
// Первый рендер обязан совпасть с тем, что лежит в статическом HTML, иначе
// React ругается на расхождение гидратации. Поэтому сначала показываем UTC
// (+0), а в поясе браузера пересчитываем уже после монтирования.
const SHA = process.env.NEXT_PUBLIC_BUILD_SHA || "";
const ISO = process.env.NEXT_PUBLIC_BUILD_ISO || "";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// offsetMin — смещение пояса от UTC в минутах (Оренбург: +300).
function format(iso: string, offsetMin: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const d = new Date(t + offsetMin * 60_000);
  const sign = offsetMin < 0 ? "−" : "+";
  const h = Math.floor(Math.abs(offsetMin) / 60);
  const m = Math.abs(offsetMin) % 60;
  // Индия и Непал живут на получасах — минуты показываем только если они есть.
  const tz = m ? `${sign}${h}:${pad(m)}` : `${sign}${h}`;
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} (${tz}) ${pad(
    d.getUTCDate(),
  )}-${pad(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`;
}

export function BuildStamp() {
  const [stamp, setStamp] = useState(() => format(ISO, 0));

  useEffect(() => {
    // getTimezoneOffset считает наоборот: для UTC+5 вернёт −300.
    setStamp(format(ISO, -new Date().getTimezoneOffset()));
  }, []);

  if (!ISO) return null;

  return (
    <span className="ml-3 text-[11px] text-white/35" title="Версия сборки">
      {SHA ? `${SHA} · ` : ""}
      {stamp}
    </span>
  );
}
