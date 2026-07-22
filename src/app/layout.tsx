import type { Metadata } from "next";
import { Inter, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SideRail } from "@/components/SideRail";
import { CookieBanner } from "@/components/CookieBanner";
import { BackToTop } from "@/components/BackToTop";
import { getMainMenu, getFooter } from "@/lib/content/navigation";
import { TARGET_LOCALES } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { A11Y_INLINE_SCRIPT } from "@/lib/a11y";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-rc",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ОрГМУ — Оренбургский государственный медицинский университет",
    template: "%s · ОрГМУ",
  },
  description:
    "Официальный сайт Оренбургского государственного медицинского университета Минздрава России.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nav = getMainMenu();
  const footer = getFooter();
  // Шапка и подвал живут в КОРНЕВОМ layout, а он про язык страницы не знает:
  // сегмент [lang] лежит глубже. Поэтому считаем меню на всех языках здесь, а
  // нужный вариант выбирает клиент по адресу. Меню весит ~2,8 КБ, три языка —
  // около 9 КБ, это дешевле, чем переносить все 29 маршрутов ради локали.
  const navByLocale: Record<string, typeof nav> = { ru: nav };
  const footerByLocale: Record<string, typeof footer> = { ru: footer };
  for (const l of TARGET_LOCALES) {
    navByLocale[l] = translateData(nav, l).data;
    footerByLocale[l] = translateData(footer, l).data;
  }
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${inter.variable} ${robotoCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex items-stretch">
        {/* Раннее применение настроек доступности до гидрации — без мигания */}
        <script dangerouslySetInnerHTML={{ __html: A11Y_INLINE_SCRIPT }} />
        <SideRail />
        {/* Отступ снизу на мобиле — под фиксированную панель SideRail,
            иначе подвал уезжает под неё. */}
        <div className="a11y-zoom flex-1 min-w-0 flex flex-col max-[768px]:pb-[56px]">
          <SiteHeader nav={nav} navByLocale={navByLocale} />
          <div className="flex-1">{children}</div>
          <SiteFooter footer={footer} footerByLocale={footerByLocale} />
        </div>
        <BackToTop />
        <CookieBanner />
      </body>
    </html>
  );
}
