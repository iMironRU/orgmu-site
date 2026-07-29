import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { notFound } from "next/navigation";
import { getEvent, getEvents } from "@/lib/content/events";
import { categoryColor, eventDateLong, eventWeekday } from "@/lib/content/events-types";
import { Form } from "@/components/Form";

// Отдельная страница регистрации на мероприятие. Форма не висит открытой на
// карточке — там кнопка «Зарегистрироваться», ведущая сюда. Так у регистрации
// своя ссылка (для афиши, рассылки), форма во всю ширину, а успех — чистое
// подтверждение. Мировой стандарт для форм из нескольких полей.
//
// Страница создаётся только для мероприятий с настроенной формой (register).

export const dynamicParams = false;

export function generateStaticParams() {
  return getEvents()
    .filter((e) => e.register)
    .map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = getEvent(slug);
  return e ? { title: `Регистрация — ${e.title}` } : {};
}

const SummaryRow = ({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
}) => (
  <div className="flex gap-3 items-start">
    <span className="shrink-0 text-accent mt-0.5">{icon}</span>
    <div>
      <div className="font-bold text-[16px] text-brand leading-[1.3]">{title}</div>
      {sub && <div className="text-[15px] text-steel">{sub}</div>}
    </div>
  </div>
);

export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e || !e.register) notFound();

  const dateSub = [eventWeekday(e.date), e.time].filter(Boolean).join(", ");
  const eventUrl = `/meropriyatiya/${e.slug}`;

  return (
    <main className="flex-1">
      {/* Синяя шапка */}
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/meropriyatiya" className="text-white/90 no-underline">Мероприятия</Link>
            <span>/</span>
            <Link href={eventUrl} className="text-white/90 no-underline line-clamp-1 max-w-[280px]">{e.title}</Link>
            <span>/</span>
            <span>Регистрация</span>
          </div>
          <span
            className="inline-block font-ui font-bold text-[13px] tracking-[0.06em] uppercase text-white rounded-md px-3 py-[5px] mb-3"
            style={{ background: categoryColor(e.category) }}
          >
            {e.category}
          </span>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            Регистрация на мероприятие
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[18px] text-white/85">{e.title}</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[1fr_320px] gap-10 items-start max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        {/* Форма */}
        <div className="min-w-0">
          <div className="bg-white border border-line rounded-xl p-6 max-[768px]:p-5">
            <Form config={e.register} />
          </div>
        </div>

        {/* Сводка мероприятия — что, когда, где */}
        <aside className="min-w-0">
          <div className="sticky top-6 flex flex-col gap-4">
            <div className="bg-bg-muted border border-line rounded-xl p-5 flex flex-col gap-4">
              <div className="font-display font-bold text-[17px] text-brand">Вы регистрируетесь на</div>
              <SummaryRow
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>}
                title={eventDateLong(e.date)}
                sub={dateSub}
              />
              <SummaryRow
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>}
                title={e.place}
                sub={e.address}
              />
              {e.entry && (
                <SummaryRow
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>}
                  title={e.entry}
                />
              )}
            </div>
            <Link href={eventUrl} className="text-center font-bold text-[16px] text-accent no-underline">
              ← К странице мероприятия
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
