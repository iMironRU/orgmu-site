import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { getSection } from "@/lib/sveden/vocab";
import { SvedenSection, groupAnchor } from "@/components/sveden/SvedenSection";
import { sectionGroups } from "@/lib/sveden/vocab";
import { groupLabel } from "@/lib/sveden/labels";
import { SectionToc } from "@/components/SectionToc";
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
  // Оглавление: свои разделы + группы из вокабуляра (их заголовки рисует
  // SvedenSection, якоря — groupAnchor).
  const toc = [
    { id: "objekty", label: "Объекты" },
    ...(section ? [{ id: "mto", label: "Материально-техническое обеспечение" }] : []),
    ...(section
      ? sectionGroups(section).map((g) => ({ id: groupAnchor(g.key), label: groupLabel(g.key) }))
      : []),
  ];

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

      <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[250px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        {/* Страница длинная: свои два раздела плюс группы из вокабуляра
            (кабинеты, практика, библиотеки, спорт) — без оглавления до них
            приходилось листать. Якоря групп даёт SvedenSection. */}
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6">
            <SectionToc title="Разделы" items={toc} />
          </div>
        </aside>

        <main className="min-w-0 flex flex-col gap-9">
          <section>
            <h2 id="objekty" className="m-0 mb-4 font-display font-bold text-[24px] text-brand scroll-mt-[100px]">
              Объекты
            </h2>
            <MestaView objects={objects} />
          </section>

          {section && (
            <section>
              <h2 id="mto" className="m-0 mb-4 font-display font-bold text-[24px] text-brand scroll-mt-[100px]">
                Материально-техническое обеспечение и доступная среда
              </h2>
              <SvedenSection sectionKey="objects" section={section} />
            </section>
          )}
        </main>
      </div>
    </>
  );
}
