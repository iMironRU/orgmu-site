import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/content/pages";
import { alternates } from "@/lib/i18n/alternates";
import { ContentPage } from "@/components/ContentPage";

const SLUG = "dissovet";

export function generateMetadata(): Metadata {
  const p = getPage("info", SLUG);
  return p ? { title: p.title, description: p.lead, alternates: alternates("/dissovet") } : {};
}

export default function DissovetPage() {
  const page = getPage("info", SLUG);
  if (!page) notFound();
  return <ContentPage page={page} />;
}
