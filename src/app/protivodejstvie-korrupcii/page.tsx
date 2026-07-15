import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/content/pages";
import { ContentPage } from "@/components/ContentPage";

const SLUG = "protivodejstvie-korrupcii";

export function generateMetadata(): Metadata {
  const p = getPage("info", SLUG);
  return p ? { title: p.title, description: p.lead } : {};
}

export default function ProtivodejstvieKorrupciiPage() {
  const page = getPage("info", SLUG);
  if (!page) notFound();
  return <ContentPage page={page} />;
}
