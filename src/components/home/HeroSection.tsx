import { HeroScene } from "@/components/home/HeroScene";
import { SanityImage as SanityImageType, CtaLink } from "@/types";

interface HeroSectionProps {
  data: {
    heroImage?: SanityImageType;
    heroTitle?: string;
    heroSubtitle?: string;
    heroCtaLabel?: string;
    heroCtaLink?: CtaLink;
  };
}

export function resolveLink(linkData?: CtaLink) {
  if (!linkData) return "/";
  if (linkData.linkType === "manual") return linkData.manual || "/";

  const ref = linkData.internal;
  if (!ref || !ref._type) return "/";

  switch (ref._type) {
    case "service": return `/hizmetler/${ref.slug}`;
    case "project": return `/projeler/${ref.slug}`;
    case "blogPost": return `/blog/${ref.slug}`;
    case "aboutPage": return `/hakkimizda`;
    case "contactPage": return `/iletisim`;
    default: return "/";
  }
}

// TEMP: layout stripped down to isolated 3D model test — headline/CTA restored once the asset is validated.
export function HeroSection(_props: HeroSectionProps) {
  return (
    <section className="relative h-screen w-full bg-black">
      <HeroScene />
    </section>
  );
}
