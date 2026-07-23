import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { splitEvents } from "@/lib/content/events";
import { EventsView } from "@/components/EventsView";

export const metadata: Metadata = {
  title: "Афиша мероприятий",
  description:
    "Конференции, дни открытых дверей, лекции, концерты и спортивные события Оренбургского медицинского университета.",
};

export default function EventsPage() {
  const { upcoming, past } = splitEvents();

  return (
    <>
      {/* Шапка-герой */}
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <span>Мероприятия</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            Афиша мероприятий
          </h1>
          <p className="m-0 max-w-[640px] font-ui text-[18px] text-white/85">
            Конференции, дни открытых дверей, лекции, концерты и спортивные события университета.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5">
        {upcoming.length === 0 && past.length === 0 ? (
          <p className="text-steel font-ui text-[18px]">Мероприятий пока нет.</p>
        ) : (
          <EventsView upcoming={upcoming} past={past} />
        )}
      </main>
    </>
  );
}
