import type { Metadata } from "next";
import Link from "next/link";
import { getApps } from "@/lib/content/navigation";
import { Icon } from "@/components/icons";
import { PageNav } from "@/components/PageNav";
import { appNavItems, launcherHref, instanceHref, getInstance } from "@/lib/content/instances";

// Лаунчер app.orgma.ru. Это страница САЙТА — тот же layout, та же шапка,
// подвал и боковая панель. Собирается отдельной сборкой с basePath="" и
// раскладывается в корень app.orgma.ru (scripts/apps/build-launcher.mjs).
// Ссылки меню и подвала при этой сборке становятся абсолютными на сайт.

export const metadata: Metadata = {
  title: "Платформа приложений",
  description: "Приложения 1С Оренбургского медицинского университета: состав, версии и статус инстансов.",
  robots: { index: false },
};

// Падежи: «1 база», «2 базы», «10 баз».
function basesWord(n: number): string {
  const d = n % 10, dd = n % 100;
  if (dd >= 11 && dd <= 14) return "баз";
  if (d === 1) return "база";
  if (d >= 2 && d <= 4) return "базы";
  return "баз";
}

const CTA =
  "block text-center font-ui font-bold text-[15px] text-white bg-accent rounded-[10px] py-[11px] no-underline hover:bg-[rgb(150,46,3)] transition-colors";

const label = (a: { bases: number }) =>
  a.bases > 0 ? `Открыть · ${a.bases} ${basesWord(a.bases)}` : "Открыть приложение";

export default function LauncherPage() {
  // Карточка ведёт туда же, куда пункт меню: на страницу инстанса. Раньше
  // кнопка уходила на внешний хост, а меню — внутрь сайта: один и тот же
  // переход в двух местах работал по-разному.
  const apps = getApps()
    .filter((a) => a.platform === "1c" && a.id !== "app-platform" && a.version)
    .map((a) => {
      const id = a.id.replace(/^app-/, "");
      const inst = getInstance(id);
      return { ...a, pageHref: inst ? instanceHref(id) : a.href, bases: inst?.bases.length ?? 0 };
    });

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <span>Платформа приложений</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            Платформа приложений
          </h1>
          <p className="m-0 max-w-[640px] font-ui text-[18px] text-white/85">
            Приложения 1С университета. Для входа нужна учётная запись.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[250px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        {/* Меню приложений — тот же паттерн, что «Подразделы» в sveden.
            С инстанса на инстанс раньше можно было попасть только через
            платформу. */}
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6">
            <PageNav title="Приложения" items={appNavItems()} current={launcherHref()} />
          </div>
        </aside>

        <main className="min-w-0">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {apps.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 bg-white border border-line rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: a.accent }}>
                  <Icon name={a.icon} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-bold text-[18px] text-brand leading-[1.2]">{a.name}</span>
                  <span className="block text-[13px] text-ink-3 mt-[2px] break-words">{a.tag}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-[6px]">
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.04em] rounded-md px-2 py-[3px]"
                  style={
                    a.status === "updating"
                      ? { color: "rgb(180,120,0)", background: "rgba(255,149,0,0.14)" }
                      : { color: "rgb(30,160,80)", background: "rgba(52,199,89,0.12)" }
                  }
                >
                  Активен · {a.statusNote}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.04em] rounded-md px-2 py-[3px] text-steel bg-bg-muted border border-line">
                  {a.category}
                </span>
                <span className="text-[13px] text-ink-3 tabular-nums self-center">v {a.version}</span>
              </div>
              <p className="m-0 text-[15px] leading-[1.45] text-steel flex-1">{a.desc}</p>
              {/* Внутренний адрес — через Link: у обычного <a> basePath не
                  применяется, и на сайте кнопка вела бы в 404. Внешний хост
                  (сборка лаунчера) — обычной ссылкой. */}
              {a.pageHref.startsWith("http") ? (
                <a href={a.pageHref} className={CTA}>
                  {label(a)}
                </a>
              ) : (
                <Link href={a.pageHref} className={CTA}>
                  {label(a)}
                </Link>
              )}
            </div>
          ))}
        </div>
        </main>
      </div>
    </>
  );
}
