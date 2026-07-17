import type { Metadata } from "next";
import Link from "next/link";
import { getApps } from "@/lib/content/navigation";
import { AppsRegistry } from "@/components/AppsRegistry";
import { PageNav } from "@/components/PageNav";
import { appNavItems, registryHref, instanceHref, getInstance } from "@/lib/content/instances";

export const metadata: Metadata = {
  title: "Приложения вуза",
  description:
    "Сервисы и мобильные приложения Оренбургского медицинского университета для студентов, сотрудников и абитуриентов.",
};

export default function AppsPage() {
  // Карточка 1С ведёт на НАШУ страницу инстанса (со списком баз и инструкцией),
  // а не сразу на внешний хост мимо неё.
  const apps = getApps().map((a) => {
    const id = a.id.replace(/^app-/, "");
    return getInstance(id) ? { ...a, href: instanceHref(id) } : a;
  });

  return (
    <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[250px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 max-[768px]:pt-6">
      <aside>
        <div className="min-[901px]:sticky min-[901px]:top-6">
          <PageNav title="Приложения" items={appNavItems()} current={registryHref()} />
        </div>
      </aside>

      <main className="min-w-0">
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
      <p className="m-0 mb-6 font-ui text-[18px] text-steel max-w-[760px]">
        Сервисы и информационные системы университета. Выберите, кто вы, — список
        подстроится. Часть систем служебные и требуют учётной записи.
      </p>

      <AppsRegistry apps={apps} />
      </main>
    </div>
  );
}
