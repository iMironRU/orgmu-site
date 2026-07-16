import type { Metadata } from "next";
import Link from "next/link";
import { getUnits } from "@/lib/content/structure";
import { getFooter } from "@/lib/content/navigation";
import { SectionToc } from "@/components/SectionToc";
import { PhoneBook, MapEmbed } from "@/components/ContactsView";

// Контакты по макету Contacts: быстрые контакты + как нас найти.
// Сверх макета — телефонный справочник: у 125 из 136 подразделений заполнены
// телефон и почта, но найти их можно было только через карточку подразделения.

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Контакты Оренбургского государственного медицинского университета: адрес, телефоны, электронная почта, телефонный справочник подразделений.",
};

const SECTIONS = [
  { id: "bystrye", label: "Быстрые контакты" },
  { id: "spravochnik", label: "Телефонный справочник" },
  { id: "kak-najti", label: "Как нас найти" },
];

const ADDRESS = "г. Оренбург, ул. Советская, д. 6";
// Встраиваемая карта Яндекса по адресу — грузится только по клику (см. MapEmbed).
const MAP_SRC =
  "https://yandex.ru/map-widget/v1/?text=" + encodeURIComponent("Оренбург, улица Советская, 6") + "&z=17";

export default function ContactsPage() {
  const footer = getFooter();
  // Только подразделения с контактами — остальным в справочнике делать нечего.
  const units = getUnits()
    .filter((u) => u.phone || u.email)
    .map((u) => ({
      id: u.id,
      name: u.name,
      type: u.type,
      address: u.address,
      phone: u.phone,
      email: u.email,
    }));

  return (
    <>
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <span>Контакты</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[40px] leading-[1.1] max-[768px]:text-[28px]">
            Контакты
          </h1>
          <p className="m-0 max-w-[640px] font-ui text-[18px] text-white/85">
            Адрес, телефоны и электронная почта университета, справочник подразделений.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[250px_1fr] gap-10 max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        <aside>
          <div className="min-[901px]:sticky min-[901px]:top-6">
            <SectionToc title="Разделы" items={SECTIONS} />
          </div>
        </aside>

        <article className="min-w-0 flex flex-col gap-7">
          <section className="flex flex-col gap-4">
            <h2 id="bystrye" className="m-0 font-display font-bold text-[26px] text-brand scroll-mt-[100px]">
              Быстрые контакты
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
              <div className="bg-white border border-line rounded-xl p-5">
                <div className="text-[14px] text-ink-3 mb-1">Адрес</div>
                <div className="font-bold text-[17px] text-brand">{footer.org.address.join(" ")}</div>
              </div>
              {footer.org.contacts.map((c, i) => {
                const [k, ...rest] = c.split(":");
                const v = rest.join(":").trim() || k;
                const hasKey = rest.length > 0;
                return (
                  <div key={i} className="bg-white border border-line rounded-xl p-5">
                    <div className="text-[14px] text-ink-3 mb-1">{hasKey ? k : "Телефон"}</div>
                    <div className="font-bold text-[17px] text-brand break-words">{v}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 id="spravochnik" className="m-0 font-display font-bold text-[26px] text-brand scroll-mt-[100px]">
              Телефонный справочник
              <span className="ml-3 font-ui text-[14px] font-bold text-ink-3 bg-[rgb(240,243,246)] rounded-full px-[11px] py-[3px] align-middle">
                {units.length}
              </span>
            </h2>
            <PhoneBook units={units} />
          </section>

          <section className="flex flex-col gap-4">
            <h2 id="kak-najti" className="m-0 font-display font-bold text-[26px] text-brand scroll-mt-[100px]">
              Как нас найти
            </h2>
            <MapEmbed src={MAP_SRC} address={ADDRESS} />
          </section>
        </article>
      </div>
    </>
  );
}
