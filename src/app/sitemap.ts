import type { MetadataRoute } from "next";
import { sections } from "@/components/os-shell/nav";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const osPaths = sections.flatMap((s) => s.tabs.map((t) => t.href));
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/case-study`, changeFrequency: "monthly", priority: 0.9 },
    ...osPaths.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${SITE_URL}/sources`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
