"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/components/Link";
import { usePathname } from "next/navigation";
import { LOCALE_NAMES, TARGET_LOCALES, SOURCE_LOCALE, localeHref, type Locale } from "@/lib/i18n/config";
import { usePreferredLocale } from "@/lib/i18n/use-locale";
import { SOCIALS } from "@/components/socials";
import { RAIL_UI } from "@/lib/i18n/ui-defs";

// Прячет нижнюю панель при прокрутке вниз, возвращает при прокрутке вверх —
// как шапка в Safari и большинстве приложений, жест людям знаком. Так во время
// чтения панель не отъедает ~56px внизу невысокого экрана, но остаётся в одном
// коротком движении. Порог в 6px гасит дрожь пальца; у самого верха страницы
// панель всегда видна, чтобы первый экран не открывался «пустым».
function useHideOnScroll(): boolean {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 40) setHidden(false);
      else if (Math.abs(y - last.current) > 6) setHidden(y > last.current);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return hidden;
}

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

const LANGS: { locale: Locale; label: string; code: string }[] = [
  SOURCE_LOCALE,
  ...TARGET_LOCALES,
].map((l) => ({ locale: l as Locale, label: LOCALE_NAMES[l as Locale].native, code: LOCALE_NAMES[l as Locale].code }));

export function SideRail({
  translatedPaths = [],
  ui,
}: {
  translatedPaths?: string[];
  /** Подписи на всех языках: layout про язык страницы не знает. */
  ui?: Record<string, typeof RAIL_UI>;
}) {
  const [langOpen, setLangOpen] = useState(false);
  // Текущий язык определяем по адресу, а не храним в состоянии: иначе после
  // перехода подпись рассинхронизировалась бы со страницей.
  const pathname = usePathname() || "/";
  // Не только из адреса: на непереведённой странице выбор языка должен
  // сохраняться, иначе подпись прыгает на РУС и переключать надо заново.
  const current = usePreferredLocale();
  const lang = LOCALE_NAMES[current].code;
  // Переход на тот же адрес в другом языке. Если этой страницы на нужном языке
  // нет — ведём на языковую главную: попасть в 404, переключив язык, хуже, чем
  // оказаться на разделе с тем, что переведено.
  const hrefFor = (l: Locale) => {
    if (l === SOURCE_LOCALE) return localeHref(pathname, l);
    const base = pathname.replace(/^\/(en|kk)(?=\/|$)/, "") || "/";
    const known = translatedPaths.some((p) => base === p || base.startsWith(`${p}/`));
    return known ? localeHref(pathname, l) : `/${l}`;
  };
  const hidden = useHideOnScroll();
  const s_ = ui?.[current] ?? RAIL_UI;

  return (
    <>
    {/* Нижняя панель — только мобильный. z-40: cookie-баннер (z-1000)
        перекрывает её, пока согласие не дано — согласие важнее.
        Прячется при прокрутке вниз (translate за край + safe-area). */}
    <nav
      data-a11y-surface="brand"
      aria-label={s_.quickActions}
      aria-hidden={hidden}
      className="min-[769px]:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand flex items-stretch justify-around border-t border-white/15 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 will-change-transform"
      style={{
        // Инлайном, а не Tailwind-утилитой: arbitrary-значение
        // translate-y-[calc(100%+env(...))] в v4 не собирается в transform.
        // «+1px» закрывает волосяную щель над safe-area на части устройств.
        transform: hidden ? "translateY(calc(100% + env(safe-area-inset-bottom) + 1px))" : "translateY(0)",
      }}
    >
      <Link href="/poisk" className={MOBILE_ITEM}>
        {ICONS.search}
        <span>{s_.search}</span>
      </Link>
      <Link href="/prilozheniya" className={MOBILE_ITEM}>
        {ICONS.apps}
        <span>{s_.services}</span>
      </Link>
      {/* По кругу: РУС → ENG → ҚАЗ. Это ссылка, а не кнопка, — переход между
          языками должен работать и открываться в новой вкладке. */}
      <Link href={hrefFor(LANGS[(LANGS.findIndex((l) => l.locale === current) + 1) % LANGS.length].locale)} className={MOBILE_ITEM}>
        <span className="font-bold text-[15px] leading-6">{lang}</span>
        <span>{s_.language}</span>
      </Link>
      <Link href="/dostupnost" className={MOBILE_ITEM}>
        {ICONS.access}
        <span>{s_.accessibility}</span>
      </Link>
    </nav>

    <aside
      data-a11y-surface="brand"
      className="hidden min-[769px]:flex w-[94px] self-stretch shrink-0 bg-brand flex-col z-[300]"
    >
      <div className="sticky top-0 flex flex-col items-center py-5 font-ui">
        {/* Поиск */}
        <div className="flex flex-col items-center gap-2">
          <Link href="/poisk" title={s_.searchTitle} className={RAIL_ICON}>
            {ICONS.search}
          </Link>
        </div>

        <div className="w-11 h-px bg-white/20 my-[14px]" />

        {/* Приложения вуза */}
        <div className="flex flex-col items-center gap-2">
          <Link href="/prilozheniya" title={s_.apps} className={RAIL_ICON}>
            {ICONS.apps}
          </Link>
        </div>

        <div className="w-11 h-px bg-white/20 my-[14px]" />

        {/* Соцсети — общий список: он же на странице контактов */}
        <div className="flex flex-col items-center gap-2">
          {SOCIALS.map((s) => (
            <a key={s.key} href={s.href} title={s.title} target="_blank" rel="noopener noreferrer" className={RAIL_ICON}>
              {s.icon}
            </a>
          ))}
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
                    <Link
                      key={l.code}
                      href={hrefFor(l.locale)}
                      onClick={() => setLangOpen(false)}
                      className="flex items-center justify-between gap-[10px] font-ui font-bold text-[16px] border-none rounded-lg px-[14px] py-[10px] cursor-pointer text-left whitespace-nowrap no-underline"
                      style={{
                        color: activeLang ? "var(--c-brand)" : "var(--c-steel)",
                        background: activeLang ? "rgba(184,57,4,0.12)" : "transparent",
                      }}
                    >
                      {l.label}
                      <span className="text-[13px] text-ink-3">{l.code}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          <Link href="/dostupnost" title={s_.accessibilityTitle} className={RAIL_ICON}>
            {ICONS.access}
          </Link>
        </div>
      </div>
    </aside>
    </>
  );
}
