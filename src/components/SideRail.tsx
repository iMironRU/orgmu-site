"use client";

import { useState } from "react";
import Link from "next/link";

// Левая боковая панель (~94px): поиск, приложения, соцсети, язык, доступная среда.
// Sticky, на десктопе слева.
//
// На мобиле панель раньше просто пропадала (как и в макете) — вместе с ней
// становились недоступны настройки доступности, а это для сайта вуза дыра:
// раздел «Доступность» есть, а дотянуться с телефона нельзя. Поэтому снизу
// показываем компактную панель с четырьмя крупными целями: поиск, приложения,
// язык, доступность. Соцсети туда не тащим — они есть в подвале, а мелкие
// цели на телефоне ведут к промахам.

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const solid = { fill: "currentColor", stroke: "none" };

// Цель в нижней панели: не меньше 56px по высоте — палец, не курсор.
const MOBILE_ITEM =
  "flex-1 flex flex-col items-center justify-center gap-[3px] min-h-[56px] px-1 py-2 text-white/90 no-underline text-[11px] font-ui bg-transparent border-none cursor-pointer active:bg-white/10";

const ICONS = {
  search: (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
      <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z" />
      <path d="M20 20l-4-4" />
    </svg>
  ),
  apps: (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  ),
  vk: (
    <svg width="24" height="24" viewBox="0 0 24 24" {...solid}>
      <path d="M12.9 16.6c-5 0-8.2-3.5-8.3-9.2h2.6c.1 4.2 2 6 3.5 6.4V7.4h2.4v3.6c1.5-.2 3-1.8 3.6-3.6h2.4c-.5 2.2-2.1 3.8-3.2 4.5 1.1.6 2.9 2 3.6 4.7h-2.7c-.5-1.7-1.9-3.1-3.7-3.2v3.2h-.2Z" />
    </svg>
  ),
  tg: (
    <svg width="24" height="24" viewBox="0 0 24 24" {...solid}>
      <path d="M21.9 5.3 18.9 19c-.2 1-.8 1.2-1.6.8l-4.4-3.3-2.1 2c-.24.24-.43.43-.88.43l.31-4.5 8.2-7.4c.36-.32-.08-.5-.55-.18L7.5 13.3l-4.4-1.4c-.95-.3-.97-.95.2-1.4L20.6 3.9c.8-.3 1.5.18 1.3 1.4Z" />
    </svg>
  ),
  youtube: (
    <svg width="24" height="24" viewBox="0 0 24 24" {...solid}>
      <path d="M23 8.2a3 3 0 0 0-2.1-2.1C19 5.6 12 5.6 12 5.6s-7 0-8.9.5A3 3 0 0 0 1 8.2 31 31 0 0 0 .6 12 31 31 0 0 0 1 15.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.9.4-3.8.4-3.8s0-1.9-.4-3.8ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z" />
    </svg>
  ),
  access: (
    <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 4.2a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" fill="currentColor" stroke="none" />
      <path d="M4.5 8.2c2.4.9 4.9 1.3 7.5 1.3s5.1-.4 7.5-1.3" />
      <path d="M12 9.5v5M9 20l3-5.5L15 20" />
    </svg>
  ),
};

const RAIL_ICON =
  "relative flex items-center justify-center w-[46px] h-[46px] rounded-xl text-white no-underline transition-colors hover:bg-white/15";

const LANGS = [
  { label: "Русский", code: "РУС" },
  { label: "English", code: "ENG" },
  { label: "Қазақша", code: "ҚАЗ" },
];

export function SideRail() {
  const [lang, setLang] = useState("РУС");
  const [langOpen, setLangOpen] = useState(false);

  const cycleLang = () => setLang((l) => (l === "РУС" ? "ENG" : l === "ENG" ? "ҚАЗ" : "РУС"));

  return (
    <>
    {/* Нижняя панель — только мобильный. z-40: cookie-баннер (z-1000)
        перекрывает её, пока согласие не дано — согласие важнее. */}
    <nav
      data-a11y-surface="brand"
      aria-label="Быстрые действия"
      className="min-[769px]:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand flex items-stretch justify-around border-t border-white/15 pb-[env(safe-area-inset-bottom)]"
    >
      <a href="#" className={MOBILE_ITEM}>
        {ICONS.search}
        <span>Поиск</span>
      </a>
      <Link href="/prilozheniya" className={MOBILE_ITEM}>
        {ICONS.apps}
        <span>Сервисы</span>
      </Link>
      <button type="button" onClick={cycleLang} className={MOBILE_ITEM}>
        <span className="font-bold text-[15px] leading-6">{lang}</span>
        <span>Язык</span>
      </button>
      <Link href="/dostupnost" className={MOBILE_ITEM}>
        {ICONS.access}
        <span>Доступность</span>
      </Link>
    </nav>

    <aside
      data-a11y-surface="brand"
      className="hidden min-[769px]:flex w-[94px] self-stretch shrink-0 bg-brand flex-col z-[300]"
    >
      <div className="sticky top-0 flex flex-col items-center py-5 font-ui">
        {/* Поиск */}
        <div className="flex flex-col items-center gap-2">
          <a href="#" title="Поиск по сайту" className={RAIL_ICON}>
            {ICONS.search}
          </a>
        </div>

        <div className="w-11 h-px bg-white/20 my-[14px]" />

        {/* Приложения вуза */}
        <div className="flex flex-col items-center gap-2">
          <Link href="/prilozheniya" title="Приложения вуза" className={RAIL_ICON}>
            {ICONS.apps}
          </Link>
        </div>

        <div className="w-11 h-px bg-white/20 my-[14px]" />

        {/* Соцсети */}
        <div className="flex flex-col items-center gap-2">
          <a href="https://vk.com/orgma_ru" title="ВКонтакте" target="_blank" rel="noopener noreferrer" className={RAIL_ICON}>
            {ICONS.vk}
          </a>
          <a href="https://t.me/orgma_ru" title="Telegram" target="_blank" rel="noopener noreferrer" className={RAIL_ICON}>
            {ICONS.tg}
          </a>
          <a href="#" title="YouTube" className={RAIL_ICON}>
            {ICONS.youtube}
          </a>
        </div>

        <div className="w-11 h-px bg-white/20 my-[14px]" />

        {/* Язык + доступная среда */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <button
              type="button"
              title="Язык / Language / Тіл"
              onClick={() => setLangOpen((o) => !o)}
              className={RAIL_ICON}
              style={{ background: langOpen ? "rgba(255,255,255,0.16)" : "transparent" }}
            >
              <span className="font-ui font-bold text-[13px] tracking-[0.02em]">{lang}</span>
            </button>
            {langOpen && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 z-[400] bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.22)] p-1.5 flex flex-col min-w-[130px]">
                {LANGS.map((l) => {
                  const activeLang = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className="flex items-center justify-between gap-[10px] font-ui font-bold text-[16px] border-none rounded-lg px-[14px] py-[10px] cursor-pointer text-left whitespace-nowrap"
                      style={{
                        color: activeLang ? "var(--c-brand)" : "var(--c-steel)",
                        background: activeLang ? "rgba(184,57,4,0.12)" : "transparent",
                      }}
                    >
                      {l.label}
                      <span className="text-[13px] text-ink-3">{l.code}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <Link href="/dostupnost" title="Настройки доступности" className={RAIL_ICON}>
            {ICONS.access}
          </Link>
        </div>
      </div>
    </aside>
    </>
  );
}
