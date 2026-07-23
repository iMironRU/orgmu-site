import type { Metadata } from "next";
import { Inter, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { UntranslatedNotice } from "@/components/UntranslatedNotice";
import { LanguageSuggestion } from "@/components/LanguageSuggestion";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import { t } from "@/lib/i18n/t";
import { SiteFooter } from "@/components/SiteFooter";
import { SideRail } from "@/components/SideRail";
import { CookieBanner } from "@/components/CookieBanner";
import { BackToTop } from "@/components/BackToTop";
import { getMainMenu, getFooter } from "@/lib/content/navigation";
import { TARGET_LOCALES } from "@/lib/i18n/config";
import { translateData } from "@/lib/i18n/translate-data";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { RAIL_UI } from "@/lib/i18n/ui-defs";
import { getPageSlugs } from "@/lib/content/pages";
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
  // Нужен для hreflang и canonical: без него Next не может собрать абсолютные
  // адреса языковых версий.
  metadataBase: new URL("https://new.orgma.ru"),
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
  // Какие разделы вообще переведены. Нужно переключателю: с непереведённой
  // страницы он должен вести на языковую главную, а не в 404.
  const translatedPaths = [
    "/novosti",
    "/struktura",
    "/persony",
    "/kontakty",
    "/mesta",
    "/prilozheniya",
    "/izvestiya",
    ...getPageSlugs("info").map((s) => `/${s}`),
  ];

  // Подписи боковой панели на всех языках — по той же причине, что и меню.
  const railUi = {
    ru: RAIL_UI,
    ...Object.fromEntries(TARGET_LOCALES.map((l) => [l, uiStrings(RAIL_UI, l)])),
  };

  // Куки-баннер: строки на всех языках, выбор — на клиенте.
  const COOKIE_RU = {
    text: "Мы используем файлы cookie для корректной работы сайта. Продолжая пользоваться сайтом, вы соглашаетесь с",
    policy: "политикой обработки данных",
    ok: "Хорошо",
  };
  const cookieTexts: Record<string, typeof COOKIE_RU> = { ru: COOKIE_RU };
  for (const l of TARGET_LOCALES) {
    cookieTexts[l] = {
      text: t(COOKIE_RU.text, l),
      policy: t(COOKIE_RU.policy, l),
      ok: t(COOKIE_RU.ok, l),
    };
  }

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
        <LocaleProvider translatedPaths={translatedPaths}>
        <SideRail translatedPaths={translatedPaths} ui={railUi} />
        {/* Отступ снизу на мобиле — под фиксированную панель SideRail,
            иначе подвал уезжает под неё. */}
        <div className="a11y-zoom flex-1 min-w-0 flex flex-col max-[768px]:pb-[56px]">
          {/* Предложение сменить язык — над шапкой: если оно уместно, человек
              должен увидеть его сразу, не прокручивая. */}
          <LanguageSuggestion />
          <SiteHeader nav={nav} navByLocale={navByLocale} translatedPaths={translatedPaths} />
          <div className="flex-1">
            {/* Пояснение на русской странице, если человек читает сайт на
                другом языке. Показывается сам, только когда уместно. */}
            <UntranslatedNotice />
            {children}
          </div>
          <SiteFooter footer={footer} footerByLocale={footerByLocale} />
        </div>
        <BackToTop />
        <CookieBanner texts={cookieTexts} />
        </LocaleProvider>
      </body>
    </html>
  );
}
