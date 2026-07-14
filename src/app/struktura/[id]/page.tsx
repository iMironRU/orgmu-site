import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUnits, getUnit, getChildren, typeMeta, initials, avatarColor } from "@/lib/content/structure";

export const dynamicParams = false;

export function generateStaticParams() {
  return getUnits().map((u) => ({ id: u.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const u = getUnit(id);
  return u ? { title: u.name } : {};
}

function Contact({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex gap-5 px-[22px] py-[15px] border-b border-line last:border-0 flex-wrap">
      <div className="flex-[0_0_200px] max-w-full text-[15px] text-ink-2">{label}</div>
      <div className="flex-1 min-w-[180px] text-[16px] font-medium text-ink">{children}</div>
    </div>
  );
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const u = getUnit(id);
  if (!u) notFound();

  const m = typeMeta(u.type);
  const children = getChildren(id);
  const hasHead = !!u.head.fio && u.head.fio !== "—";
  const docHref = u.doc
    ? u.doc.href.startsWith("http")
      ? u.doc.href
      : `https://www.orgma.ru${u.doc.href}`
    : null;

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/struktura" className="text-white/90 no-underline">Структура</Link>
            <span>/</span>
            <span>{m.label}</span>
          </div>
          <span
            className="inline-block text-[12px] font-bold tracking-[0.04em] uppercase rounded-[5px] px-[10px] py-[3px] mb-3"
            style={{ color: "#fff", background: "rgba(255,255,255,0.18)" }}
          >
            {m.label}
          </span>
          <h1 className="m-0 font-display font-bold text-[32px] leading-[1.12] max-[768px]:text-[24px]">
            {u.name}
          </h1>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-10 pb-16 box-border max-[768px]:px-5 flex flex-col gap-8">
        {hasHead && (
          <section>
            <h2 className="m-0 mb-4 font-display font-bold text-[22px] text-brand">Руководитель</h2>
            <div className="flex items-center gap-4 bg-white border border-line rounded-xl px-6 py-5">
              <span
                className="shrink-0 w-14 h-14 rounded-full text-white font-display font-bold text-[18px] flex items-center justify-center"
                style={{ background: avatarColor(u.head.fio) }}
              >
                {initials(u.head.fio)}
              </span>
              <div>
                <div className="font-bold text-[20px] text-brand">{u.head.fio}</div>
                {u.head.post && <div className="text-[16px] text-steel">{u.head.post}</div>}
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="m-0 mb-4 font-display font-bold text-[22px] text-brand">Контакты</h2>
          <div className="bg-white border border-line rounded-xl overflow-hidden font-ui">
            <Contact label="Место нахождения">{u.address}</Contact>
            <Contact label="Телефон">{u.phone}</Contact>
            <Contact label="Электронная почта">
              {u.email && (
                <a href={`mailto:${u.email}`} className="text-accent underline">
                  {u.email}
                </a>
              )}
            </Contact>
            <Contact label="Сайт">{u.site}</Contact>
            <Contact label="Положение о подразделении">
              {docHref && (
                <a href={docHref} className="text-accent underline">
                  {u.doc?.text || "Положение о подразделении"}
                </a>
              )}
            </Contact>
          </div>
        </section>

        {children.length > 0 && (
          <section>
            <h2 className="m-0 mb-4 font-display font-bold text-[22px] text-brand">
              В составе подразделения
              <span className="text-ink-3 font-normal text-[16px]"> · {children.length}</span>
            </h2>
            <div className="flex flex-col gap-2">
              {children.map((c) => {
                const cm = typeMeta(c.type);
                return (
                  <Link
                    key={c.id}
                    href={`/struktura/${c.id}`}
                    className="flex items-center gap-3 bg-white border border-line rounded-[10px] px-[18px] py-[13px] no-underline hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                    style={{ borderLeft: `4px solid ${cm.color}` }}
                  >
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.04em] rounded-[5px] px-2 py-[2px]"
                      style={{ color: cm.color, background: cm.soft }}
                    >
                      {cm.label}
                    </span>
                    <span className="font-bold text-[16px] text-brand">{c.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
