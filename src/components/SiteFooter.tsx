import Link from "next/link";

const COL_A = [
  { label: "Контакты", href: "#" },
  { label: "Часто задаваемые вопросы", href: "#" },
  { label: "Обратная связь", href: "#" },
  { label: "Реквизиты для перечисления", href: "#" },
];

const COL_B = [
  { label: "Противодействие коррупции", href: "#" },
  { label: "Сведения о доходах", href: "#" },
  { label: "Антитеррористическая безопасность", href: "#" },
  { label: "Политика обработки ПДн", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="bg-brand text-white font-ui">
      <div className="ft-top mx-auto max-w-[1146px] px-6 py-12 grid grid-cols-[1.4fr_1fr_1fr] gap-10 max-[640px]:grid-cols-1 max-[640px]:gap-7">
        <div className="flex flex-col gap-4">
          <span className="font-bold text-[20px] leading-[1.2]">
            Оренбургский государственный
            <br />
            медицинский университет
          </span>
          <span className="font-normal text-[16px] leading-[1.5] text-white/85">
            Россия, 460000, г. Оренбург,
            <br />
            ул. Советская, 6
          </span>
          <a
            href="#"
            className="inline-flex items-center gap-[7px] self-start font-bold text-[15px] text-white no-underline px-[14px] py-2 border border-white/30 rounded-[9px] hover:bg-white/10"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Схема проезда
          </a>
          <span className="font-normal text-[16px] leading-[1.5] text-white/85">
            Тел. +7 (3532) 50-06-20
            <br />
            Приёмная комиссия: +7 (3532) 50-06-03
            <br />
            E-mail: office@orgma.ru
          </span>
        </div>

        <nav className="flex flex-col gap-3">
          {COL_A.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="font-normal text-[16px] text-white/90 no-underline transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <nav className="flex flex-col gap-3">
          {COL_B.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="font-normal text-[16px] text-white/90 no-underline transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/20">
        <div className="ft-bottom mx-auto max-w-[1146px] px-6 py-[18px] flex flex-wrap gap-4 justify-between items-center max-[640px]:flex-col max-[640px]:items-start">
          <span className="font-normal text-[13px] leading-[1.5] text-white/65 max-w-[760px]">
            © {new Date().getFullYear()} ФГБОУ ВО «Оренбургский государственный
            медицинский университет» Минздрава России. Все права защищены.
          </span>
          <span className="font-normal text-[13px] text-white/65">
            Техподдержка: www@orgma.ru
          </span>
        </div>
      </div>
    </footer>
  );
}
