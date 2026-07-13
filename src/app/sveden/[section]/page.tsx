import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listSectionKeys, getSection } from "@/lib/sveden/vocab";
import { SECTION_LABELS } from "@/lib/sveden/labels";
import { SvedenPage } from "@/components/sveden/SvedenPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return listSectionKeys().map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const title = SECTION_LABELS[section];
  if (!title) return {};
  return { title: `${title} — Сведения об ОО` };
}

export default async function SvedenSectionRoute({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!getSection(section)) notFound();
  return <SvedenPage sectionKey={section} />;
}
