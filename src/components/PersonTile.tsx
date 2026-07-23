import { Link } from "@/components/Link";
import { formatPhone } from "@/lib/phone";
import type { PersonCardItem } from "@/lib/content/persons-types";
import { initials, avatarColor } from "@/lib/content/persons-types";

// Плитка персоны по макету PersonTile.dc.html. mode: staff (педсостав) | lead (руководство).
export function PersonTile({
  person: p,
  mode = "staff",
  // Подпись рядом с числом лет: «стаж, years». Приходит с языковой страницы —
  // компонент клиентский и словарь прочитать не может.
  experienceLabel = "стаж",
}: {
  person: PersonCardItem;
  mode?: "staff" | "lead";
  experienceLabel?: string;
}) {
  const accent = p.isLead ? "rgb(175,82,222)" : "rgb(184,57,4)";
  const degreeLine = [p.degree, p.academStat].filter(Boolean).join(", ");
  const contacts = [p.phone, p.email].filter(Boolean);

  return (
    <div
      className="flex items-center gap-5 bg-white border border-line rounded-[10px] px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-[box-shadow,transform] hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)] hover:-translate-y-[2px]"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <Link href={`/persony/${p.id}`} className="shrink-0 no-underline">
        <span
          className="flex w-[52px] h-[66px] rounded-[10px] text-white font-display font-bold text-[19px] items-center justify-center"
          style={{ background: avatarColor(p.fio) }}
        >
          {initials(p.fio)}
        </span>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/persony/${p.id}`} className="block no-underline">
          <div className="flex items-center gap-[9px] flex-wrap mb-[3px]">
            {p.isLead && p.leadRole && (
              <span className="text-[11px] font-bold tracking-[0.04em] uppercase text-[rgb(175,82,222)] bg-[rgba(175,82,222,0.10)] rounded-[5px] px-2 py-[3px]">
                {p.leadRole}
              </span>
            )}
            {degreeLine && <span className="text-[14px] text-ink-3">{degreeLine}</span>}
          </div>
          <div className="font-bold text-[20px] leading-[1.15] text-brand">{p.fio}</div>
          <div className="text-[15px] text-steel mt-[2px]">{p.position}</div>
        </Link>

        {mode === "staff" && p.disciplines.length > 0 && (
          <div className="flex gap-[7px] mt-[10px] flex-wrap">
            {p.disciplines.slice(0, 3).map((d, i) => (
              <span
                key={i}
                className="text-[13px] font-bold text-steel bg-bg-muted border border-[rgb(228,232,236)] rounded-full px-[11px] py-1"
              >
                {d}
              </span>
            ))}
            {p.disciplines.length > 3 && (
              <span className="text-[13px] font-bold text-accent bg-[rgba(184,57,4,0.10)] border border-[rgba(184,57,4,0.25)] rounded-full px-[11px] py-1">
                +{p.disciplines.length - 3} ещё
              </span>
            )}
          </div>
        )}

        {mode === "lead" && contacts.length > 0 && (
          <div className="flex gap-4 mt-[10px] flex-wrap text-[14px] text-steel">
            {p.phone && <span>{formatPhone(p.phone)}</span>}
            {p.email && (
              <a href={`mailto:${p.email}`} className="text-steel no-underline hover:text-accent">
                {p.email}
              </a>
            )}
          </div>
        )}
      </div>

      {mode === "staff" && p.experience && (
        <div className="shrink-0 pl-5 border-l border-line text-center max-[560px]:hidden">
          <div className="font-display font-bold text-[22px] text-brand leading-none">
            {p.experience.split(" ")[0]}
          </div>
          <div className="text-[13px] text-ink-3 mt-1">{experienceLabel}, {p.experience.split(" ")[1]}</div>
        </div>
      )}
    </div>
  );
}
