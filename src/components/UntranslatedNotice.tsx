"use client";

import { Link } from "@/components/Link";
import { usePathname } from "next/navigation";
import { usePreferredLocale, localeFromPath } from "@/lib/i18n/use-locale";
import { SOURCE_LOCALE } from "@/lib/i18n/config";

// Полоса на русской странице, когда человек читает сайт на другом языке:
// объясняет, почему тут вдруг русский, вместо того чтобы молча его подсунуть.
// Оформление — как у плашки перевода (блок callout из PageTemplate.dc.html),
// но цвет спокойнее: это не предупреждение о качестве, а пояснение.
const S: Record<string, { text: string; link: string }> = {
  en: {
    text: "This section is available in Russian only.",
    link: "Back to the English version",
  },
  kk: {
    text: "Бұл бөлім тек орыс тілінде қолжетімді.",
    link: "Қазақ тіліндегі нұсқаға оралу",
  },
};

export function UntranslatedNotice() {
  const pathname = usePathname() || "/";
  const locale = usePreferredLocale();

  // Показываем только на РУССКОЙ странице и только если выбран другой язык.
  if (localeFromPath(pathname) || locale === SOURCE_LOCALE) return null;
  const s = S[locale];
  if (!s) return null;

  return (
    <div className="mx-auto max-w-[1146px] w-full px-10 pt-5 box-border max-[768px]:px-5 font-ui">
      <div className="flex gap-[14px] px-5 py-[14px] bg-[rgb(240,246,250)] border border-[rgb(214,230,240)] rounded-[10px]">
        <span className="shrink-0 text-brand flex">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
          </svg>
        </span>
        <div className="text-[16px] leading-[1.5] text-steel">
          {s.text}{" "}
          <Link href={`/${locale}`} className="font-bold text-accent no-underline hover:underline">
            {s.link} →
          </Link>
        </div>
      </div>
    </div>
  );
}
