import { getSiteUrl } from "@/lib/utils";
import { urlForImage } from "@/sanity/lib/image";
import { OpeningHour, SiteSettings, SocialLink } from "@/types";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const DAY_OF_WEEK: Record<OpeningHour["day"], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function healthClubJsonLd(settings?: SiteSettings) {
  const contact = settings?.contactInfo;
  const logoUrl = settings?.logo ? urlForImage(settings.logo)?.url() : undefined;
  const imageUrl = settings?.defaultOgImage ? urlForImage(settings.defaultOgImage)?.width(1200).height(630).url() : undefined;
  const openingHours = settings?.openingHours?.filter((h) => !h.closed && h.open && h.close) ?? [];
  const hasRating = settings?.googleRating && settings.googleReviewCount;

  return {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    name: settings?.siteName,
    url: getSiteUrl(),
    ...(logoUrl && { logo: logoUrl }),
    ...(imageUrl && { image: imageUrl }),
    ...(contact?.phone && { telephone: contact.phone }),
    ...(contact?.email && { email: contact.email }),
    ...(contact?.address && { address: { "@type": "PostalAddress", streetAddress: contact.address } }),
    ...(contact?.mapsUrl && { hasMap: contact.mapsUrl }),
    ...(openingHours.length > 0 && {
      openingHoursSpecification: openingHours.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_OF_WEEK[h.day],
        opens: h.open,
        closes: h.close,
      })),
    }),
    ...(hasRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: settings.googleRating,
        reviewCount: settings.googleReviewCount,
        bestRating: 5,
      },
    }),
    sameAs: settings?.socialLinks?.map((s: SocialLink) => s.url).filter(Boolean) || [],
  };
}

export function websiteJsonLd(settings?: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings?.siteName || "Site Adı",
    url: getSiteUrl(),
    ...(settings?.siteTagline && { alternateName: settings.siteTagline }),
  };
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbListJsonLd(items: { label: string; href: string }[]) {
  const siteUrl = getSiteUrl();
  const allItems = [
    { label: "Ana Sayfa", href: "/" },
    ...items.filter((item) => item.href !== "/"),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href.startsWith("http") ? item.href : `${siteUrl}${item.href}`,
    })),
  };
}
