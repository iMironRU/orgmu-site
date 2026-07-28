"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterSelect } from "@/components/FilterSelect";
import type { Spiski, Competition, Application } from "@/lib/spiski/types";
import { SPISKI_URL, parseSpiski } from "@/lib/spiski/parse";

// Рейтинговые списки по макету RatingLists.dc.html. Данные грузятся fetch-ем
// отдельным файлом (не через сборку): страница статическая, а списки в 1С
// меняются ежедневно и кладутся прямо на сервер. Поэтому весь экран —
// клиентский: пока файла нет (запасная площадка Pages), показываем заглушку.

const BRAND = "rgb(0,101,155)";
const GREEN = "rgb(30,160,80)";

function fmtUpdated(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  // Пояс браузера: смотрят из Оренбурга и не только.
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(t));
}

type Load = { state: "loading" | "empty" | "ready"; data?: Spiski };

export function RatingListsView() {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [program, setProgram] = useState<string>("");
  const [compId, setCompId] = useState<number | null>(null);
  const [find, setFind] = useState("");

  useEffect(() => {
    let alive = true;
    // Данные — с отдельного хоста вуза (см. SPISKI_URL). 1С отдаёт плоский
    // массив строк, разбираем его на клиенте (parseSpiski). Дату обновления
    // берём из Last-Modified файла — отдельного поля даты в выгрузке нет.
    // no-store: список меняется чаще, чем кешируется; свежесть важнее.
    fetch(SPISKI_URL, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) return null;
        const updated = r.headers.get("Last-Modified") ?? "";
        const raw = await r.json();
        return Array.isArray(raw) ? parseSpiski(raw, updated) : (raw as Spiski);
      })
      .then((d) => {
        if (!alive) return;
        if (!d || !d.competitions?.length) return setLoad({ state: "empty" });
        setLoad({ state: "ready", data: d });
        setProgram(d.competitions[0].program);
      })
      // Сюда попадаем и при блокировке CORS — тогда на хосте данных нет нужного
      // заголовка Access-Control-Allow-Origin.
      .catch(() => alive && setLoad({ state: "empty" }));
    return () => {
      alive = false;
    };
  }, []);

  const data = load.data;

  // Программы (для верхнего фильтра) и конкурсы выбранной программы (вкладки).
  const programs = useMemo(
    () => (data ? [...new Set(data.competitions.map((c) => c.program))] : []),
    [data],
  );
  const comps = useMemo(
    () => (data ? data.competitions.filter((c) => c.program === program) : []),
    [data, program],
  );
  // Активный конкурс: выбранный, иначе первый в программе.
  const comp: Competition | undefined = comps.find((c) => c.id === compId) ?? comps[0];

  // Режим «найти себя»: все заявления по введённому коду, из всех конкурсов.
  const query = find.trim();
  const apps: Application[] = useMemo(() => {
    if (!data || query.length < 3) return [];
    const out: Application[] = [];
    for (const c of data.competitions) {
      for (const r of c.rows) if (r.code === query) out.push({ ...r, comp: c });
    }
    return out.sort((a, b) => a.pr - b.pr);
  }, [data, query]);
  const personal = query.length >= 3 && apps.length > 0;
  const notFound = query.length >= 3 && apps.length === 0;

  // Куда зачисление: высший приоритет (min pr), где проходит и подал согласие.
  const winnerPr = useMemo(() => {
    const ok = apps.filter((a) => a.cons && a.n <= a.comp.seats);
    return ok.length ? Math.min(...ok.map((a) => a.pr)) : null;
  }, [apps]);

  if (load.state === "loading") {
    return <div className="py-16 text-center text-ink-3 font-ui">Загрузка списков…</div>;
  }
  if (load.state === "empty") {
    return (
      <div className="py-14 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl font-ui">
        <div className="font-display font-bold text-[20px] text-brand mb-2">Списки пока не опубликованы</div>
        <div className="text-[16px] text-ink-2 max-w-[520px] mx-auto">
          Конкурсные списки появляются здесь в период приёма и обновляются ежедневно.
        </div>
      </div>
    );
  }

  return (
    <div className="font-ui">
      {/* Фильтр программы */}
      <div className="bg-white border border-line rounded-2xl p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-4">
        <label className="flex flex-col gap-[6px] max-w-[420px]">
          <span className="font-bold text-[14px] text-ink-2">Образовательная программа</span>
          <FilterSelect
            value={program}
            onChange={(v) => {
              setProgram(v);
              setCompId(null);
            }}
            options={programs}
            searchable={programs.length > 6}
            placeholder="Выберите программу"
          />
        </label>
      </div>

      {/* Найти себя */}
      <div className="rounded-2xl p-[18px] mb-4 border border-[rgba(0,101,155,0.18)] bg-[linear-gradient(180deg,rgba(0,101,155,0.05),rgba(0,101,155,0.02))]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-2 font-display font-bold text-[15px] text-brand shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4-4" />
            </svg>
            Найти себя в списке
          </span>
          <div className="relative flex-1 min-w-[220px]">
            <input
              value={find}
              onChange={(e) => setFind(e.target.value)}
              inputMode="numeric"
              placeholder="Ваш уникальный код из личного кабинета"
              className="w-full box-border text-[16px] text-ink px-[14px] py-[11px] pr-10 border border-[rgb(200,214,226)] rounded-[9px] outline-none focus:border-accent"
            />
            {find && (
              <button
                type="button"
                onClick={() => setFind("")}
                aria-label="Очистить"
                className="absolute right-2 top-1/2 -translate-y-1/2 border-none bg-none cursor-pointer text-ink-3 text-[18px] leading-none"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {notFound && (
          <div className="mt-[14px] px-4 py-3 bg-[rgb(250,250,250)] border border-dashed border-line-strong rounded-[10px] text-[15px] text-ink-2">
            Код не найден. Проверьте уникальный код из личного кабинета — он состоит только из цифр.
          </div>
        )}
      </div>

      {personal ? (
        <PersonalView code={query} apps={apps} winnerPr={winnerPr} onBack={() => setFind("")} />
      ) : (
        comp && (
          <ListView
            comps={comps}
            comp={comp}
            onPick={setCompId}
            updated={data?.updated ?? ""}
          />
        )
      )}
    </div>
  );
}

// ─── Общий список выбранного конкурса ───
function ListView({
  comps,
  comp,
  onPick,
  updated,
}: {
  comps: Competition[];
  comp: Competition;
  onPick: (id: number) => void;
  updated: string;
}) {
  return (
    <>
      {/* Вкладки квот внутри программы */}
      {comps.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {comps.map((c) => {
            const active = c.id === comp.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick(c.id)}
                className="font-bold text-[15px] px-4 py-[9px] rounded-full border cursor-pointer inline-flex items-center gap-2 transition-colors"
                style={{
                  borderColor: active ? BRAND : "var(--c-line-strong)",
                  background: active ? BRAND : "#fff",
                  color: active ? "#fff" : "var(--c-steel)",
                }}
              >
                {c.quota}
                <span className="font-normal text-[13px] opacity-75">· {c.seats}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Инфо-полоска */}
      <div className="flex gap-0 bg-white border border-line rounded-2xl px-[22px] py-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-4 flex-wrap max-[640px]:flex-col">
        <div className="flex-[1_1_200px] pr-[22px] max-[640px]:pr-0 max-[640px]:pb-3">
          <div className="text-[13px] text-ink-3 mb-1">Программа</div>
          <div className="font-display font-bold text-[17px] text-ink leading-[1.25]">{comp.program}</div>
          <div className="text-[14px] text-ink-2 mt-[3px]">
            {comp.quota} · {comp.form} · {comp.basis}
          </div>
        </div>
        <Stat label={`Мест (${comp.quota.toLowerCase()})`} value={comp.seats} color={BRAND} />
        <Stat label="В списке" value={comp.rows.length} />
        <Stat label="Согласий подано" value={comp.consents} color={GREEN} />
      </div>

      {updated && (
        <div className="text-[13px] text-ink-3 mb-3">Обновлено {fmtUpdated(updated)}</div>
      )}

      <Table comp={comp} />
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex-none px-[22px] border-l border-line flex flex-col justify-center max-[640px]:border-l-0 max-[640px]:px-0 max-[640px]:py-2 max-[640px]:border-t">
      <div className="text-[13px] text-ink-3">{label}</div>
      <div className="font-display font-bold text-[26px]" style={{ color: color ?? "var(--c-ink)" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Таблица конкурса ───
function Table({ comp }: { comp: Competition }) {
  const seats = comp.seats;
  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[720px] text-[15px]">
          <thead>
            <tr className="bg-[rgb(247,249,251)] text-ink-3 text-[13px] text-left">
              <th className="px-[14px] py-3 font-bold">№</th>
              <th className="px-[14px] py-3 font-bold">Уникальный код</th>
              <th className="px-[14px] py-3 font-bold text-center">Сумма<br />баллов</th>
              <th className="px-[14px] py-3 font-bold text-center max-[860px]:hidden">ВИ по предметам</th>
              <th className="px-[14px] py-3 font-bold text-center max-[860px]:hidden">Инд.<br />дост.</th>
              <th className="px-[14px] py-3 font-bold text-center">Приор.</th>
              <th className="px-[14px] py-3 font-bold">Преим.<br />право</th>
              <th className="px-[14px] py-3 font-bold">Согласие</th>
            </tr>
          </thead>
          <tbody>
            {comp.rows.map((r, i) => {
              // Линия отсечения — после последнего проходного места.
              // Линия отсечения — оранжевая граница на первой непроходной строке.
              const cutline = seats > 0 && i === seats;
              const passing = seats > 0 && r.n <= seats;
              return (
                <tr
                  key={`${r.code}-${i}`}
                  className="hover:bg-[rgb(247,250,252)]"
                  style={{
                    borderTop: cutline ? "2px dashed rgb(255,159,10)" : "1px solid var(--c-line)",
                  }}
                  title={cutline ? "Проходной балл" : undefined}
                >
                  <td className="px-[14px] py-3 font-bold" style={{ color: passing ? BRAND : "rgb(120,120,120)" }}>
                    <span className="inline-flex items-center gap-[7px]">
                      {r.n}
                      {r.cons && <span style={{ color: GREEN }}>✓</span>}
                    </span>
                  </td>
                  <td className="px-[14px] py-3 font-display text-ink-2 tracking-[0.3px]">{r.code}</td>
                  <td className="px-[14px] py-3 text-center font-bold text-[17px] text-brand">{r.sum}</td>
                  <td className="px-[14px] py-3 text-center text-ink-2 max-[860px]:hidden tabular-nums">
                    {r.subj.join(" · ")}
                  </td>
                  <td className="px-[14px] py-3 text-center text-ink-2 max-[860px]:hidden">{r.id}</td>
                  <td className="px-[14px] py-3 text-center text-ink-2">{r.pr}</td>
                  <td className="px-[14px] py-3 text-[14px]" style={{ color: r.pref ? "rgb(180,60,20)" : "rgb(190,190,190)" }}>
                    {r.pref ? "есть" : "—"}
                  </td>
                  <td className="px-[14px] py-3">
                    <span
                      className="inline-flex items-center gap-[6px] text-[13px] font-bold px-[10px] py-1 rounded-full"
                      style={
                        r.cons
                          ? { background: "rgba(52,199,89,0.14)", color: GREEN }
                          : { background: "rgb(242,244,246)", color: "rgb(140,140,140)" }
                      }
                    >
                      {r.cons ? (r.orig ? "оригинал" : "согласие") : "нет"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Персональный режим: заявления абитуриента по приоритетам ───
function PersonalView({
  code,
  apps,
  winnerPr,
  onBack,
}: {
  code: string;
  apps: Application[];
  winnerPr: number | null;
  onBack: () => void;
}) {
  const sum = apps[0]?.sum ?? 0;
  const winner = apps.find((a) => a.pr === winnerPr);

  return (
    <div className="mb-[18px]">
      {/* Предварительный результат */}
      <div
        className="flex items-center gap-4 rounded-2xl px-[22px] py-[18px] mb-[18px] flex-wrap border border-l-[5px]"
        style={
          winner
            ? { background: "rgba(52,199,89,0.08)", borderColor: "rgba(52,199,89,0.4)", borderLeftColor: GREEN }
            : { background: "rgb(250,250,250)", borderColor: "rgb(224,228,232)", borderLeftColor: "rgb(180,180,180)" }
        }
      >
        <span
          className="shrink-0 w-11 h-11 rounded-full text-white flex items-center justify-center text-[22px] font-bold"
          style={{ background: winner ? GREEN : "rgb(150,150,150)" }}
        >
          {winner ? "✓" : "?"}
        </span>
        <div className="flex-1 min-w-[220px]">
          <div className="font-display font-bold text-[19px] leading-[1.25]" style={{ color: winner ? GREEN : "rgb(90,90,90)" }}>
            {winner ? `Проходите: ${winner.comp.program}` : "Пока не проходите по согласию"}
          </div>
          <div className="text-[14px] text-ink-2 mt-[3px]">
            {winner
              ? `Приоритет ${winner.pr}, ${winner.comp.quota.toLowerCase()} — № ${winner.n} из ${winner.comp.rows.length}, мест ${winner.comp.seats}`
              : "Зачисление — в высший приоритет, где вы проходите и подали согласие"}
          </div>
        </div>
        <div className="shrink-0 pl-[18px] border-l border-black/[0.08] text-right">
          <div className="text-[12px] text-ink-3">Код · сумма баллов</div>
          <div className="font-display font-bold text-[16px] text-ink">
            {code} · {sum}
          </div>
        </div>
      </div>

      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-display font-bold text-[20px] text-ink m-0">Ваши заявления по приоритету</h2>
        <span className="text-[13px] text-ink-3">Зачисление — в высший приоритет, где вы проходите и подали согласие</span>
      </div>

      <div className="flex flex-col gap-3">
        {apps.map((a, i) => {
          const passing = a.n <= a.comp.seats;
          const isWinner = a.pr === winnerPr;
          return (
            <div
              key={i}
              className="flex items-stretch bg-white border border-l-[5px] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] max-[640px]:flex-col"
              style={{ borderColor: "var(--c-line)", borderLeftColor: isWinner ? GREEN : passing ? BRAND : "rgb(200,200,200)" }}
            >
              <div
                className="shrink-0 w-[70px] flex flex-col items-center justify-center text-white py-[14px] px-2 max-[640px]:w-full max-[640px]:flex-row max-[640px]:gap-2"
                style={{ background: isWinner ? GREEN : passing ? BRAND : "rgb(150,150,150)" }}
              >
                <div className="text-[10px] uppercase tracking-[0.5px] opacity-85">Приор.</div>
                <div className="font-display font-bold text-[28px] leading-none">{a.pr}</div>
                {isWinner && <div className="text-[10px] font-bold mt-1 text-center">СЮДА</div>}
              </div>
              <div className="flex-[1_1_240px] min-w-[200px] px-[18px] py-[14px] flex flex-col justify-center">
                <div className="font-display font-bold text-[17px] text-ink leading-[1.25]">{a.comp.program}</div>
                <div className="text-[13px] text-ink-3 mt-[2px]">{a.comp.title}</div>
                <div className="flex gap-[6px] mt-2 flex-wrap">
                  <Chip>{a.comp.quota}</Chip>
                  <Chip>{a.comp.form}</Chip>
                  <Chip>{a.comp.basis}</Chip>
                </div>
              </div>
              <div className="shrink-0 px-5 py-[14px] flex flex-col justify-center items-center border-l border-line min-w-[110px] max-[640px]:border-l-0 max-[640px]:border-t">
                <div className="text-[12px] text-ink-3">Ваша позиция</div>
                <div className="font-display font-bold text-[24px] leading-[1.1]" style={{ color: passing ? GREEN : "rgb(200,120,40)" }}>
                  № {a.n}
                </div>
                <div className="text-[12px] text-ink-3">
                  из {a.comp.rows.length} · мест {a.comp.seats}
                </div>
              </div>
              <div className="shrink-0 px-5 py-[14px] flex flex-col justify-center gap-[7px] border-l border-line min-w-[150px] max-[640px]:border-l-0 max-[640px]:border-t">
                <span
                  className="text-[13px] font-bold px-[11px] py-[5px] rounded-full text-center"
                  style={
                    passing
                      ? { background: "rgba(52,199,89,0.14)", color: GREEN }
                      : { background: "rgb(242,244,246)", color: "rgb(140,140,140)" }
                  }
                >
                  {passing ? "проходите" : "не проходите"}
                </span>
                <span className="text-[13px] text-center" style={{ color: a.cons ? GREEN : "rgb(150,150,150)" }}>
                  {a.cons ? (a.orig ? "оригинал подан" : "согласие подано") : "согласия нет"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 font-bold text-[15px] text-brand bg-white border border-brand rounded-[9px] px-[18px] py-[10px] cursor-pointer"
      >
        ← Вернуться к общему списку
      </button>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] text-ink-2 bg-[rgb(242,244,246)] px-[9px] py-[3px] rounded-full">{children}</span>
  );
}
