import type { Metadata } from "next";
import Link from "next/link";
import { getApps } from "@/lib/content/navigation";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Приложения вуза",
  description:
    "Сервисы и мобильные приложения Оренбургского медицинского университета для студентов, сотрудников и абитуриентов.",
};

export default function AppsPage() {
  const apps = getApps();

  return (
    <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 max-[768px]:pt-6">
      <div className="flex items-center gap-2 text-[15px] text-ink-3 mb-5 flex-wrap font-ui">
        <Link href="/" className="text-accent no-underline">
          Главная
        </Link>
        <span>/</span>
        <span className="text-ink-2">Приложения вуза</span>
      </div>

      <h1 className="m-0 mb-2 font-display font-bold text-[40px] text-brand max-[768px]:text-[30px]">
        Приложения вуза
      </h1>
      <p className="m-0 mb-8 font-ui text-[18px] text-steel max-w-[720px]">
        Сервисы и мобильные приложения университета для студентов, сотрудников и
        абитуриентов.
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
        {apps.map((a) => (
          <div
            key={a.name}
            className="bg-white border border-line rounded-xl p-6 flex flex-col gap-4 font-ui"
          >
            <span
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ color: a.accent, background: `color-mix(in srgb, ${a.accent} 12%, transparent)` }}
            >
              <Icon name={a.icon} size={34} />
            </span>
            <div>
              <div className="font-bold text-[22px] text-brand leading-tight">{a.name}</div>
              <div
                className="text-[12px] font-bold uppercase tracking-[0.03em] mt-1"
                style={{ color: a.accent }}
              >
                {a.tag}
              </div>
            </div>
            <p className="m-0 text-[16px] leading-[1.5] text-steel flex-1">{a.desc}</p>
            <a
              href={a.href}
              className="self-start font-bold text-[15px] text-white rounded-lg px-5 py-[10px] no-underline"
              style={{ background: a.accent }}
            >
              {a.cta}
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
