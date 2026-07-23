import { Link } from "@/components/Link";
import { FooterPicker } from "@/components/FooterPicker";
import { isTargetLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/t";
import { BuildStamp } from "@/components/BuildStamp";
import { Fragment } from "react";
import type { Footer } from "@/lib/content/navigation";

// Данные приходят пропсом из layout (content/navigation/footer.yml).
function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export function SiteFooter({
  footer,
  footerByLocale,
}: {
  footer: Footer;
  footerByLocale?: Record<string, Footer>;
}) {
  // Готовим разметку на всех языках сразу — выбрать нужную может только клиент
  // (корневой layout локали не знает).
  const variants: Record<string, React.ReactNode> = { ru: <FooterBody footer={footer} /> };
  for (const [l, f] of Object.entries(footerByLocale ?? {})) {
    variants[l] = <FooterBody footer={f} lang={l} />;
  }
  return <FooterPicker variants={variants} />;
}

function FooterBody({ footer, lang = "ru" }: { footer: Footer; lang?: string }) {
  // Подпись зашита в разметке, поэтому переводим её здесь. Сам текст перечислен
  // в content/i18n/ui.yml, чтобы попадать в машинный перевод.
  const routeLabel = isTargetLocale(lang) ? t("Схема проезда", lang) : "Схема проезда";
  const { org, columns } = footer;
  return (
    <footer className="bg-brand text-white font-ui" data-a11y-surface="brand">
      <div className="ft-top mx-auto max-w-[1146px] px-6 py-12 grid grid-cols-[1.4fr_1fr_1fr] gap-10 max-[640px]:grid-cols-1 max-[640px]:gap-7">
        <div className="flex flex-col gap-4">
          <span className="font-bold text-[20px] leading-[1.2]">
            <Lines lines={org.name} />
          </span>
          <span className="font-normal text-[16px] leading-[1.5] text-white/85">
            <Lines lines={org.address} />
          </span>
          {/* Через Link, а не <a>: иначе выбранный язык терялся бы на переходе. */}
          <Link
            href={org.route_href}
            className="inline-flex items-center gap-[7px] self-start font-bold text-[15px] text-white no-underline px-[14px] py-2 border border-white/30 rounded-[9px] hover:bg-white/10"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {routeLabel}
          </Link>
          <span className="font-normal text-[16px] leading-[1.5] text-white/85">
            <Lines lines={org.contacts} />
          </span>
        </div>

        {columns.map((col, ci) => (
          <nav key={ci} className="flex flex-col gap-3">
            {col.items.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="font-normal text-[16px] text-white/90 no-underline transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="border-t border-white/20">
        <div className="ft-bottom mx-auto max-w-[1146px] px-6 py-[18px] flex flex-wrap gap-4 justify-between items-center max-[640px]:flex-col max-[640px]:items-start">
          <span className="font-normal text-[13px] leading-[1.5] text-white/65 max-w-[760px]">
            © {new Date().getFullYear()} {org.copyright}
          </span>
          <span className="font-normal text-[13px] text-white/65">
            {org.support}
            {/* Метка сборки: намеренно неброско — нужна на время тестирования. */}
            <BuildStamp />
          </span>
        </div>
      </div>
    </footer>
  );
}
