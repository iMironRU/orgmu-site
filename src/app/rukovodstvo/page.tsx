import type { Metadata } from "next";
import Link from "next/link";
import { getLeaders } from "@/lib/content/persons";
import { PersonTile } from "@/components/PersonTile";

export const metadata: Metadata = {
  title: "Руководство образовательной организации",
  description:
    "Руководство Оренбургского государственного медицинского университета: ректор и проректоры с должностями и контактами.",
};

export default function LeadershipPage() {
  const leaders = getLeaders();
  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/sveden" className="text-white/90 no-underline">Сведения об организации</Link>
            <span>/</span>
            <span>Руководство</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            Руководство
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            Ректор и проректоры образовательной организации с должностями и
            контактами.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5">
        {leaders.length === 0 ? (
          <p className="text-steel font-ui text-[18px]">Данные о руководстве уточняются.</p>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {leaders.map((p) => (
              <PersonTile key={p.id} person={p} mode="lead" />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
