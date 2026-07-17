import type { Metadata } from "next";
import Link from "next/link";
import { getApps } from "@/lib/content/navigation";
import { Icon } from "@/components/icons";

// Лаунчер app.orgma.ru. Это страница САЙТА — тот же layout, та же шапка,
// подвал и боковая панель. Собирается отдельной сборкой с basePath="" и
// раскладывается в корень app.orgma.ru (scripts/apps/build-launcher.mjs).
// Ссылки меню и подвала при этой сборке становятся абсолютными на сайт.

export const metadata: Metadata = {
  title: "Платформа приложений",
  description: "Приложения 1С Оренбургского медицинского университета: состав, версии и статус инстансов.",
  robots: { index: false },
};

export default function LauncherPage() {
  const apps = getApps().filter((a) => a.platform === "1c" && a.id !== "app-platform" && a.version);

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

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 font-ui">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {apps.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 bg-white border border-line rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: a.accent }}>
                  <Icon name={a.icon} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-bold text-[18px] text-brand leading-[1.2]">{a.name}</span>
                  <a href={a.href} className="block text-[13px] text-ink-3 mt-[2px] no-underline hover:text-accent break-words">{a.tag}</a>
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
              <a href={a.href} className="block text-center font-ui font-bold text-[15px] text-white bg-accent rounded-[10px] py-[11px] no-underline hover:bg-[rgb(150,46,3)] transition-colors">
                Открыть приложение
              </a>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
