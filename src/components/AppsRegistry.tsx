"use client";

import { useMemo, useState } from "react";
import type { AppItem, Audience } from "@/lib/content/navigation";
import { Link } from "@/components/Link";
import { Icon } from "@/components/icons";
import { APPS_UI } from "@/lib/i18n/ui-defs";

// Реестр приложений. Делим по АУДИТОРИИ, а не по секретности: служебные 1С
// и так открыты без входа на app.orgma.ru и индексируются — прятать их здесь
// было бы видимостью защиты, а не защитой. Задача фильтра — чтобы студент не
// продирался через бухгалтерию к своей ЭИОС.


const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  active: { color: "rgb(30,160,80)", bg: "rgba(52,199,89,0.12)" },
  updating: { color: "rgb(180,120,0)", bg: "rgba(255,149,0,0.14)" },
  legacy: { color: "rgb(150,150,150)", bg: "rgba(0,0,0,0.06)" },
};

export function AppsRegistry({ apps, ui }: { apps: AppItem[]; ui?: Partial<typeof APPS_UI> }) {
  const s_ = { ...APPS_UI, ...ui };
  const TABS: { key: Audience | "all"; label: string }[] = [
    { key: "students", label: s_.students },
    { key: "staff", label: s_.staff },
    { key: "all", label: s_.all },
  ];
  const STATUS: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: s_.active, ...STATUS_COLOR.active },
    updating: { label: s_.updating, ...STATUS_COLOR.updating },
    legacy: { label: s_.legacy, ...STATUS_COLOR.legacy },
  };
  const AUTH: Record<string, string> = { account: s_.account, vpn: s_.vpn, none: "" };
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
          placeholder={s_.searchHint}
          className="flex-1 min-w-[180px] text-[15px] text-ink px-[14px] py-[8px] border border-line-strong rounded-[9px] outline-none focus:border-accent"
        />
      </div>

      {/* Карточка — по макету Apps.dc.html: плитка иконки 64px на мягкой
            подложке, крупное имя, описание, футер с кнопкой входа. Бейджи
            статуса — наши: макет их не знает, но «Выводится» и «Нужна учётная
            запись» без них сказать негде. */}
      {list.length === 0 ? (
        <div className="py-10 px-6 text-center bg-white border border-dashed border-line-strong rounded-xl text-ink-2">
          Ничего не найдено.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
          {list.map((a) => {
            const st = STATUS[a.status ?? "active"];
            const authNote = AUTH[a.auth ?? "none"];
            const replaced = a.replacedBy ? apps.find((x) => x.id === a.replacedBy) : undefined;
            const soft = a.accent.replace("rgb(", "rgba(").replace(")", ",0.12)");
            return (
              <div
                key={a.id}
                className="flex flex-col bg-white border border-line rounded-[14px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center gap-4 px-6 pt-6 pb-4">
                  <span
                    className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: soft, color: a.accent }}
                  >
                    <Icon name={a.icon} size={32} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-display font-bold text-[22px] text-brand leading-[1.15]">
                      {a.name}
                    </div>
                    <div className="text-[15px] text-ink-3 break-words">{a.tag}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-[6px] px-6 pb-3">
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

                <p className="m-0 px-6 pb-5 text-[17px] leading-[1.5] text-steel">{a.desc}</p>

                {replaced && (
                  <div className="mx-6 mb-5 text-[14px] text-ink-2 bg-bg-muted border border-dashed border-line-strong rounded-lg px-3 py-2">
                    Заменяется на <b className="text-brand">{replaced.name}</b>
                  </div>
                )}

                <div className="mt-auto px-6 py-4 border-t border-line flex flex-col gap-[10px]">
                  <div className="flex gap-[10px] flex-wrap items-center">
                    {/* Внутренние адреса — через Link: у обычного <a> basePath
                        не применяется и ссылка ведёт в 404. */}
                    {a.href === "#" ? (
                      <span className="font-ui font-bold text-[16px] text-ink-3 rounded-lg border border-dashed border-line-strong px-4 py-[9px]">
                        Скоро
                      </span>
                    ) : a.href.startsWith("http") ? (
                      <a
                        href={a.href}
                        target="_blank"
                        rel="noopener"
                        className="font-ui font-bold text-[16px] text-white no-underline rounded-lg px-[18px] py-[10px]"
                        style={{ background: a.accent }}
                      >
                        {a.cta}
                      </a>
                    ) : (
                      <Link
                        href={a.href}
                        className="font-ui font-bold text-[16px] text-white no-underline rounded-lg px-[18px] py-[10px]"
                        style={{ background: a.accent }}
                      >
                        {a.cta}
                      </Link>
                    )}
                    {/* Кнопки «Подробнее» из макета здесь нет намеренно: у наших
                        приложений отдельной страницы-описания либо нет вовсе
                        (МФЦ, ЭИОС — внешние сервисы), либо кнопка входа уже
                        ведёт именно на неё (1С, СДО). Она дублировала бы вход. */}
                  </div>
                  {authNote && <span className="text-[13px] text-ink-3">{authNote}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
