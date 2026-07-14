import type { Metadata } from "next";
import Link from "next/link";
import { getUnits } from "@/lib/content/structure";
import { getPersonIdByFio } from "@/lib/content/persons";
import { StructureView } from "@/components/StructureView";

export const metadata: Metadata = {
  title: "Структура и органы управления",
  description:
    "Структура и органы управления Оренбургского государственного медицинского университета: факультеты, кафедры, институты, управления и отделы с руководителями и контактами.",
};

export default function StructurePage() {
  const units = getUnits().map((u) => ({
    ...u,
    headPersonId: u.head.fio ? getPersonIdByFio(u.head.fio) : undefined,
  }));

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">
              Главная
            </Link>
            <span>/</span>
            <Link href="/sveden" className="text-white/90 no-underline">
              Сведения об организации
            </Link>
            <span>/</span>
            <span>Структура и органы управления</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            Структура и органы управления
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            Подразделения университета с руководителями, адресами и положениями.
            Отступ показывает подчинённость.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-7 pb-16 box-border max-[768px]:px-5">
        <StructureView units={units} />
      </main>
    </>
  );
}
