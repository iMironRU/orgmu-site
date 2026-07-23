import type { Metadata } from "next";
import { Link } from "@/components/Link";

// Поиск по сайту. Макета нет — страница-заглушка в языке дизайн-системы.
// Поле ввода намеренно НЕ рисуем: работающего поиска нет, а поле, которое
// ничего не ищет, — обман. Вместо него — честное объяснение и живые способы
// найти нужное прямо сейчас.

export const metadata: Metadata = {
  title: "Поиск по сайту",
  description: "Поиск по сайту Оренбургского государственного медицинского университета — раздел в разработке.",
};

const WAYS: { href: string; label: string; note: string }[] = [
  { href: "/karta-saytov", label: "Карта сайта", note: "Все разделы одним списком" },
  { href: "/sveden", label: "Сведения об образовательной организации", note: "Обязательный раздел: документы, образование, руководство" },
  { href: "/struktura", label: "Структура и подразделения", note: "Факультеты, кафедры, управления и отделы" },
  { href: "/persony", label: "Педагогический состав", note: "Преподаватели с фильтрами по должности и степени" },
  { href: "/programmy", label: "Образовательные программы", note: "Каталог с фильтрами по уровню и факультету" },
  { href: "/novosti", label: "Новости", note: "Лента новостей университета" },
];

export default function SearchPage() {
  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[900px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <span>Поиск по сайту</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            Поиск по сайту
          </h1>
          <p className="m-0 max-w-[640px] font-ui text-[18px] text-white/85">
            Раздел в разработке.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[900px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 font-ui">
        <div className="flex gap-[14px] px-5 py-[18px] bg-[rgba(184,57,4,0.10)] rounded-[10px] mb-7">
          <span className="shrink-0 text-accent flex">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 7.5v.01" />
            </svg>
          </span>
          <div className="text-[17px] leading-[1.55] text-steel">
            Поиск по сайту сейчас в разработке. Мы не показываем строку поиска, пока она
            не работает по-настоящему: поле, которое ничего не находит, хуже его отсутствия.
            Пока найти нужное можно через разделы ниже — в каталогах программ, педсостава
            и документов уже есть свои фильтры и поиск.
          </div>
        </div>

        <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Куда посмотреть пока</h2>
        <div className="flex flex-col gap-2">
          {WAYS.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="flex items-center gap-4 bg-white border border-line rounded-xl border-l-4 border-l-brand px-5 py-4 no-underline shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-[18px] text-brand leading-[1.2]">{w.label}</span>
                <span className="block text-[15px] text-steel mt-[2px]">{w.note}</span>
              </span>
              <span className="shrink-0 text-gray-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-7 flex gap-3 px-[18px] py-4 bg-bg-muted border border-dashed border-line-strong rounded-[10px]">
          <span className="shrink-0 text-teal flex">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01M11 12h1v4h1" />
            </svg>
          </span>
          <div className="text-[14px] leading-[1.5] text-ink-2">
            Не нашли нужное — напишите нам через{" "}
            <Link href="/obratnaya-svyaz" className="text-accent font-bold no-underline hover:underline">
              обратную связь
            </Link>
            .
          </div>
        </div>
      </main>
    </>
  );
}
