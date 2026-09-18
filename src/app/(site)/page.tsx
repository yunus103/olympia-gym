import { Metadata } from "next";
import { cachedFetch } from "@/sanity/lib/client";
import { homePageQuery } from "@/sanity/lib/queries";
import { buildMetadata, getLayoutData } from "@/lib/seo";
import { HeroSection } from "@/components/home/HeroSection";
import { InfoStrip } from "@/components/home/InfoStrip";
import { HomePage as HomePageType } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const data = await cachedFetch<HomePageType>(homePageQuery, {}, { next: { tags: ["home"] } });
  return buildMetadata({
    canonicalPath: "/",
    pageSeo: data?.seo,
  });
}

// Sections are added one by one (see docs/implementation-plan.md step 5).
export default async function HomePage() {
  const [data, layout] = await Promise.all([
    cachedFetch<HomePageType>(homePageQuery, {}, { next: { tags: ["home"] } }),
    getLayoutData(),
  ]);

  return (
    <div className="flex flex-col w-full">
      <HeroSection data={data} />
      <InfoStrip settings={layout?.settings} />
    </div>
  );
}
