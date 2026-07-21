import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllNoticeIds, getNotice } from "@/lib/content/notices";
import { noticeKindMeta, noticeUntilLong } from "@/lib/content/notices-types";
import { NewsGallery } from "@/components/NewsGallery";
import { asset } from "@/lib/asset";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllNoticeIds().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = getNotice(slug);
  return n ? { title: n.title } : {};
}

export default async function NoticePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const n = getNotice(slug);
  if (!n) notFound();

  const k = noticeKindMeta(n.kind);
  const meta = [n.issuedBy, n.until ? `действует до ${noticeUntilLong(n.until)}` : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="flex-1 font-ui">
      {/* Герой сплошного цвета по виду известия (без фото — отличается от новостей) */}
      <div style={{ background: k.accent }} className="text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[900px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/75 mb-4 flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/izvestiya" className="text-white/90 no-underline">Известия</Link>
            <span>/</span>
            <span>{n.title}</span>
          </div>
          <span className="inline-flex items-center gap-2 font-bold text-[13px] tracking-[0.06em] uppercase text-white bg-white/20 rounded-md px-3 py-[6px] mb-[14px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17.5v.01" /></svg>
            {k.tag}
          </span>
          <h1 className="m-0 mb-[14px] font-display font-bold text-[36px] leading-[1.12] text-white text-balance max-[768px]:text-[26px]">
            {n.title}
          </h1>
          {meta && (
            <div className="flex items-center gap-2 text-[16px] text-white/90">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>
              {meta}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[900px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5">
        {n.gallery && n.gallery.length > 0 && (
          <NewsGallery images={n.gallery.map(asset)} contain />
        )}

        <div className="bg-white border border-line rounded-[14px] px-[30px] py-7 flex flex-col gap-4">
          <div className="text-[19px] leading-[1.7] text-ink flex flex-col gap-4">
            {n.body.length > 0 ? (
              n.body.map((p, i) => <p key={i} className="m-0">{p}</p>)
            ) : (
              <p className="m-0 text-ink-3">Текст известия не заполнен.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-[10px] mt-6 px-[18px] py-4 bg-[rgb(240,246,250)] border border-[rgb(214,230,240)] rounded-[10px] text-[14.5px] leading-[1.5] text-steel">
          <span className="shrink-0 text-brand">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></svg>
          </span>
          Известие — короткое срочное уведомление администрации, действует ограниченный срок. Это не
          редакционная новость: подробный разбор события, если потребуется, появится в разделе «Новости».
        </div>

        <Link href="/izvestiya" className="inline-block mt-[22px] font-bold text-[16px] text-accent no-underline">
          ← Все известия
        </Link>
      </div>
    </main>
  );
}
