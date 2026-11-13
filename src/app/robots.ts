import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Served at /robots.txt. Lets Google index the shop, keeps admin, cart and orders out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/cart", "/checkout", "/order"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
