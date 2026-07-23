import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { notFound } from "next/navigation";
import { getInstance, getInstanceIds, getSetup, appNavItems, instanceHref, registryHref } from "@/lib/content/instances";
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
  const app = getApps().find((a) => a.id === instance || a.tag === i.host);
  const accent = app?.accent ?? "rgb(0,101,155)";
  const icon = app?.icon ?? "grid";
  const setup = getSetup();
  // Клиент 1С ставят не на всяком хосте: у СДО четыре веб-входа, установка и
  // список баз .v8i там бессмысленны — блок настройки просто не показываем.
  const install = i.install ?? {};
  const hasSetup = Boolean(install.x86 || install.x64 || install.v8i);
  const entriesTitle = i.kind === "web" ? "Системы" : "Информационные базы";
  const entryCta = i.kind === "web" ? "Открыть систему" : "Открыть базу";
  const soft = accent.replace("rgb(", "rgba(").replace(")", ",0.12)");

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            {i.kind === "web" ? (
              registryHref().startsWith("http") ? (
                <a href={registryHref()} className="text-white/90 no-underline">Приложения вуза</a>
              ) : (
                <Link href={registryHref()} className="text-white/90 no-underline">Приложения вуза</Link>
              )
            ) : (
              <a href="https://app.orgma.ru" className="text-white/90 no-underline">Платформа приложений</a>
            )}
            <span>/</span>
            <span>{i.name}</span>
          </div>
          {/* Шапка — по макету AppDetail.dc.html: плитка иконки, имя, лид.
              Кнопки «Открыть приложение» тут нет намеренно: на сборке для
              внутренних хостов эта страница И ЕСТЬ хост, кнопка вела бы сама
              на себя. Точки входа — базы ниже, у каждой своя. */}
          <div className="flex items-center gap-6 max-[768px]:gap-4">
            <span className="shrink-0 w-[88px] h-[88px] rounded-[22px] bg-white/15 flex items-center justify-center max-[768px]:w-16 max-[768px]:h-16">
              <Icon name={icon} size={44} strokeWidth={1.7} />
            </span>
            <div className="flex-1 min-w-0">
              <h1 className="m-0 mb-[6px] font-display font-bold text-[38px] leading-[1.1] max-[768px]:text-[26px]">
                {i.name}
              </h1>
              <p className="m-0 font-ui text-[19px] text-white/85 max-[768px]:text-[16px]">
                {i.host} · {i.lead ?? "Для входа нужна учётная запись."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[250px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6">
            <PageNav title="Приложения" items={appNavItems()} current={instanceHref(instance)} />
          </div>
        </aside>

        <main className="min-w-0">
        {(i.about || app?.desc) && (
          <section className="mb-9 max-w-[820px]">
            <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">О приложении</h2>
            <p className="m-0 text-[19px] leading-[1.7] text-ink">{i.about ?? app?.desc}</p>
            {i.features && i.features.length > 0 && (
              <ul className="mt-4 mb-0 pl-5 list-disc marker:text-accent flex flex-col gap-2">
                {i.features.map((f) => (
                  <li key={f} className="text-[17px] leading-[1.5] text-steel">
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">
          {entriesTitle}
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
                <span
                  className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: soft, color: accent }}
                >
                  <Icon name={icon} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-bold text-[19px] text-brand leading-[1.2]">{b.name}</span>
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
                {entryCta}
              </a>
            </div>
          ))}
        </div>

        {/* Настройка рабочего места: раньше здесь висели три голые кнопки —
            что с ними делать, было непонятно. Теперь шаги, а кнопки внутри
            того шага, к которому относятся. Текст — в instances.json. */}
        <section
          className={
            hasSetup
              ? "mt-10 grid grid-cols-[1.3fr_1fr] gap-8 items-start max-[900px]:grid-cols-1"
              : "mt-10 grid grid-cols-1 gap-8 items-start max-w-[420px]"
          }
        >
          {hasSetup && (
          <div>
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
                      {install.x86 && (
                        <a href={install.x86} className="font-bold text-[14px] text-steel bg-bg-muted border border-line-strong rounded-lg px-[14px] py-[9px] no-underline hover:border-accent hover:text-accent transition-colors">
                          Клиент 1С · x86
                        </a>
                      )}
                      {install.x64 && (
                        <a href={install.x64} className="font-bold text-[14px] text-steel bg-bg-muted border border-line-strong rounded-lg px-[14px] py-[9px] no-underline hover:border-accent hover:text-accent transition-colors">
                          Клиент 1С · x64
                        </a>
                      )}
                      <span className="self-center text-[13px] text-ink-3">версия платформы {i.version}</span>
                    </div>
                  )}

                  {st.action === "v8i" && install.v8i && (
                    <div className="mt-1">
                      <a href={install.v8i} className="inline-block font-bold text-[14px] text-white bg-accent rounded-lg px-[14px] py-[9px] no-underline hover:bg-[rgb(150,46,3)] transition-colors">
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
          </div>
          )}

          {/* Панель «Доступ» — из макета. Значения только те, что реально
              знаем из instances.json и apps.yml. */}
          <aside className="bg-white border border-line rounded-[14px] p-6">
            <div className="font-bold text-[16px] uppercase tracking-[0.04em] text-ink-2 mb-[14px]">Доступ</div>
            <dl className="m-0 flex flex-col gap-3 mb-5">
              <div className="flex justify-between gap-3 text-[17px]">
                <dt className="text-steel">Вход</dt>
                <dd className="m-0 font-bold text-brand text-right">{i.auth ?? "Учётная запись 1С"}</dd>
              </div>
              {i.version && (
                <div className="flex justify-between gap-3 text-[17px]">
                  <dt className="text-steel">Платформа</dt>
                  <dd className="m-0 font-bold text-brand text-right tabular-nums">1С {i.version}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3 text-[17px]">
                <dt className="text-steel">Адрес</dt>
                <dd className="m-0 font-bold text-brand text-right break-all">{i.host}</dd>
              </div>
              {i.category && (
                <div className="flex justify-between gap-3 text-[17px]">
                  <dt className="text-steel">Направление</dt>
                  <dd className="m-0 font-bold text-brand text-right">{i.category}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3 text-[17px]">
                <dt className="text-steel">{i.kind === "web" ? "Систем" : "Баз"}</dt>
                <dd className="m-0 font-bold text-brand text-right tabular-nums">{i.bases.length}</dd>
              </div>
            </dl>
            {/* Внутренний адрес — через Link (см. AGENTS.md), но на сборке для
                внутренних хостов он внешний: развилка обязательна. */}
            {i.support && (
              <div className="mb-4 pt-4 border-t border-line text-[15px] text-steel">
                Проблемы с доступом:{" "}
                <a href={`mailto:${i.support}`} className="font-bold text-accent no-underline">
                  {i.support}
                </a>
              </div>
            )}
            {registryHref().startsWith("http") ? (
              <a href={registryHref()} className="block text-center font-bold text-[16px] text-steel no-underline">
                ← Все приложения
              </a>
            ) : (
              <Link href={registryHref()} className="block text-center font-bold text-[16px] text-steel no-underline">
                ← Все приложения
              </Link>
            )}
          </aside>
        </section>

        </main>
      </div>
    </>
  );
}
