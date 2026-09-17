import { groq } from "next-sanity";

// ─── Shared Fragments ──────────────────────────────────────────────────────────

/**
 * Shared GROQ projection for SanityImage fields.
 * Includes LQIP blur preview, dimensions, alt text, hotspot, and crop.
 */
export const imageFields = /* groq */ `{
  asset->{ _id, url, metadata { lqip, dimensions } },
  alt,
  hotspot,
  crop
}`;

// ─── Layout ────────────────────────────────────────────────────────────────────
// Her sayfada bir kez çekilir — header, footer, global ayarlar
export const layoutQuery = groq`{
  "settings": *[_type == "siteSettings"][0] {
    siteName, siteTagline,
    logo ${imageFields},
    logoHeight,
    favicon { asset->{ _id, url } },
    contactInfo { phone, email, address, whatsappNumber, mapIframe, mapsUrl },
    googleRating, googleReviewCount,
    openingHours[] { day, open, close, closed },
    socialLinks[] { platform, url },
    gaId, gtmId, googleSearchConsoleId,
    defaultSeo { metaTitle, metaDescription },
    defaultOgImage ${imageFields}
  },
  "navigation": *[_type == "navigation"][0] {
    headerLinks[] { label, href, openInNewTab, subLinks[] { label, href, openInNewTab } },
    footerLinks[] { label, href, openInNewTab, subLinks[] { label, href, openInNewTab } }
  }
}`;

// ─── Ana Sayfa ─────────────────────────────────────────────────────────────────

export const homePageQuery = groq`*[_type == "homePage"][0] {
  heroTitle,
  heroPrimaryCta { label, href },
  heroWhatsappLabel,
  galleryTitle, gallerySubtitle,
  galleryItems[] { _key, title, category, image ${imageFields} },
  pricingTitle, pricingSubtitle, pricingCtaLabel, pricingPtNote,
  aboutTitle, aboutBody,
  aboutImage ${imageFields},
  reviewsTitle, reviewsSubtitle,
  faqTitle, faqSubtitle,
  locationTitle,
  seo
}`;

export const pricingPlansQuery = groq`*[_type == "pricingPlan"] | order(order asc, _createdAt asc) {
  _id, duration, price, note
}`;

export const reviewsQuery = groq`*[_type == "review"] | order(order asc, _createdAt desc) {
  _id, author, rating, text, date
}`;

export const faqsQuery = groq`*[_type == "faq"] | order(order asc, _createdAt asc) {
  _id, question, answer
}`;

// Date filtering happens client-side: the page is ISR-cached, so a server-side
// filter would keep an expired announcement on screen until the next revalidation.
export const announcementsQuery = groq`*[_type == "announcement"] | order(_createdAt desc) {
  _id, text, link, startsAt, endsAt
}`;

export const homeSitemapQuery = groq`*[_type == "homePage"][0] { _updatedAt, "noIndex": seo.noIndex }`;

// ─── Varsayılan SEO ────────────────────────────────────────────────────────────

export const defaultSeoQuery = groq`*[_type == "siteSettings"][0] {
  "title": defaultSeo.metaTitle,
  "description": defaultSeo.metaDescription,
  "ogImage": defaultOgImage,
  siteName,
  siteTagline,
  favicon { asset->{ _id, url } },
  googleSearchConsoleId
}`;

