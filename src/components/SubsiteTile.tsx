import type { Subsite } from "@/lib/content/navigation";
import { Icon } from "@/components/icons";

// Плитка подсайта («Сайты вуза») — на главной и на карте сайтов.
export function SubsiteTile({ s }: { s: Subsite }) {
  return (
    <a
      href={s.href}
      className="group flex items-center gap-3 bg-white border border-line rounded-xl p-4 no-underline transition-[border-color,box-shadow] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
      style={{ borderColor: "var(--c-line)" }}
    >
      <span
        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ color: s.accent, background: `color-mix(in srgb, ${s.accent} 12%, transparent)` }}
      >
        <Icon name={s.icon} size={26} />
      </span>
      <span className="font-ui font-bold text-[16px] leading-[1.2] text-brand">{s.label}</span>
    </a>
  );
}
