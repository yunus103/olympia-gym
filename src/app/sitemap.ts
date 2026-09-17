import { MetadataRoute } from "next";
import { cachedFetch } from "@/sanity/lib/client";
import { homeSitemapQuery } from "@/sanity/lib/queries";
import { getSiteUrl } from "@/lib/utils";

type SitemapPage = {
  _updatedAt?: string;
  noIndex?: boolean;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const home = await cachedFetch<SitemapPage | null>(homeSitemapQuery, {}, { next: { tags: ["home"] } });

  if (home?.noIndex) return [];

  return [
    {
      url: base,
      lastModified: home?._updatedAt ? new Date(home._updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
