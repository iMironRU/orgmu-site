import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstance, getInstanceIds, getSetup, appNavItems, instanceHref } from "@/lib/content/instances";
import { PageNav } from "@/components/PageNav";
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
  const setup = getSetup();

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

      <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[250px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6">
            <PageNav title="Приложения" items={appNavItems()} current={instanceHref(instance)} />
          </div>
        </aside>

        <main className="min-w-0">
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

        {/* Настройка рабочего места: раньше здесь висели три голые кнопки —
            что с ними делать, было непонятно. Теперь шаги, а кнопки внутри
            того шага, к которому относятся. Текст — в instances.json. */}
        <section className="mt-10">
          <h2 className="m-0 mb-2 font-display font-bold text-[24px] text-brand">{setup.title}</h2>
          <p className="m-0 mb-5 text-[17px] text-steel max-w-[720px]">{setup.lead}</p>

          <ol className="m-0 p-0 list-none flex flex-col gap-3">
            {setup.steps.map((st, n) => (
              <li key={n} className="flex gap-4 bg-white border border-line rounded-xl p-5">
                <span className="shrink-0 w-8 h-8 rounded-full bg-brand text-white font-display font-bold text-[15px] flex items-center justify-center">
                  {n + 1}
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <span className="font-bold text-[17px] text-brand">{st.title}</span>
                  <span className="text-[15px] leading-[1.5] text-steel">{st.text}</span>

                  {st.action === "client" && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      {i.install.x86 && (
                        <a href={i.install.x86} className="font-bold text-[14px] text-steel bg-bg-muted border border-line-strong rounded-lg px-[14px] py-[9px] no-underline hover:border-accent hover:text-accent transition-colors">
                          Клиент 1С · x86
                        </a>
                      )}
                      {i.install.x64 && (
                        <a href={i.install.x64} className="font-bold text-[14px] text-steel bg-bg-muted border border-line-strong rounded-lg px-[14px] py-[9px] no-underline hover:border-accent hover:text-accent transition-colors">
                          Клиент 1С · x64
                        </a>
                      )}
                      <span className="self-center text-[13px] text-ink-3">версия платформы {i.version}</span>
                    </div>
                  )}

                  {st.action === "v8i" && i.install.v8i && (
                    <div className="mt-1">
                      <a href={i.install.v8i} className="inline-block font-bold text-[14px] text-white bg-accent rounded-lg px-[14px] py-[9px] no-underline hover:bg-[rgb(150,46,3)] transition-colors">
                        Скачать список баз (ibases.v8i)
                      </a>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {setup.note && (
            <div className="flex gap-3 mt-4 px-[18px] py-4 bg-bg-muted border border-dashed border-line-strong rounded-[10px]">
              <span className="shrink-0 text-teal flex">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" />
                </svg>
              </span>
              <div className="text-[14px] leading-[1.5] text-ink-2">{setup.note}</div>
            </div>
          )}
        </section>

        </main>
      </div>
    </>
  );
}
