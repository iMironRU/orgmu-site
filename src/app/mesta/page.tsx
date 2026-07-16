import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { Metadata } from "next";
import Link from "next/link";
import { getSection } from "@/lib/sveden/vocab";
import { SvedenSection } from "@/components/sveden/SvedenSection";
import { MestaView } from "@/components/MestaView";

export const metadata: Metadata = {
  title: "Места осуществления образовательной деятельности",
  description:
    "Учебные корпуса, клинические базы и иные объекты ОрГМУ с адресами, размещёнными подразделениями и сведениями о доступной среде.",
};

import type { MestaObj } from "@/components/MestaView";

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
          <MestaView objects={objects} />
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
