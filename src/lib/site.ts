// Public base URL for absolute links (Open Graph, sitemap, robots).
// Set NEXT_PUBLIC_SITE_URL once you have a custom domain; on Vercel the
// production URL is used automatically.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
