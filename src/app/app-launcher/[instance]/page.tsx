import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstance, getInstanceIds } from "@/lib/content/instances";

// Страница инстанса 1С (buh.app.orgma.ru и др.). Страница САЙТА: тот же
// layout, шапка, подвал и панель. Раскладывается в корень своего хоста.
// Данные — content/apps/instances.json.

export const dynamicParams = false;

export function generateStaticParams() {
  return getInstanceIds().map((instance) => ({ instance }));
}

export async function generateMetadata({ params }: { params: Promise<{ instance: string }> }): Promise<Metadata> {
  const { instance } = await params;
  const i = getInstance(instance);
  return i ? { title: `${i.name} · ${i.host}`, robots: { index: false } } : {};
}

export default async function InstancePage({ params }: { params: Promise<{ instance: string }> }) {
  const { instance } = await params;
  const i = getInstance(instance);
  if (!i) notFound();

  const tools = [
    { label: "Клиент 1С · x86", href: i.install.x86 },
    { label: "Клиент 1С · x64", href: i.install.x64 },
    { label: `Список баз для клиента (v ${i.version})`, href: i.install.v8i },
  ].filter((t) => t.href);

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <a href="https://app.orgma.ru" className="text-white/90 no-underline">Платформа приложений</a>
            <span>/</span>
            <span>{i.name}</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            {i.name}
          </h1>
          <p className="m-0 max-w-[680px] font-ui text-[18px] text-white/85">
            {i.host} · Выберите информационную базу. Для входа нужна учётная запись.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 font-ui">
        <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">
          Информационные базы
          <span className="ml-3 font-ui text-[14px] font-bold text-ink-3 bg-[rgb(240,243,246)] rounded-full px-[11px] py-[3px] align-middle">
            {i.bases.length}
          </span>
        </h2>

        <div className="flex flex-col gap-2">
          {i.bases.map((b) => (
            <a
              key={b.href}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white border border-line rounded-[10px] px-[18px] py-[14px] no-underline shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-accent hover:shadow-[0_6px_16px_rgba(0,0,0,0.09)] transition-[border-color,box-shadow] flex-wrap"
            >
              <span className="flex-1 min-w-[180px] font-bold text-[17px] text-brand">{b.name}</span>
              {b.code && <span className="shrink-0 text-[13px] text-ink-3 tabular-nums">{b.code}</span>}
              <span className="shrink-0 text-accent font-bold text-[14px]">Открыть →</span>
            </a>
          ))}
        </div>

        {tools.length > 0 && (
          <>
            <h2 className="m-0 mt-8 mb-4 font-display font-bold text-[24px] text-brand">Клиент 1С</h2>
            <div className="flex gap-2 flex-wrap">
              {tools.map((t) => (
                <a
                  key={t.label}
                  href={t.href}
                  className="font-bold text-[14px] text-steel bg-white border border-line-strong rounded-lg px-[14px] py-[9px] no-underline hover:border-accent hover:text-accent transition-colors"
                >
                  {t.label}
                </a>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
