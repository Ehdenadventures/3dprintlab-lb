import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getCategories, getPosts, getProducts } from "@/lib/data";

// Served at /sitemap.xml. Submit this address in Google Search Console > Sitemaps.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, posts] = await Promise.all([getCategories(), getProducts(), getPosts()]);
  const u = (path: string) => `${site.url}${path}`;
  return [
    { url: u("/"), changeFrequency: "daily", priority: 1 },
    { url: u("/custom"), changeFrequency: "monthly", priority: 0.5 },
    { url: u("/ig"), changeFrequency: "weekly", priority: 0.5 },
    ...categories.map((c) => ({ url: u(`/c/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: u(`/p/${p.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: u(`/ig/${p.number}`), changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
