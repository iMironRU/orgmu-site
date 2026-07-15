import type { DocItem } from "@/lib/sveden/documents";
import { DocCard } from "@/components/sveden/DocCard";

// Список документов карточками (стиль макета Documents.dc.html), без фильтров.
// Одна карточка — DocCard: он же сворачивает длинные названия.
export function DocCards({ docs }: { docs: DocItem[] }) {
  if (docs.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 font-ui">
      {docs.map((d, i) => (
        <DocCard key={i} d={d} />
      ))}
    </div>
  );
}
