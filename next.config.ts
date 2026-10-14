import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  poweredByHeader: false,
  // Baseline security headers on every response.
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
  // Old routes → Punarnava OS.
  async redirects() {
    const map: [string, string][] = [
      ["/sim", "/os/factory"],
      ["/admin", "/os/vault/assumptions"],
      ["/admin/assumptions", "/os/vault/assumptions"],
      ["/lab", "/os"],
      ["/lab/market", "/os/market"],
      ["/lab/competitors", "/os/market/competitors"],
      ["/lab/pricing", "/os/market/pricing"],
      ["/lab/unit-economics", "/os/money"],
      ["/lab/scenarios", "/os/money/scenarios"],
      ["/lab/risks", "/os/execution/risks"],
      ["/lab/data-room", "/os/vault"],
      ["/lab/decisions", "/os/execution/decisions"],
      ["/lab/research-gaps", "/os/vault/research-gaps"],
      ["/os/feedstock", "/os/operations"],
      ["/os/logistics", "/os/operations"],
      ["/os/quality", "/os/operations/plant"],
      ["/os/inventory", "/os/operations/stock-sales"],
      ["/os/sales", "/os/operations/stock-sales"],
      ["/os/epr", "/os/operations/epr"],
      ["/os/finance", "/os/money/finance"],
      ["/os/compliance", "/os/execution/licences"],
      ["/os/hiring", "/os/execution/hiring"],
      ["/os/roadmap", "/os/execution"],
    ];
    return map.map(([source, destination]) => ({ source, destination, permanent: false }));
  },
  partialPrefetching: true,
  experimental: {
    // Inline the (small, Tailwind) stylesheet into the HTML so first paint
    // doesn't wait for a render-blocking CSS request. Biggest mobile Lighthouse win.
    inlineCss: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
