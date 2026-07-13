import type { Metadata } from "next";
import Link from "next/link";
import { getAllNews } from "@/lib/content/news";
import { NewsCard } from "@/components/NewsCard";

export const metadata: Metadata = {
  title: "Новости и события",
  description: "Новости и события Оренбургского государственного медицинского университета.",
};

export default function NewsListPage() {
  const news = getAllNews();

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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {news.map((item) => (
            <NewsCard key={item.source.item_id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
