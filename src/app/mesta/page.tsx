import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { Metadata } from "next";
import Link from "next/link";
import { getSection } from "@/lib/sveden/vocab";
import { SvedenSection } from "@/components/sveden/SvedenSection";

export const metadata: Metadata = {
  title: "Места осуществления образовательной деятельности",
  description:
    "Учебные корпуса, клинические базы и иные объекты ОрГМУ с адресами, размещёнными подразделениями и сведениями о доступной среде.",
};

type MestaObj = { name: string; type?: string; address?: string; area?: string; a11y?: boolean };

function loadMesta(): MestaObj[] {
  const p = path.join(process.cwd(), "content", "mesta.yml");
  if (!fs.existsSync(p)) return [];
  const d = parseYaml(fs.readFileSync(p, "utf8")) as { objects?: MestaObj[] };
  return d?.objects ?? [];
}

export default function LocationsPage() {
  const objects = loadMesta();
  const section = getSection("objects");

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <Link href="/sveden" className="text-white/90 no-underline">Сведения об организации</Link>
            <span>/</span>
            <span>Места осуществления деятельности</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            Места осуществления образовательной деятельности
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            Учебные корпуса, клинические базы и иные объекты с адресами,
            размещёнными подразделениями и сведениями о доступной среде.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border max-[768px]:px-5 flex flex-col gap-9 font-ui">
        <section>
          <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">Объекты</h2>
          {objects.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
              {objects.map((o, i) => (
                <div key={i} className="bg-white border border-line rounded-xl p-5 flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {o.type && (
                      <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-steel bg-bg-muted border border-line rounded-[5px] px-2 py-[2px]">
                        {o.type}
                      </span>
                    )}
                    {o.a11y && (
                      <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[rgb(30,160,80)] bg-[rgba(52,199,89,0.12)] rounded-[5px] px-2 py-[2px]">
                        Доступно для МГН
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-[18px] text-brand leading-[1.2]">{o.name}</div>
                  {o.address && <div className="text-[15px] text-steel">{o.address}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[16px] text-ink-3 bg-white border border-dashed border-line-strong rounded-xl px-6 py-5">
              Структурированный список объектов уточняется — заполняется в{" "}
              <code>content/mesta.yml</code>. Ниже — сведения о материально-техническом
              обеспечении и доступной среде из раздела «Сведения».
            </div>
          )}
        </section>

        {section && (
          <section>
            <h2 className="m-0 mb-4 font-display font-bold text-[24px] text-brand">
              Материально-техническое обеспечение и доступная среда
            </h2>
            <SvedenSection sectionKey="objects" section={section} />
          </section>
        )}
      </main>
    </>
  );
}
