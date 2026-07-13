import type { Metadata } from "next";
import Link from "next/link";
import { getSubsites, getSitemapGroups } from "@/lib/content/navigation";
import { SitemapView } from "@/components/SitemapView";

export const metadata: Metadata = {
  title: "Карта сайтов",
  description:
    "Все разделы флагманского сайта и подсайты Оренбургского медицинского университета в одном месте.",
};

export default function SitemapPage() {
  const subsites = getSubsites();
  const groups = getSitemapGroups();

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui">
            <Link href="/" className="text-white/90 no-underline">
              Главная
            </Link>
            <span>/</span>
            <span>Карта сайтов</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[30px]">
            Карта сайтов
          </h1>
          <p className="m-0 max-w-[640px] font-ui text-[18px] text-white/85">
            Все разделы флагманского сайта и подсайты университета в одном месте.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-12 pb-16 box-border max-[768px]:px-5">
        <SitemapView subsites={subsites} groups={groups} />
      </main>
    </>
  );
}
