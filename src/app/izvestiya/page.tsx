import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { getActiveNotices } from "@/lib/content/notices";
import { NoticesView } from "@/components/NoticesView";

export const metadata: Metadata = {
  title: "Известия",
  description:
    "Срочные уведомления администрации Оренбургского медицинского университета: приём, расписание, объявления.",
};

// Витрина по структуре News.dc.html: крошки + заголовок + чипы/сетка/пагинация.
export default function NoticesPage() {
  const notices = getActiveNotices();

  return (
    <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 max-[768px]:pt-6">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-[15px] text-ink-3 mb-5 flex-wrap font-ui">
        <Link href="/" className="text-accent no-underline">
          Главная
        </Link>
        <span>/</span>
        <span className="text-ink-2">Известия</span>
      </div>

      <h1 className="m-0 mb-6 font-display font-bold text-[40px] text-brand max-[768px]:text-[30px]">
        Известия
      </h1>

      {notices.length === 0 ? (
        <p className="text-steel font-ui text-[18px]">Действующих известий нет.</p>
      ) : (
        <NoticesView items={notices} />
      )}
    </main>
  );
}
