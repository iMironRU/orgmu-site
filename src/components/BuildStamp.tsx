"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

// Метка сборки в подвале: «a1b2c3d · 16:52 (+5) 17-07-2026».
//
// Данные берутся из /build.json уже в браузере, а НЕ из переменных сборки.
// Раньше время подставлялось при сборке и попадало в разметку каждой из 1761
// страницы — то есть при любой пересборке менялись все файлы сайта целиком.
// Для GitHub Pages это неважно, а выкладка на сервер вуза идёт по FTP, и
// разница между «залить изменившиеся страницы» и «залить сайт заново» — это
// минута против часа.
//
// Время известно только в UTC (собирает GitHub Actions), а смотрят метку из
// разных поясов — поэтому пересчитываем на пояс браузера и подписываем
// смещение.

type Build = { sha?: string; iso?: string };

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
  const [build, setBuild] = useState<Build | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(asset("/build.json"), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => alive && setBuild(b))
      .catch(() => {}); // метка версии — не то, из-за чего стоит шуметь в консоли
    return () => {
      alive = false;
    };
  }, []);

  if (!build?.iso) return null;
  // getTimezoneOffset считает наоборот: для UTC+5 вернёт −300.
  const stamp = format(build.iso, -new Date().getTimezoneOffset());

  return (
    <span className="ml-3 text-[11px] text-white/35" title="Версия сборки">
      {build.sha ? `${build.sha} · ` : ""}
      {stamp}
    </span>
  );
}
