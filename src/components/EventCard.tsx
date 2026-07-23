import { Link } from "@/components/Link";
import { asset } from "@/lib/asset";
import type { EventItem } from "@/lib/content/events-types";
import { categoryColor, eventDay, eventMonth } from "@/lib/content/events-types";

// Карточка мероприятия по макету EventCard.dc.html: обложка с датой-плашкой и
// категорией, заголовок, время и место. Вся карточка — ссылка на детали.
export function EventCard({ e }: { e: EventItem }) {
  const bg = e.image ? (e.image.startsWith("http") ? e.image : asset(e.image)) : undefined;
  return (
    <Link
      href={`/meropriyatiya/${e.slug}`}
      className="flex flex-col h-full box-border no-underline bg-white border border-line rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-[box-shadow,transform] duration-200 hover:shadow-[0_10px_24px_rgba(0,0,0,0.13)] hover:-translate-y-[2px]"
    >
      <div
        className="relative w-full aspect-[3/2] bg-brand bg-cover bg-center"
        style={bg ? { backgroundImage: `url('${bg}')` } : undefined}
      >
        <div className="absolute top-[14px] left-[14px] flex flex-col items-center justify-center w-[60px] h-[64px] rounded-[10px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
          <span className="font-display font-bold text-[26px] leading-none text-brand">{eventDay(e.date)}</span>
          <span className="font-ui font-bold text-[13px] tracking-[0.06em] uppercase text-accent">{eventMonth(e.date)}</span>
        </div>
        <span
          className="absolute top-[16px] right-[14px] font-ui font-bold text-[12px] tracking-[0.05em] uppercase text-white rounded-md px-[10px] py-[5px]"
          style={{ background: categoryColor(e.category) }}
        >
          {e.category}
        </span>
      </div>
      <div className="flex flex-col gap-[10px] px-[18px] pt-4 pb-[18px] flex-1">
        <span className="font-ui font-bold text-[20px] leading-[1.15] text-brand text-pretty">{e.title}</span>
        <div className="flex flex-col gap-[6px] mt-auto">
          <span className="flex items-center gap-2 text-[16px] text-steel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(137,191,234)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>
            {e.time}
          </span>
          <span className="flex items-center gap-2 text-[16px] text-steel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(137,191,234)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            {e.place}
          </span>
        </div>
      </div>
    </Link>
  );
}
