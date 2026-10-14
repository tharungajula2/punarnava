import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only the landing page is public. Private areas also send noindex headers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/os", "/sim", "/lab", "/admin", "/login"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
