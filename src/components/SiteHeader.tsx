"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TARGET_LOCALES } from "@/lib/i18n/config";
import Link from "next/link";
import { asset } from "@/lib/asset";
import type { NavItem } from "@/lib/content/navigation";

// Меню приходит пропсом из layout (грузится из content/navigation/main.yml).
export function SiteHeader({
  nav,
  navByLocale,
}: {
  nav: NavItem[];
  // Меню на всех языках: корневой layout не знает локаль, выбираем по адресу.
  navByLocale?: Record<string, NavItem[]>;
}) {
  const pathname = usePathname() || "/";
  const locale = TARGET_LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  const NAV = (locale && navByLocale?.[locale]) || nav;
  const [open, setOpen] = useState(-1); // индекс раскрытого desktop-пункта
  const [burger, setBurger] = useState(false);
  const [exp, setExp] = useState(-1);

  // Шапка живёт в общем layout — состояние переживает переход. Без явного
  // закрытия бургер оставался раскрытым поверх новой страницы.
  const closeBurger = () => {
    setBurger(false);
    setExp(-1);
  };

  // Липкая шапка на мобиле: без неё, прокрутив вниз, теряешь и меню, и
  // понимание, где находишься. Сжимаем при прокрутке — иначе на телефоне
  // навигация съедала бы пол-экрана.
  const [scrolled, setScrolled] = useState(false);
  // Название текущей страницы для сжатой шапки. Берём из document.title —
  // его ставит metadata каждой страницы, отдельный источник заводить незачем.
  // Суффикс шаблона («· ОрГМУ») отрезаем.
  const [pageTitle, setPageTitle] = useState("");
  const path = usePathname();
  useEffect(() => {
    setPageTitle(document.title.replace(/\s*·\s*ОрГМУ\s*$/, "").trim());
  }, [path]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!burger) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBurger();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [burger]); // индекс раскрытого пункта в мобильном аккордеоне

  const active = open >= 0 ? NAV[open] : null;

  return (
    <header
      className="max-[1050px]:sticky max-[1050px]:top-0 relative bg-white border-b border-line font-ui z-[100]"
      onMouseLeave={() => setOpen(-1)}
    >
      <div className={`mx-auto max-w-[1346px] px-6 flex items-center gap-6 transition-[padding] ${scrolled ? "max-[1050px]:py-2 py-4" : "py-4"}`}>
        <Link href="/" className="flex items-center gap-[14px] no-underline shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/brand/orgma-logo.png")}
            alt="ОрГМУ"
            width={64}
            height={64}
            className={`object-contain transition-[width,height] ${scrolled ? "max-[1050px]:w-10 max-[1050px]:h-10 w-16 h-16" : "w-16 h-16"}`}
          />
          <span className="flex flex-col leading-[1.05]">
            <span className="font-bold text-[22px] text-brand">ОрГМУ</span>
            {/* При прокрутке на мобиле подпись вуза бесполезна — её видно
                в лого. Подменяем названием страницы: иначе, уехав вниз,
                непонятно, где находишься. На десктопе подпись как была. */}
            <span
              className={`font-normal text-[12px] text-steel max-w-[190px] ${scrolled && pageTitle ? "max-[1050px]:hidden" : ""}`}
            >
              Оренбургский государственный медицинский университет
            </span>
            {scrolled && pageTitle && (
              <span className="hidden max-[1050px]:block font-bold text-[13px] text-steel max-w-[190px] truncate">
                {pageTitle}
              </span>
            )}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden min-[1051px]:flex ml-auto items-center gap-1">
          {NAV.map((item, i) => (
            <button
              key={item.label}
              onMouseEnter={() => setOpen(i)}
              onClick={() => setOpen(i)}
              className="font-ui font-bold text-[18px] whitespace-nowrap bg-none border-none px-[14px] py-[10px] cursor-pointer transition-colors"
              style={{
                color: open === i ? "var(--c-accent)" : "var(--c-brand)",
                borderBottom: `3px solid ${open === i ? "var(--c-accent)" : "transparent"}`,
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Burger (mobile) */}
        <button
          onClick={() => {
            setBurger((b) => !b);
            setOpen(-1);
          }}
          aria-label="Меню"
          className="min-[1051px]:hidden ml-auto w-11 h-11 flex items-center justify-center bg-none border border-line rounded-lg cursor-pointer"
        >
          <span className="block w-[22px] h-0.5 bg-brand shadow-[0_-7px_0_var(--c-brand),0_7px_0_var(--c-brand)]" />
        </button>
      </div>

      {/* Desktop mega-panel */}
      {active && (
        <div className="hidden min-[1051px]:block absolute left-0 right-0 top-full z-[200] bg-white border-t border-line shadow-[0_12px_24px_rgba(0,0,0,0.1)]">
          <div
            className="mx-auto max-w-[1346px] px-6 py-8 grid gap-8"
            style={{ gridTemplateColumns: `repeat(${active.columns.length}, 1fr)` }}
          >
            {active.columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <span className="font-bold text-[20px] text-brand pb-2 border-b-2 border-sky-soft">
                  {col.title}
                </span>
                {col.items.map((li) => (
                  <Link
                    key={li.label}
                    href={li.href}
                    className="font-normal text-[16px] text-steel no-underline transition-colors hover:text-accent"
                  >
                    {li.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile accordion */}
      {burger && (
        <div className="min-[1051px]:hidden border-t border-line px-5 pt-2 pb-5 max-h-[70vh] overflow-y-auto">
          {NAV.map((item, i) => (
            <div key={item.label}>
              <button
                onClick={() => setExp((e) => (e === i ? -1 : i))}
                className="w-full flex items-center justify-between py-[14px] px-1 border-none border-b border-line bg-none font-ui font-bold text-[18px] text-brand cursor-pointer text-left"
              >
                {item.label}
                <span className="text-sky-soft text-[22px]">{exp === i ? "–" : "+"}</span>
              </button>
              {exp === i && (
                <div className="px-1 pt-[6px] pb-[14px] pl-3 flex flex-col gap-[14px]">
                  {item.columns.map((col) => (
                    <div key={col.title} className="flex flex-col gap-2">
                      <span className="font-bold text-[15px] text-steel">{col.title}</span>
                      {col.items.map((li) => (
                        <Link
                          key={li.label}
                          href={li.href}
                          onClick={closeBurger}
                          className="font-normal text-[16px] text-steel no-underline py-0.5"
                        >
                          {li.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
