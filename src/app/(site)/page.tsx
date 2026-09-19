import { Metadata } from "next";
import { cachedFetch } from "@/sanity/lib/client";
import { homePageQuery, pricingPlansQuery } from "@/sanity/lib/queries";
import { buildMetadata, getLayoutData } from "@/lib/seo";
import { HeroSection } from "@/components/home/HeroSection";
import { InfoStrip } from "@/components/home/InfoStrip";
import { GallerySection } from "@/components/home/GallerySection";
import { PricingSection } from "@/components/home/PricingSection";
import { AboutSection } from "@/components/home/AboutSection";
import { HomePage as HomePageType, PricingPlan } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const data = await cachedFetch<HomePageType>(homePageQuery, {}, { next: { tags: ["home"] } });
  return buildMetadata({
    canonicalPath: "/",
    pageSeo: data?.seo,
  });
}

// Sections are added one by one (see docs/implementation-plan.md step 5).
export default async function HomePage() {
  const [data, layout, plans] = await Promise.all([
    cachedFetch<HomePageType>(homePageQuery, {}, { next: { tags: ["home"] } }),
    getLayoutData(),
    cachedFetch<PricingPlan[]>(pricingPlansQuery, {}, { next: { tags: ["home"] } }),
  ]);

  return (
    <div className="flex flex-col w-full">
      <HeroSection data={data} />
      <InfoStrip settings={layout?.settings} />
      <GallerySection title={data?.galleryTitle} subtitle={data?.gallerySubtitle} siteName={layout?.settings?.siteName} items={data?.galleryItems} />
      <PricingSection data={data} plans={plans} whatsappNumber={layout?.settings?.contactInfo?.whatsappNumber} />
      <AboutSection data={data} />
    </div>
  );
}
