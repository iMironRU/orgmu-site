import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getPageSlugs } from "@/lib/content/pages";
import { ContentPage } from "@/components/ContentPage";
import { PageNav } from "@/components/PageNav";
import { NIC_GROUP, nicNavItems, nicHref } from "@/lib/content/nic";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPageSlugs(NIC_GROUP).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPage(NIC_GROUP, slug);
  return p ? { title: `${p.title} · НИЦ`, description: p.lead } : {};
}

export default async function NicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPage(NIC_GROUP, slug);
  if (!page) notFound();
  // Крошку задаём здесь, а не в yml: на собственном домене раздел — корень,
  // и «/nic» из данных вёл бы в 404.
  const withCrumb = {
    ...page,
    breadcrumb: { href: nicHref(), label: "Научно-исследовательский центр" },
  };
  return (
    <ContentPage
      page={withCrumb}
      sideNav={<PageNav title="Научно-исследовательский центр" items={nicNavItems()} current={nicHref(slug)} />}
    />
  );
}
