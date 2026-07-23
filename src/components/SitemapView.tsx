"use client";

import { useMemo, useState } from "react";
import { Link } from "@/components/Link";
import type { Subsite, SitemapGroup } from "@/lib/content/navigation";
import { SubsiteTile } from "@/components/SubsiteTile";

const LINK_CLS = "text-[16px] text-steel no-underline hover:text-accent";

export function SitemapView({
  subsites,
  groups,
}: {
  subsites: Subsite[];
  groups: SitemapGroup[];
}) {
  const [q, setQ] = useState("");

  const { fSubsites, fGroups } = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { fSubsites: subsites, fGroups: groups };
    const fSubsites = subsites.filter((s) => s.label.toLowerCase().includes(query));
    const fGroups = groups
      .map((g) => {
        if (g.title.toLowerCase().includes(query)) return g;
        const links = g.links.filter((l) => l.label.toLowerCase().includes(query));
        return links.length ? { ...g, links } : null;
      })
      .filter((g): g is SitemapGroup => g !== null);
    return { fSubsites, fGroups };
  }, [q, subsites, groups]);

  const empty = q.trim() && fSubsites.length === 0 && fGroups.length === 0;

  return (
    <div className="font-ui">
      <div className="relative mb-10 max-w-[520px]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по разделам и сайтам…"
          className="w-full text-[17px] text-ink bg-white border border-line-strong rounded-xl pl-11 pr-4 py-3 outline-none focus:border-accent"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z" />
          <path d="M20 20l-4-4" />
        </svg>
      </div>

      {empty ? (
        <div className="bg-white border border-line rounded-xl p-8 text-center">
          <div className="font-display font-bold text-[22px] text-brand mb-2">Ничего не найдено</div>
          <div className="text-[16px] text-steel">
            По запросу «{q}» совпадений нет. Попробуйте изменить формулировку.
          </div>
        </div>
      ) : (
        <>
          {fSubsites.length > 0 && (
            <section className="mb-12">
              <h2 className="m-0 mb-5 font-display font-bold text-[25px] text-brand">
                Подсайты и порталы
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {fSubsites.map((s) => (
                  <SubsiteTile key={s.label} s={s} />
                ))}
              </div>
            </section>
          )}

          {fGroups.length > 0 && (
            <section>
              <h2 className="m-0 mb-5 font-display font-bold text-[25px] text-brand">
                Разделы сайта
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                {fGroups.map((g) => (
                  <div key={g.title} className="bg-white border border-line rounded-xl p-5">
                    <div className="font-bold text-[18px] text-brand pb-3 mb-3 border-b-2 border-sky-soft">
                      {g.title}
                    </div>
                    <ul className="list-none m-0 p-0 flex flex-col gap-[10px]">
                      {g.links.map((l) => (
                        <li key={l.label}>
                          {/* Внутренний адрес — через Link: у обычного <a>
                              basePath не применяется, ссылка вела бы в 404. */}
                          {l.href.startsWith("http") || l.href === "#" ? (
                            <a href={l.href} className={LINK_CLS}>
                              {l.label}
                            </a>
                          ) : (
                            <Link href={l.href} className={LINK_CLS}>
                              {l.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
