"use client";

import { useRouter } from "next/navigation";
import { FilterSelect } from "@/components/FilterSelect";

// Селект-навигация для мобильной версии боковых списков, где пункты — это
// ОТДЕЛЬНЫЕ страницы (sveden: «Подразделы», «Дополнительно»).
// В отличие от SectionToc здесь нет скролл-спая и быть не может: активен тот
// пункт, на чьей странице ты находишься, а выбор — переход.
export function NavSelect({
  title,
  items,
  current,
}: {
  title: string;
  items: { label: string; href: string }[];
  current?: string; // href текущей страницы
}) {
  const router = useRouter();

  return (
    <FilterSelect
      value={current ?? ""}
      onChange={(href) => {
        if (href && href !== current) router.push(href);
      }}
      searchable={false}
      placeholder={title}
      options={items.map((i, n) => ({ value: i.href, label: `${n + 1}. ${i.label}` }))}
    />
  );
}
