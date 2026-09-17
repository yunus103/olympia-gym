import type { PortableTextBlock } from "@portabletext/react";

/**
 * Global TypeScript interfaces for Sanity documents and models.
 * Ensures strict typing, autocomplete, and zero warnings in IDE.
 */

export interface SanityImage {
  asset: {
    _ref?: string;
    _id?: string;
    url?: string;
    metadata?: {
      lqip?: string;
      dimensions?: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
  alt?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface SanitySlug {
  current: string;
  _type?: "slug";
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  whatsappNumber?: string;
  mapIframe?: string;
  mapsUrl?: string;
}

export interface OpeningHour {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface SiteSettings {
  siteName: string;
  siteTagline?: string;
  logo?: SanityImage;
  logoHeight?: number;
  favicon?: { asset: { url: string } };
  contactInfo?: ContactInfo;
  googleRating?: number;
  googleReviewCount?: number;
  openingHours?: OpeningHour[];
  socialLinks?: SocialLink[];
  gaId?: string;
  gtmId?: string;
  googleSearchConsoleId?: string;
  defaultSeo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  defaultOgImage?: SanityImage;
}

export interface NavItem {
  label: string;
  href: string;
  openInNewTab?: boolean;
  subLinks?: NavItem[];
}

export interface Navigation {
  headerLinks?: NavItem[];
  footerLinks?: NavItem[];
}

export interface SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImage;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export type GalleryCategory = "freeWeights" | "machines" | "cardio" | "general";

export interface GalleryItem {
  _key: string;
  title?: string;
  category?: GalleryCategory;
  image: SanityImage;
}

export interface PricingPlan {
  _id: string;
  duration: string;
  price: number;
  note?: string;
}

export interface Review {
  _id: string;
  author: string;
  rating: number;
  text: string;
  date?: string;
}

export interface Faq {
  _id: string;
  question: string;
  answer: string;
}

export interface Announcement {
  _id: string;
  text: string;
  link?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface HomePage {
  heroTitle: string;
  heroPrimaryCta?: { label?: string; href?: string };
  heroWhatsappLabel?: string;
  galleryTitle?: string;
  gallerySubtitle?: string;
  galleryItems?: GalleryItem[];
  pricingTitle?: string;
  pricingSubtitle?: string;
  pricingCtaLabel?: string;
  pricingPtNote?: string;
  aboutTitle?: string;
  aboutBody?: PortableTextBlock[];
  aboutImage?: SanityImage;
  reviewsTitle?: string;
  reviewsSubtitle?: string;
  faqTitle?: string;
  faqSubtitle?: string;
  locationTitle?: string;
  seo?: SeoSettings;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}
