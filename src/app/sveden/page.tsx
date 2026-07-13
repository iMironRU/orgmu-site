import type { Metadata } from "next";
import Link from "next/link";
import { listSectionKeys } from "@/lib/sveden/vocab";
import { SECTION_SHORT } from "@/lib/sveden/labels";

export const metadata: Metadata = {
  title: "Сведения об образовательной организации",
  description:
    "Специальный раздел «Сведения об образовательной организации» по приказу Рособрнадзора № 1493 и ст. 29 Федерального закона № 273-ФЗ.",
};

export default function SvedenHubPage() {
  const keys = listSectionKeys();

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui">
            <Link href="/" className="text-white/90 no-underline">
              Главная
            </Link>
            <span>/</span>
            <span>Сведения об образовательной организации</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.1] max-[768px]:text-[28px]">
            Сведения об образовательной организации
          </h1>
          <p className="m-0 max-w-[760px] font-ui text-[18px] text-white/85">
            Специальный раздел по приказу Рособрнадзора № 1493 и ст. 29
            Федерального закона № 273-ФЗ. Состав сведений фиксирован; данные
            продублированы в машиночитаемом виде для автоматического сбора
            мониторингом.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-12 pb-16 box-border max-[768px]:px-5">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {keys.map((key, i) => (
            <Link
              key={key}
              href={`/sveden/${key}`}
              className="group flex items-start gap-4 bg-white border border-line rounded-xl p-5 no-underline transition-[border-color,box-shadow] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
            >
              <span className="shrink-0 w-9 h-9 rounded-lg bg-sky-soft/25 text-brand font-display font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="font-ui font-bold text-[17px] leading-[1.25] text-brand group-hover:text-accent">
                {SECTION_SHORT[key] ?? key}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
