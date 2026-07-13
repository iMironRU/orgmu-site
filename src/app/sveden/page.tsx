import type { Metadata } from "next";
import { SvedenPage } from "@/components/sveden/SvedenPage";

export const metadata: Metadata = {
  title: "Сведения об образовательной организации",
  description:
    "Специальный раздел «Сведения об образовательной организации» по приказу Рособрнадзора № 1493 и ст. 29 Федерального закона № 273-ФЗ.",
};

// Точка входа в раздел — первый подраздел (Основные сведения).
export default function SvedenIndexPage() {
  return <SvedenPage sectionKey="common" />;
}
