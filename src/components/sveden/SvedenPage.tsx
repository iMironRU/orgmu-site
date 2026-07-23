import { Link } from "@/components/Link";
import { listSectionKeys, getSection } from "@/lib/sveden/vocab";
import { SECTION_LABELS, SECTION_SHORT, SECTION_LEADS } from "@/lib/sveden/labels";
import { SvedenSection } from "@/components/sveden/SvedenSection";
import { DocumentsView } from "@/components/sveden/DocumentsView";
import { DocCards } from "@/components/sveden/DocCards";
import { getDocumentGroups, getStaffListDoc } from "@/lib/sveden/documents";
import { getTeachers } from "@/lib/content/persons";
import { getSvedenExtra } from "@/lib/content/navigation";
import { NavSelect } from "@/components/NavSelect";

// Плашка со статистикой педсостава — по макету Svedenia (spec «Employees»):
// вместо таблицы на сотни строк три числа, а полный состав — на /persony.
function staffStats(): { n: string; l: string }[] {
  const t = getTeachers();
  const has = (p: { degree: string }, s: string) => p.degree.toLowerCase().includes(s);
  return [
    { n: String(t.length), l: "преподавателей в каталоге" },
    { n: String(t.filter((p) => has(p, "доктор")).length), l: "докторов наук" },
    { n: String(t.filter((p) => has(p, "кандидат")).length), l: "кандидатов наук" },
  ];
}

function StaffStats() {
  return (
    <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
      {staffStats().map((s) => (
        <div key={s.l} className="bg-white border border-line rounded-xl px-5 py-[18px] flex items-baseline gap-x-3 gap-y-[3px] flex-wrap">
          <div className="font-display font-bold text-[32px] leading-none text-brand">{s.n}</div>
          <div className="text-[15px] text-ink-2">{s.l}</div>
        </div>
      ))}
    </div>
  );
}

// Витрина-ссылка на отдельную страницу (по макету Svedenia — внешний подраздел).
const VITRINA_ICONS: Record<string, React.ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  cap: (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </>
  ),
};

function Vitrina({ href, title, desc, icon }: { href: string; title: string; desc: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 no-underline bg-white border border-line rounded-xl border-l-4 border-l-brand px-6 py-[22px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
    >
      <span className="shrink-0 text-brand">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {VITRINA_ICONS[icon]}
        </svg>
      </span>
      <span className="flex-1">
        <span className="block font-display font-bold text-[20px] text-brand">{title}</span>
        <span className="block text-[16px] text-steel mt-[2px]">{desc}</span>
      </span>
      <span className="shrink-0 text-gray-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </span>
    </Link>
  );
}

// Витрины-ссылки, показываемые ВМЕСТЕ с данными подраздела.
const VITRINY: Record<string, { href: string; title: string; desc: string }> = {
  managers: {
    href: "/rukovodstvo",
    title: "Открыть страницу руководства",
    desc: "Ректор и проректоры с должностями и контактами.",
  },
  employees: {
    href: "/persony",
    title: "Открыть педагогический состав",
    desc: "Каталог преподавателей с фильтрами по должности и учёной степени.",
  },
  objects: {
    href: "/mesta",
    title: "Открыть места осуществления деятельности",
    desc: "Учебные корпуса, клинические базы и объекты с адресами и доступной средой.",
  },
  grants: {
    href: "/stipendii",
    title: "Открыть стипендии и меры поддержки",
    desc: "Виды стипендий, социальная поддержка, общежитие и трудоустройство.",
  },
  paid_edu: {
    href: "/platnye-uslugi",
    title: "Открыть стоимость обучения",
    desc: "Стоимость по программам, порядок оказания и образец договора.",
  },
};

// Страница раздела «Сведения об ОО» по макету Svedenia: титульная плашка +
// две колонки (слева навигация по 14 подразделам, справа контент подраздела).
export function SvedenPage({ sectionKey }: { sectionKey: string }) {
  const keys = listSectionKeys();
  const section = getSection(sectionKey)!;
  const num = keys.indexOf(sectionKey) + 1;
  const title = SECTION_LABELS[sectionKey] ?? sectionKey;
  // Служебные страницы — отдельным списком под 14 обязательными подразделами.
  const extra = getSvedenExtra();

  return (
    <>
      {/* Титульная плашка */}
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1200px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">
              Главная
            </Link>
            <span>/</span>
            <span>Сведения об образовательной организации</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            Сведения об образовательной организации
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            Специальный раздел по приказу Рособрнадзора № 1493 и ст. 29 ФЗ-273.
            Структура и состав сведений фиксированы; данные продублированы в
            машиночитаемом виде.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[300px_1fr] gap-9 max-[900px]:grid-cols-1 max-[768px]:px-5">
        {/* Левая навигация */}
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6 flex flex-col gap-4">
            <>
            {/* Мобильный вариант: 14 подразделов занимали весь экран до контента.
                Пункты — отдельные страницы, поэтому это навигационный селект:
                скролл-спая тут быть не может, выбор = переход. */}
            <div className="min-[901px]:hidden sticky top-[60px] z-30 -mx-1 px-1 py-2 bg-bg">
              <NavSelect
                title="Подразделы"
                current={`/sveden/${sectionKey}`}
                items={keys.map((k) => ({ label: SECTION_SHORT[k] ?? k, href: `/sveden/${k}` }))}
              />
            </div>
            <nav className="max-[900px]:hidden bg-white border border-line rounded-xl overflow-hidden">
              <div className="px-[18px] py-[15px] bg-bg-muted border-b border-line font-ui font-bold text-[15px] uppercase tracking-[0.04em] text-ink-2">
                Подразделы
              </div>
              <div className="flex flex-col p-2">
                {keys.map((k, i) => {
                  const active = k === sectionKey;
                  return (
                    <Link
                      key={k}
                      href={`/sveden/${k}`}
                      className="flex items-center gap-[11px] px-3 py-[10px] rounded-lg no-underline font-ui text-[16px] hover:bg-[rgb(245,248,251)]"
                      style={{
                        background: active ? "rgba(184,57,4,0.12)" : "transparent",
                        color: active ? "var(--c-brand)" : "var(--c-steel)",
                        fontWeight: active ? 700 : 400,
                      }}
                    >
                      <span
                        className="shrink-0 w-[22px] h-[22px] rounded-md font-display text-[12px] font-bold flex items-center justify-center"
                        style={{
                          background: active ? "var(--c-brand)" : "rgb(240,243,246)",
                          color: active ? "#fff" : "rgb(120,140,160)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1">{SECTION_SHORT[k] ?? k}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
            </>

            {/* Служебные страницы — отдельным списком, вне обязательных 14:
                у них свои адреса верхнего уровня, namespace /sveden/ остаётся
                только под фиксированные адреса приказа № 1493. */}
            {extra.items.length > 0 && (
              <div className="min-[901px]:hidden">
                <NavSelect title={extra.title} items={extra.items} />
              </div>
            )}
            {extra.items.length > 0 && (
              <nav className="max-[900px]:hidden bg-white border border-line rounded-xl overflow-hidden">
                <div className="px-[18px] py-[15px] bg-bg-muted border-b border-line font-ui font-bold text-[15px] uppercase tracking-[0.04em] text-ink-2">
                  {extra.title}
                </div>
                <div className="flex flex-col p-2">
                  {extra.items.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className="px-3 py-[10px] rounded-lg no-underline font-ui text-[15.5px] leading-[1.3] text-steel hover:bg-[rgb(245,248,251)]"
                    >
                      {it.label}
                    </Link>
                  ))}
                </div>
              </nav>
            )}

            <div className="flex gap-[11px] px-4 py-[15px] bg-teal/10 rounded-xl">
              <span className="shrink-0 text-teal flex">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6 3 12l5 6M16 6l5 6-5 6M13 4l-2 16" />
                </svg>
              </span>
              <div className="text-[14px] leading-[1.45] text-steel font-ui">
                Каждый подраздел размечен по спецификации для автоматического
                сбора мониторингом.
              </div>
            </div>
          </div>
        </aside>

        {/* Контент подраздела */}
        <article className="min-w-0 flex flex-col gap-[22px]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="shrink-0 w-10 h-10 rounded-[10px] bg-brand text-white font-display text-[17px] font-bold flex items-center justify-center">
              {num}
            </span>
            <h2 className="m-0 font-display font-bold text-[28px] text-brand leading-[1.1] max-[768px]:text-[22px]">
              {title}
            </h2>
          </div>

          {SECTION_LEADS[sectionKey] && (
            <p className="m-0 font-ui font-medium text-[18px] leading-[1.5] text-steel">
              {SECTION_LEADS[sectionKey]}
            </p>
          )}

          {sectionKey === "document" ? (
            <DocumentsView groups={getDocumentGroups()} />
          ) : sectionKey === "struct" ? (
            <Vitrina
              href="/struktura"
              icon="grid"
              title="Открыть структуру подразделений"
              desc="Факультеты, кафедры, институты, управления и отделы с руководителями, адресами и положениями."
            />
          ) : sectionKey === "education" ? (
            <Vitrina
              href="/programmy"
              icon="cap"
              title="Перейти к каталогу образовательных программ"
              desc="Все уровни, направления, учебные планы, численность обучающихся и машиночитаемые сведения об образовании."
            />
          ) : (
            <>
              {VITRINY[sectionKey] && (
                <Link
                  href={VITRINY[sectionKey].href}
                  className="flex items-center gap-4 no-underline bg-white border border-line rounded-xl border-l-4 border-l-brand px-6 py-[22px] mb-2 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                >
                  <span className="flex-1">
                    <span className="block font-display font-bold text-[20px] text-brand">
                      {VITRINY[sectionKey].title}
                    </span>
                    <span className="block text-[16px] text-steel mt-[2px]">
                      {VITRINY[sectionKey].desc}
                    </span>
                  </span>
                  <span className="shrink-0 text-gray-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                  </span>
                </Link>
              )}
              {/* Педсостав: по макету — витрина + статистика, а не таблица на 173 строки
                  (персональные машиночитаемые карточки — на /persony). */}
              {sectionKey === "employees" ? (
                <>
                  <StaffStats />
                  <section className="mt-2">
                    <h3 className="m-0 mb-3 font-display font-bold text-[21px] text-brand">Документы</h3>
                    <DocCards docs={[getStaffListDoc()]} />
                  </section>
                </>
              ) : (
                <SvedenSection sectionKey={sectionKey} section={section} />
              )}

              {/* Плашка про машиночитаемость */}
              <div className="flex gap-3 px-[18px] py-4 bg-bg-muted border border-dashed border-line-strong rounded-[10px] mt-1">
                <span className="shrink-0 text-teal flex">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 9h10M7 13h6" />
                  </svg>
                </span>
                <div className="text-[14px] leading-[1.5] text-ink-2 font-ui">
                  Подраздел содержит машиночитаемую разметку по спецификации
                  Рособрнадзора (приказ № 1493): значения полей проставлены в
                  атрибутах <code>itemprop</code> для автоматического сбора
                  мониторингом.
                </div>
              </div>
            </>
          )}
        </article>
      </div>
    </>
  );
}
