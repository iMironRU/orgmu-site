import { Link } from "@/components/Link";
import type { Program } from "@/lib/content/programs-types";
import { levelColor, levelLabel } from "@/lib/content/programs-types";

const DASH = "—";

// Горизонтальная плитка программы по макету ProgramTile.dc.html.
export function ProgramTile({ p }: { p: Program }) {
  const accent = levelColor(p.levelCat);
  const soft = `color-mix(in srgb, ${accent} 12%, transparent)`;

  const Place = ({ value, label, bg }: { value?: string; label: string; bg: string }) => (
    <div className="min-w-[66px] text-center rounded-lg px-[10px] py-2" style={{ background: bg }}>
      <div className="font-display font-bold text-[20px] text-brand">{value || DASH}</div>
      <div className="text-[12px] text-ink-2">{label}</div>
    </div>
  );

  return (
    <Link
      href={`/programmy/${p.id}`}
      className="block no-underline bg-white border border-line rounded-[10px] px-[22px] py-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-[box-shadow,transform] hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)] hover:-translate-y-[2px]"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="flex items-stretch gap-5 max-[760px]:flex-wrap">
        {/* Идентификация */}
        <div className="flex-[1_1_260px] min-w-0">
          <div className="flex items-center gap-[10px] mb-[6px] flex-wrap">
            <span className="text-[12px] font-bold uppercase tracking-[0.04em] rounded-md px-[10px] py-1" style={{ color: accent, background: soft }}>
              {levelLabel(p.levelCat)}
            </span>
            <span className="font-display text-[14px] text-ink-3">{p.code}</span>
            {p.term && <span className="text-[14px] text-ink-3">· {p.term}</span>}
          </div>
          <div className="font-bold text-[21px] leading-[1.15] text-brand">{p.name}</div>
          <div className="text-[16px] text-steel mt-1">{p.faculty || p.profile || DASH}</div>
          {p.form && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[14px] font-bold text-steel bg-bg-muted border border-[rgb(228,232,236)] rounded-full px-[13px] py-[5px]">
                {p.form}
              </span>
            </div>
          )}
        </div>

        {/* Места приёма */}
        <div className="flex-[0_0_auto] flex flex-col items-end gap-2 pl-5 border-l border-line max-[760px]:basis-full max-[760px]:items-start max-[760px]:pl-0 max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:pt-3 max-[760px]:mt-1">
          <span className="text-[12px] font-bold uppercase tracking-[0.03em] text-ink-3">Мест приёма</span>
          <div className="flex gap-2">
            <Place value={p.kcpBudget} label="бюджет" bg="rgba(184,57,4,0.10)" />
            <Place value={p.kcpTarget} label="целевое" bg="rgba(48,176,199,0.10)" />
            <Place value={p.kcpPaid} label="договор" bg="var(--c-bg-muted)" />
          </div>
          <span className="text-[13px] text-ink-3">
            Проходной балл: <b className="text-steel">{p.score || DASH}</b>
          </span>
        </div>
      </div>
    </Link>
  );
}
