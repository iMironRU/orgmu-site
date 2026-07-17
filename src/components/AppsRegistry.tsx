"use client";

import { useMemo, useState } from "react";
import type { AppItem, Audience } from "@/lib/content/navigation";
import { Icon } from "@/components/icons";

// Реестр приложений. Делим по АУДИТОРИИ, а не по секретности: служебные 1С
// и так открыты без входа на app.orgma.ru и индексируются — прятать их здесь
// было бы видимостью защиты, а не защитой. Задача фильтра — чтобы студент не
// продирался через бухгалтерию к своей ЭИОС.
const TABS: { key: Audience | "all"; label: string }[] = [
  { key: "students", label: "Обучающимся" },
  { key: "staff", label: "Сотрудникам" },
  { key: "all", label: "Все" },
];

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Работает", color: "rgb(30,160,80)", bg: "rgba(52,199,89,0.12)" },
  updating: { label: "Обновляется", color: "rgb(180,120,0)", bg: "rgba(255,149,0,0.14)" },
  legacy: { label: "Выводится", color: "rgb(150,150,150)", bg: "rgba(0,0,0,0.06)" },
};

const AUTH: Record<string, string> = {
  account: "Нужна учётная запись",
  vpn: "Только из сети вуза",
  none: "",
};

export function AppsRegistry({ apps }: { apps: AppItem[] }) {
  const [tab, setTab] = useState<Audience | "all">("students");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return apps.filter(
      (a) =>
        (tab === "all" || (a.audience ?? []).includes(tab)) &&
        (!s ||
          a.name.toLowerCase().includes(s) ||
          a.tag.toLowerCase().includes(s) ||
          (a.desc ?? "").toLowerCase().includes(s) ||
          (a.category ?? "").toLowerCase().includes(s)),
    );
  }, [apps, tab, q]);

  const count = (k: Audience | "all") =>
    k === "all" ? apps.length : apps.filter((a) => (a.audience ?? []).includes(k)).length;

  return (
    <div className="font-ui">
      <div className="flex flex-wrap gap-[10px] mb-4">
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="text-[15px] font-medium rounded-full px-[17px] py-[7px] border cursor-pointer transition-colors"
              style={{
                color: on ? "#fff" : "var(--c-steel)",
                background: on ? "var(--c-accent)" : "#fff",
                borderColor: on ? "var(--c-accent)" : "var(--c-line-strong)",
              }}
            >
              {t.label}
              <span className={on ? "text-white/75" : "text-ink-3"}> · {count(t.key)}</span>
            </button>
          );
        })}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск приложения…"
          className="flex-1 min-w-[180px] text-[15px] text-ink px-[14px] py-[8px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
        />
      </div>

      {list.length === 0 ? (
        <div className="py-10 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl text-ink-2">
          Ничего не найдено.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {list.map((a) => {
            const st = STATUS[a.status ?? "active"];
            const authNote = AUTH[a.auth ?? "none"];
            const replaced = a.replacedBy ? apps.find((x) => x.id === a.replacedBy) : undefined;
            return (
              <div
                key={a.id}
                className="flex flex-col gap-3 bg-white border border-line rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ background: a.accent }}
                  >
                    <Icon name={a.icon} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-display font-bold text-[18px] text-brand leading-[1.2]">
                      {a.name}
                    </span>
                    <span className="block text-[13px] text-ink-3 mt-[2px] break-words">{a.tag}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-[6px]">
                  {st && (
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.04em] rounded-md px-2 py-[3px]"
                      style={{ color: st.color, background: st.bg }}
                    >
                      {st.label}
                    </span>
                  )}
                  {a.platform === "1c" && (
                    <span className="text-[11px] font-bold uppercase tracking-[0.04em] rounded-md px-2 py-[3px] text-[rgb(180,60,20)] bg-[rgba(184,57,4,0.10)]">
                      1С
                    </span>
                  )}
                  {a.category && (
                    <span className="text-[11px] font-bold uppercase tracking-[0.04em] rounded-md px-2 py-[3px] text-steel bg-bg-muted border border-line">
                      {a.category}
                    </span>
                  )}
                </div>

                <p className="m-0 text-[15px] leading-[1.45] text-steel flex-1">{a.desc}</p>

                {replaced && (
                  <div className="text-[13px] text-ink-2 bg-bg-muted border border-dashed border-line-strong rounded-lg px-3 py-2">
                    Заменяется на <b className="text-brand">{replaced.name}</b>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <a
                    href={a.href}
                    className={`font-bold text-[15px] no-underline ${a.href === "#" ? "text-ink-3 pointer-events-none" : "text-accent hover:underline"}`}
                  >
                    {a.href === "#" ? "Скоро" : `${a.cta} →`}
                  </a>
                  {authNote && <span className="text-[12px] text-ink-3">{authNote}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
