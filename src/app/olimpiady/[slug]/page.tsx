import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getPageSlugs } from "@/lib/content/pages";
import { ContentPage } from "@/components/ContentPage";

const GROUP = "olimpiady";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPageSlugs(GROUP).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPage(GROUP, slug);
  return p ? { title: p.title, description: p.lead } : {};
}

export default async function OlympiadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getPage(GROUP, slug);
  if (!page) notFound();
  return <ContentPage page={page} />;
}
