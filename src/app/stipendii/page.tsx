import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { Metadata } from "next";
import Link from "next/link";
import { getPrograms } from "@/lib/content/programs";
import { getSectionFileDocs } from "@/lib/sveden/documents";
import { DocCards } from "@/components/sveden/DocCards";

export const metadata: Metadata = {
  title: "Стипендии и меры поддержки",
  description:
    "Виды стипендий и условия их назначения, меры социальной поддержки, общежитие и содействие трудоустройству выпускников ОрГМУ.",
};

const DASH = "—";

type StipData = {
  types?: { category?: string; title: string; condition?: string; sum?: string; unit?: string }[];
  support?: { title: string; desc?: string }[];
  hostel?: { buildings?: string; places?: string };
};

function loadStip(): StipData {
  const p = path.join(process.cwd(), "content", "stipendii.yml");
  return fs.existsSync(p) ? ((parseYaml(fs.readFileSync(p, "utf8")) as StipData) ?? {}) : {};
}

export default function ScholarshipsPage() {
  const stip = loadStip();
  const docs = getSectionFileDocs("grants");

  // Трудоустройство — агрегат из данных программ (реальное)
  let gradTotal = 0;
  let gradEmployed = 0;
  for (const p of getPrograms()) {
    gradTotal += parseInt(p.graduates?.total ?? "", 10) || 0;
    gradEmployed += parseInt(p.graduates?.employed ?? "", 10) || 0;
  }

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/sveden" className="text-white/90 no-underline">Сведения об организации</Link>
            <span>/</span>
            <span>Стипендии и меры поддержки</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            Стипендии и меры поддержки
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            Виды стипендий и условия их назначения, меры социальной поддержки,
            общежитие и содействие трудоустройству выпускников.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 flex flex-col gap-9 font-ui">
        {/* Виды стипендий */}
        <section>
          <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Виды стипендий</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
            {(stip.types ?? []).map((s, i) => (
              <div key={i} className="bg-white border border-line rounded-xl p-5 flex flex-col gap-2">
                {s.category && (
                  <span className="self-start text-[11px] font-bold uppercase tracking-[0.04em] text-accent bg-[rgba(184,57,4,0.10)] rounded-[5px] px-2 py-[3px]">
                    {s.category}
                  </span>
                )}
                <div className="font-bold text-[18px] text-brand leading-[1.2]">{s.title}</div>
                {s.condition && <div className="text-[15px] text-steel">{s.condition}</div>}
                <div className="mt-auto pt-2 font-display font-bold text-[22px] text-brand">
                  {s.sum ? `${s.sum} ${s.unit ?? ""}` : DASH}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[14px] text-ink-3">
            Суммы стипендий уточняются — заполняются в <code>content/stipendii.yml</code>.
          </p>
        </section>

        {/* Меры поддержки */}
        {(stip.support ?? []).length > 0 && (
          <section>
            <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Меры социальной поддержки</h2>
            <div className="flex flex-col gap-2">
              {stip.support!.map((m, i) => (
                <div key={i} className="bg-white border border-line rounded-xl px-5 py-4">
                  <div className="font-bold text-[17px] text-brand">{m.title}</div>
                  {m.desc ? <div className="text-[15px] text-steel mt-1">{m.desc}</div> : <div className="text-[15px] text-ink-3 mt-1">{DASH}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Общежитие */}
        <section>
          <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Общежитие для иногородних</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white border border-line rounded-xl px-6 py-4 min-w-[160px]">
              <div className="font-display font-bold text-[28px] text-brand leading-none">{stip.hostel?.buildings || DASH}</div>
              <div className="text-[14px] text-ink-3 mt-1">общежитий</div>
            </div>
            <div className="bg-white border border-line rounded-xl px-6 py-4 min-w-[160px]">
              <div className="font-display font-bold text-[28px] text-brand leading-none">{stip.hostel?.places || DASH}</div>
              <div className="text-[14px] text-ink-3 mt-1">мест</div>
            </div>
          </div>
        </section>

        {/* Трудоустройство — реальный агрегат */}
        {gradTotal > 0 && (
          <section>
            <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Трудоустройство выпускников</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white border border-line rounded-xl px-6 py-4 min-w-[180px]">
                <div className="font-display font-bold text-[28px] text-brand leading-none">{gradTotal}</div>
                <div className="text-[14px] text-ink-3 mt-1">выпускников прошлого года</div>
              </div>
              <div className="bg-white border border-line rounded-xl px-6 py-4 min-w-[180px]">
                <div className="font-display font-bold text-[28px] text-brand leading-none">{gradEmployed}</div>
                <div className="text-[14px] text-ink-3 mt-1">трудоустроено</div>
              </div>
            </div>
          </section>
        )}

        {docs.length > 0 && (
          <section>
            <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Документы</h2>
            <DocCards docs={docs} />
          </section>
        )}
      </main>
    </>
  );
}
