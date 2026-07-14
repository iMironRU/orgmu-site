import type { Metadata } from "next";
import Link from "next/link";
import { getActiveNotices } from "@/lib/content/notices";
import { noticeKindMeta, noticeUntilLong } from "@/lib/content/notices-types";

export const metadata: Metadata = {
  title: "Известия",
  description:
    "Срочные уведомления администрации Оренбургского медицинского университета: приём, расписание, объявления.",
};

export default function NoticesPage() {
  const notices = getActiveNotices();

  return (
    <>
      {/* Шапка-герой */}
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[900px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <span>Известия</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            Известия
          </h1>
          <p className="m-0 max-w-[640px] font-ui text-[18px] text-white/85">
            Короткие срочные уведомления администрации. Действуют ограниченный срок.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[900px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 font-ui">
        {notices.length === 0 ? (
          <p className="text-steel text-[18px]">Активных известий нет.</p>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {notices.map((n) => {
              const k = noticeKindMeta(n.kind);
              return (
                <Link
                  key={n.id}
                  href={`/izvestiya/${n.id}`}
                  className="flex items-center gap-4 px-[18px] py-[15px] rounded-[10px] no-underline max-[680px]:flex-wrap hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-shadow"
                  style={{ background: k.bg, borderLeft: `5px solid ${k.accent}` }}
                >
                  <span className="shrink-0 font-bold text-[13px] tracking-[0.05em] uppercase" style={{ color: k.accent }}>
                    {k.tag}
                  </span>
                  <div className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-bold text-[17px] text-accent text-pretty">{n.title} →</span>
                    {n.text && <span className="text-[15px] text-ink-2">{n.text}</span>}
                  </div>
                  {n.until && (
                    <span className="shrink-0 flex items-center gap-[6px] text-[14px] font-bold" style={{ color: k.accent }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>
                      до {noticeUntilLong(n.until)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
