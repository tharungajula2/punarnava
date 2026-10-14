// Vercel deploys ONLY the public site (/ and /sources).
// When the VERCEL env var is set, delete the private route group before
// `next build`, so /os, /sim, /lab and /admin are not built or shipped at all.
// Locally (no VERCEL var) this does nothing, so `npm run dev` shows everything.
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

if (process.env.VERCEL) {
  const dir = join(process.cwd(), "src", "app", "(private)");
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log("[prune-private] VERCEL build: removed src/app/(private)");
  }
} else {
  console.log("[prune-private] local build: keeping private routes");
}
