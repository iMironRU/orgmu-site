import type { Metadata } from "next";
import Link from "next/link";
import { getAllNews } from "@/lib/content/news";
import { toCardItem } from "@/lib/content/news-types";
import { NewsListView } from "@/components/NewsListView";

import { alternates } from "@/lib/i18n/alternates";

export const metadata: Metadata = {
  alternates: alternates("/novosti"),
  title: "Новости и события",
  description: "Новости и события Оренбургского государственного медицинского университета.",
};

export default function NewsListPage() {
  // Срез для карточек: без body_html и галереи — списку они не нужны,
  // а в разметку уезжал полный текст всех статей.
  const news = getAllNews().map(toCardItem);

  return (
    <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 max-[768px]:pt-6">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-[15px] text-ink-3 mb-5 flex-wrap font-ui">
        <Link href="/" className="text-accent no-underline">
          Главная
        </Link>
        <span>/</span>
        <span className="text-ink-2">Новости</span>
      </div>

      <h1 className="m-0 mb-6 font-display font-bold text-[40px] text-brand max-[768px]:text-[30px]">
        Новости и события
      </h1>

      {news.length === 0 ? (
        <p className="text-steel font-ui text-[18px]">Новостей пока нет.</p>
      ) : (
        <NewsListView items={news} />
      )}
    </main>
  );
}
