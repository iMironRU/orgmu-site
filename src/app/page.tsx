import Link from "next/link";
import { getAllNews } from "@/lib/content/news";
import { NewsCard } from "@/components/NewsCard";
import { asset } from "@/lib/asset";

export default function HomePage() {
  const latest = getAllNews().slice(0, 6);

  return (
    <>
      {/* Герой */}
      <section className="relative bg-brand text-white" data-a11y-surface="brand">
        <div
          className="a11y-decorative absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url('${asset("/brand/corpus.jpg")}')` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1146px] px-10 py-20 max-[768px]:px-5 max-[768px]:py-12">
          <p className="font-ui font-bold uppercase tracking-[0.08em] text-sky-soft text-[14px] mb-4">
            Минздрав России
          </p>
          <h1 className="font-display font-bold text-[50px] leading-[1.05] max-w-[820px] m-0 max-[768px]:text-[32px]">
            Оренбургский государственный медицинский университет
          </h1>
          <p className="font-ui text-[20px] text-white/85 max-w-[640px] mt-5">
            Более 80 лет готовим врачей и провизоров для здравоохранения России.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/novosti"
              className="font-ui font-bold text-[16px] no-underline px-6 py-3 rounded-[10px] bg-accent text-white hover:bg-[rgb(150,46,3)] transition-colors"
            >
              Новости университета
            </Link>
            <a
              href="#"
              className="font-ui font-bold text-[16px] no-underline px-6 py-3 rounded-[10px] border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              Поступающим
            </a>
          </div>
        </div>
      </section>

      {/* Свежие новости */}
      <section className="mx-auto max-w-[1146px] w-full px-10 py-16 box-border max-[768px]:px-5 max-[768px]:py-10">
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <h2 className="m-0 font-display font-bold text-[33px] text-brand">
            Новости и события
          </h2>
          <Link href="/novosti" className="font-ui font-bold text-[17px] text-accent no-underline">
            Все новости →
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="text-steel font-ui text-[18px]">Новостей пока нет.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
            {latest.map((item) => (
              <NewsCard key={item.source.item_id} item={item} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
