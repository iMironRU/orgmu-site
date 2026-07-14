import type { Metadata } from "next";
import Link from "next/link";
import { getTeachers } from "@/lib/content/persons";
import { StaffDirectory } from "@/components/StaffDirectory";

export const metadata: Metadata = {
  title: "Педагогический (научно-педагогический) состав",
  description:
    "Персональный состав педагогических работников ОрГМУ: должности, преподаваемые дисциплины, учёные степени и звания, квалификация.",
};

export default function StaffDirectoryPage() {
  const people = getTeachers();
  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/sveden" className="text-white/90 no-underline">Сведения об организации</Link>
            <span>/</span>
            <span>Педагогический состав</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            Педагогический состав
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            Персональный состав педагогических (научно-педагогических) работников
            с данными о квалификации, стаже и преподаваемых дисциплинах.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-7 pb-16 box-border max-[768px]:px-5">
        <StaffDirectory people={people} />
      </main>
    </>
  );
}
