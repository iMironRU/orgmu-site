import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asset } from "@/lib/asset";
import { getAllEventSlugs, getEvent } from "@/lib/content/events";
import { categoryColor, eventDateLong, eventWeekday } from "@/lib/content/events-types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllEventSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = getEvent(slug);
  return e ? { title: e.title } : {};
}

const InfoRow = ({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
}) => (
  <div className="flex gap-[14px] items-start">
    <span className="shrink-0 text-accent">{icon}</span>
    <div>
      <div className="font-bold text-[18px] text-brand">{title}</div>
      {sub && <div className="text-[16px] text-steel">{sub}</div>}
    </div>
  </div>
);

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e) notFound();

  const bg = e.image ? (e.image.startsWith("http") ? e.image : asset(e.image)) : asset("/brand/corpus.jpg");
  const weekday = eventWeekday(e.date);
  const dateSub = [weekday, e.time].filter(Boolean).join(", ");

  return (
    <main className="flex-1">
      {/* Постер-герой */}
      <div
        className="relative h-[440px] bg-cover bg-center max-[768px]:h-[320px]"
        style={{ backgroundImage: `url('${bg}')` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,79,122,0.35)_0%,rgba(0,79,122,0.55)_60%,rgba(0,79,122,0.92)_100%)]" />
        <div className="relative mx-auto max-w-[1146px] h-full px-10 py-8 box-border flex flex-col justify-end gap-4 max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/75 flex-wrap font-ui">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/meropriyatiya" className="text-white/90 no-underline">Мероприятия</Link>
            <span>/</span>
            <span>Афиша</span>
          </div>
          <span
            className="self-start font-ui font-bold text-[13px] tracking-[0.06em] uppercase text-white rounded-md px-3 py-[6px]"
            style={{ background: categoryColor(e.category) }}
          >
            {e.category}
          </span>
          <h1 className="m-0 max-w-[760px] font-display font-bold text-[44px] leading-[1.08] text-white text-balance max-[768px]:text-[30px]">
            {e.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] px-10 py-10 box-border grid grid-cols-[1fr_340px] gap-10 items-start max-[900px]:grid-cols-1 max-[768px]:px-5">
        {/* Описание + программа */}
        <article className="min-w-0 flex flex-col gap-6 font-ui">
          <div className="text-[20px] leading-[1.6] text-ink flex flex-col gap-4">
            {e.lead && <p className="m-0 font-medium text-[22px] text-steel">{e.lead}</p>}
            {e.body.map((p, i) => (
              <p key={i} className="m-0">{p}</p>
            ))}
          </div>

          {e.program.length > 0 && (
            <>
              <h2 className="mt-2 mb-0 font-display font-bold text-[26px] text-brand">Программа</h2>
              <div className="flex flex-col">
                {e.program.map((p, i) => (
                  <div key={i} className="flex gap-5 py-[14px] border-b border-line">
                    <span className="shrink-0 basis-[88px] font-display font-bold text-[18px] text-accent">{p.time}</span>
                    <div>
                      <div className="font-bold text-[18px] text-brand">{p.title}</div>
                      {p.place && <div className="text-[16px] text-steel">{p.place}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>

        {/* Липкая панель: дата/место/вход + регистрация */}
        <aside className="min-w-0">
          <div className="sticky top-6 flex flex-col gap-4 font-ui">
            <div className="bg-white border border-line rounded-[14px] p-6">
              <div className="flex flex-col gap-4">
                <InfoRow
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>}
                  title={eventDateLong(e.date)}
                  sub={dateSub}
                />
                <InfoRow
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>}
                  title={e.place}
                  sub={e.address}
                />
                {e.entry && (
                  <InfoRow
                    icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>}
                    title={e.entry}
                  />
                )}
              </div>
              {e.registerHref && (
                <a
                  href={e.registerHref}
                  className="block text-center mt-5 font-ui font-bold text-[18px] text-white bg-accent rounded-[10px] py-[14px] no-underline hover:bg-[rgb(150,46,3)] transition-colors"
                >
                  Зарегистрироваться
                </a>
              )}
            </div>
            <Link href="/meropriyatiya" className="text-center font-bold text-[16px] text-accent no-underline">
              ← Все мероприятия
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
