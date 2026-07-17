import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstance, getInstanceIds } from "@/lib/content/instances";
import { getApps } from "@/lib/content/navigation";
import { Icon } from "@/components/icons";

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

  // Иконка и акцент — те же, что у этого инстанса на лаунчере: карточка
  // приложения и его базы должны читаться как одно целое.
  const app = getApps().find((a) => a.tag === i.host);
  const accent = app?.accent ?? "rgb(0,101,155)";
  const icon = app?.icon ?? "grid";

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

        {/* Плитка — как на лаунчере: между платформой и инстансом не должно
            быть разрыва в стилистике. */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {i.bases.map((b) => (
            <div
              key={b.href}
              className="flex flex-col gap-3 bg-white border border-line rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: accent }}>
                  <Icon name={icon} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-bold text-[18px] text-brand leading-[1.2]">{b.name}</span>
                  {b.code && <span className="block text-[13px] text-ink-3 mt-[2px] tabular-nums">{b.code}</span>}
                </span>
              </div>
              {b.desc ? (
                <p className="m-0 text-[15px] leading-[1.45] text-steel flex-1">{b.desc}</p>
              ) : (
                <p className="m-0 text-[15px] leading-[1.45] text-ink-3 flex-1">Описание не заполнено.</p>
              )}
              <a
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center font-ui font-bold text-[15px] text-white bg-accent rounded-[10px] py-[11px] no-underline hover:bg-[rgb(150,46,3)] transition-colors"
              >
                Открыть базу
              </a>
            </div>
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
