import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { AccessibilityControls } from "@/components/AccessibilityControls";

export const metadata: Metadata = {
  title: "Версия для слабовидящих",
  description:
    "Настройте размер шрифта, цветовую схему, межбуквенный интервал и изображения. Параметры применяются ко всему сайту и сохраняются в браузере.",
};

export default function AccessibilityPage() {
  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui">
            <Link href="/" className="text-white/90 no-underline">
              Главная
            </Link>
            <span>/</span>
            <span>Настройки доступности</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[30px]">
            Версия для слабовидящих
          </h1>
          <p className="m-0 max-w-[640px] font-ui text-[18px] text-white/85">
            Настройте отображение сайта под свои потребности. Параметры
            применяются ко всему сайту сразу и сохраняются в браузере.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[760px] w-full px-10 pt-12 pb-16 box-border max-[768px]:px-5">
        <AccessibilityControls />

        <p className="mt-8 text-[15px] text-ink-3 font-ui">
          Настройки хранятся только в вашем браузере (localStorage) и не
          передаются на сервер. Чтобы вернуть обычный вид — нажмите «Сбросить
          настройки».
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-block font-ui font-bold text-[17px] text-white bg-accent rounded-lg py-[13px] px-[22px] no-underline"
          >
            Вернуться на сайт
          </Link>
        </div>
      </main>
    </>
  );
}
