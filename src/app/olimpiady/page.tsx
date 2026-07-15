import type { Metadata } from "next";
import Link from "next/link";
import { getPages } from "@/lib/content/pages";

export const metadata: Metadata = {
  title: "Олимпиады для школьников и студентов колледжей",
  description:
    "Олимпиады и творческие конкурсы Оренбургского медицинского университета для школьников и студентов колледжей: положения, сроки, документы.",
};

export default function OlympiadsPage() {
  const pages = getPages("olimpiady");

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <span>Олимпиады</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            Олимпиады для школьников и студентов колледжей
          </h1>
          <p className="m-0 max-w-[680px] font-ui text-[18px] text-white/85">
            Победителям и призёрам начисляются дополнительные баллы за индивидуальные достижения
            при поступлении в ОрГМУ. Участие бесплатное.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 font-ui">
        {pages.length === 0 ? (
          <p className="text-steel text-[18px]">Олимпиад пока нет.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pages.map((p) => (
              <Link
                key={p.slug}
                href={`/olimpiady/${p.slug}`}
                className="flex items-center gap-5 bg-white border border-line rounded-xl border-l-4 border-l-brand px-6 py-[22px] no-underline shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-shadow"
              >
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-bold text-[21px] text-brand leading-[1.2]">
                    {p.title}
                  </span>
                  {p.lead && (
                    <span className="block text-[16px] text-steel mt-[6px] line-clamp-2">{p.lead}</span>
                  )}
                </span>
                <span className="shrink-0 text-gray-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-3 px-[18px] py-4 bg-[rgba(48,176,199,0.08)] rounded-[10px]">
          <span className="shrink-0 text-teal flex">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></svg>
          </span>
          <div className="text-[15px] leading-[1.5] text-steel">
            Архив олимпиады «Мой выбор — медицина» (2020–2021) доступен файлом на сайте университета:{" "}
            <a
              href="https://www.orgma.ru/files//abituriyentu/PR_DO/olympiads/moj_vybor_medicina/archive/Мой выбор - медицина 2020 - 2021.pdf"
              className="text-accent font-bold no-underline hover:underline"
            >
              Мой выбор — медицина 2020–2021 (PDF)
            </a>
            .
          </div>
        </div>
      </main>
    </>
  );
}
