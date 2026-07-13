import type { Metadata } from "next";
import { Inter, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SideRail } from "@/components/SideRail";
import { CookieBanner } from "@/components/CookieBanner";
import { getMainMenu, getFooter } from "@/lib/content/navigation";
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
        <div className="a11y-zoom flex-1 min-w-0 flex flex-col">
          <SiteHeader nav={nav} />
          <div className="flex-1">{children}</div>
          <SiteFooter footer={footer} />
        </div>
        <CookieBanner />
      </body>
    </html>
  );
}
