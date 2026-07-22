import Link from "next/link";

// Плашка «переведено машиной». Своей вёрстки тут нет: это блок callout из
// макета PageTemplate.dc.html (иконка акцентным цветом + подложка
// rgba(184,57,4,0.10) + текст 17px), тот же, что «врезка с важной информацией»
// на типовых страницах. Меняется только содержимое и иконка.
//
// Уровни:
//   machine  — обычный автоперевод (английский, общие тексты на казахском);
//   terms    — то же плюс предупреждение о терминах: проверено, что на казахский
//              медицинская лексика переводится с ошибками смысла («иммунный
//              статус» → «мәртебе», то есть ранг/престиж). Для прайса НИЦ,
//              подготовки к анализам и подобного.
export type NoticeLevel = "machine" | "terms";

type Strings = { text: string; terms: string; link: string };

const S: Record<string, Strings> = {
  en: {
    text: "This page was translated automatically and may contain inaccuracies.",
    terms:
      "Medical and academic terms may be rendered incorrectly — check them against the Russian original.",
    link: "Read the Russian original",
  },
  kk: {
    // ВНИМАНИЕ: казахский текст плашки должен быть вычитан человеком — это
    // сообщение о доверии к переводу, и оно само обязано быть безупречным.
    text: "Бұл бет автоматты түрде аударылған, дәлсіздіктер болуы мүмкін.",
    terms:
      "Медициналық және академиялық терминдер қате аударылуы мүмкін — орыс тіліндегі түпнұсқамен салыстырыңыз.",
    link: "Орыс тіліндегі түпнұсқаны оқу",
  },
};

export function TranslationNotice({
  lang,
  level = "machine",
  originalHref,
}: {
  lang: string;
  level?: NoticeLevel;
  originalHref: string;
}) {
  const s = S[lang];
  if (!s) return null; // на русском плашки нет — это оригинал

  return (
    <div className="flex gap-[14px] px-5 py-[18px] bg-[rgba(184,57,4,0.10)] rounded-[10px]">
      <span className="shrink-0 text-accent flex">
        {/* Глобус-переводчик вместо «i»: смысл плашки — язык, а не примечание. */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
        </svg>
      </span>
      <div className="text-[17px] text-steel">
        {s.text}
        {level === "terms" && <> {s.terms}</>}{" "}
        <Link href={originalHref} className="font-bold text-accent no-underline hover:underline">
          {s.link} →
        </Link>
      </div>
    </div>
  );
}
