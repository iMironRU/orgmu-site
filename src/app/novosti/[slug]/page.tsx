import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { notFound } from "next/navigation";
import {
  getNewsBySlug,
  getNewsSlugs,
  getRelatedNews,
  formatDateRu,
  kindStyle,
  newsKind,
} from "@/lib/content/news";
import { NewsGallery } from "@/components/NewsGallery";
import { alternates } from "@/lib/i18n/alternates";
import { ShareButtons } from "@/components/ShareButtons";

export const dynamicParams = false;

export function generateStaticParams() {
  return getNewsSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item) return {};
  return {
    alternates: alternates(`/novosti/${slug}`),
    title: item.title,
    description: item.excerpt || undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item) notFound();

  const k = kindStyle(newsKind(item));
  const related = getRelatedNews(item);
  // Слайдер сверху: обложка + все фото галереи, без дублей.
  const galleryImages = [
    ...(item.cover?.remote ? [item.cover.remote] : []),
    ...item.gallery.map((g) => g.remote),
  ].filter((url, idx, arr) => arr.indexOf(url) === idx);

  return (
    <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 max-[768px]:pt-6">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-[15px] text-ink-3 mb-5 flex-wrap font-ui">
        <Link href="/" className="text-accent no-underline">
          Главная
        </Link>
        <span>/</span>
        <Link href="/novosti" className="text-accent no-underline">
          Новости
        </Link>
        <span>/</span>
        <span className="text-ink-2">{k.label}</span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-10 items-start max-[768px]:grid-cols-1">
        <article className="min-w-0">
          <div className="flex gap-[10px] items-center mb-[14px] flex-wrap">
            <span
              className="text-[13px] font-bold tracking-[0.04em] uppercase text-white rounded-md px-3 py-[5px]"
              style={{ background: "var(--c-accent)" }}
            >
              {k.label}
            </span>
            <span className="text-[15px] text-ink-3">
              {formatDateRu(item.published_at)}
              {item.source.hits ? ` · ${item.source.hits} просмотров` : ""}
            </span>
          </div>

          <h1 className="m-0 mb-5 font-display font-bold text-[38px] leading-[1.12] text-brand text-balance max-[768px]:text-[28px]">
            {item.title}
          </h1>

          <NewsGallery
            images={galleryImages}
            caption={`Фото: ${item.author || "пресс-служба ОрГМУ"}`}
          />

          <div
            className="prose-news"
            dangerouslySetInnerHTML={{ __html: item.body_html }}
          />

          <ShareButtons title={item.title} />

          <div className="mt-6">
            <a
              href={item.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[15px] text-accent no-underline"
            >
              Источник: orgma.ru →
            </a>
          </div>
        </article>

        {/* Aside: читайте также */}
        <aside className="min-w-0 flex flex-col gap-4">
          <div className="font-display font-bold text-[20px] text-brand pb-[10px] border-b-2 border-sky-soft">
            Читайте также
          </div>
          {related.map((r) => (
            <Link
              key={r.source.item_id}
              href={`/novosti/${r.slug}`}
              className="flex gap-3 no-underline"
            >
              <div className="shrink-0 w-[88px] h-16 rounded-lg bg-line overflow-hidden">
                {r.cover?.remote && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.cover.remote}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold tracking-[0.03em] uppercase text-sky-soft">
                  {formatDateRu(r.published_at)}
                </span>
                <span className="font-bold text-[16px] leading-[1.2] text-brand line-clamp-3">
                  {r.title}
                </span>
              </div>
            </Link>
          ))}
          <Link
            href="/novosti"
            className="mt-[6px] font-bold text-[17px] text-accent no-underline"
          >
            Все новости →
          </Link>
        </aside>
      </div>
    </main>
  );
}
