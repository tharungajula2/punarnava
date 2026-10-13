# PUNARNAVA — Project Blueprint (Claude Code reads this every session)

## 1. Who I am and how to work with me
- Founder, Bangalore, India. Complete beginner in coding, plastic recycling and business jargon. I do not write code.
- I'm on Windows. Project folder: D:\punarnava
- You lead; I approve. Explain in plain English, one line per jargon term the first time.
- Whenever I must do something myself (terminal, GitHub, Vercel, env vars): numbered steps, exact clicks/commands, what I should see, what to paste back if it fails.
- Keep updates short (2–3 lines). No long intros. Save usage: don't re-read files you already know, don't rewrite whole files for small changes.
- Stop and warn me before anything destructive (deleting files, force-push, resetting history) or anything that would expose secrets.

## 2. The venture
**Punarnava** (Sanskrit: "that which becomes new again") — a plastic recycling business being set up in Bangalore.
Value chain: collect waste plastic → sort by type → shred → wash → dry → extrude → pellets → sell pellets to manufacturers + sell EPR credits to brands.
(EPR = Extended Producer Responsibility: Indian rules that make brands responsible for their plastic waste and push recycled content. Recyclers earn certificates brands buy.)
Starting focus is not final; research files in /research decide it. Never assume — read /research first.

## 3. What we're building
One web app = investor pitch + founder's private operating system. Four tracks:

| Track | Route | Access |
|---|---|---|
| Landing page (investor pitch) | `/` | Public |
| OS (operating system) | `/os/*` | Private |
| Simulation (factory digital twin) | `/sim` | Private |
| R&D wing (business research only — no science/patents) | `/lab/*` | Private |
| Admin | `/admin` | Owner only |
| Login | `/login` | Public |

## 4. Access control (no database for now)
- Next.js `middleware.ts` protects `/os`, `/sim`, `/lab`, `/admin`.
- Two roles via passwords in environment variables:
  - `OWNER_PASSWORD` → role `owner`: everything incl. `/admin` and private notes.
  - `INVESTOR_PASSWORD` → role `investor`: read-only view of `/os`, `/sim`, `/lab`. No `/admin`, no items marked `ownerOnly`.
- On login, set an httpOnly, secure, sameSite=lax cookie containing a signed token (HMAC via `jose`, secret `SESSION_SECRET`), 7-day expiry. Logout clears it.
- Changing `INVESTOR_PASSWORD` in Vercel revokes all investor access.
- Basic login throttling (delay after failed attempts). Generic error messages.
- Private content and owner-only data live in server-only modules (`import "server-only"`), rendered by Server Components, so they are never shipped to public pages.
- Secrets only in `.env.local` (gitignored) and Vercel env vars. Never in code, commits or chat. Provide `.env.example` with empty values.
- Show a subtle "Investor view" badge when role = investor.
- This is password protection, not encryption. Don't describe it as encryption.

## 5. Tech stack
- Next.js (App Router) + TypeScript (strict), deployed on Vercel from GitHub.
- Tailwind CSS + shadcn/ui + Framer Motion + lucide-react icons.
- Charts: Recharts.
- 3D: three + @react-three/fiber + @react-three/drei.
- State: Zustand.
- No database yet (Supabase may come later — keep data access behind a small `src/lib/data` layer so swapping is easy).
- Use current official docs; if unsure about an API, check docs rather than guess.

## 6. Folder structure
```
/research        ← market research markdown files (from ChatGPT deep research). Source of truth for numbers.
/src/app         ← routes
/src/components  ← UI (ui/, landing/, os/, sim/, lab/)
/src/sim         ← simulation engine (pure TypeScript, no React)
/src/data        ← assumptions.ts and other typed data
/src/lib         ← auth, utils, data layer
/public          ← images/icons (original only)
```

## 7. Numbers & honesty (NON-NEGOTIABLE)
- Every number used anywhere (landing, OS, sim, lab) comes from `src/data/assumptions.ts`. One source of truth.
- Each entry: `{ id, label, value, unit, category, source, sourceUrl?, confidence: "low"|"medium"|"high", status: "placeholder"|"researched"|"verified", notes?, ownerOnly? }`.
- If research hasn't provided a value yet: use a clearly-labelled placeholder (status "placeholder") — never invent a figure presented as fact.
- UI shows a small badge per number (Placeholder / Researched / Verified) in private areas; landing page shows a footnote "Projections based on stated assumptions".
- Never fabricate traction, customers, partners, testimonials, logos, awards or press.

## 8. Design system
- Brand feel: premium, calm, confident, "circular economy" without eco-clichés (no leaf-and-recycling-arrow clip art).
- Palette (tokens in Tailwind/CSS variables, light + dark): deep teal (primary), mint (accent), warm sand (secondary), near-black ink, off-white paper. Data colours distinct and accessible.
- Type: elegant display serif for headlines (e.g., Fraunces) + clean sans for UI (e.g., Inter). Via next/font.
- 8px spacing grid, generous whitespace, soft shadows, rounded-2xl cards, glassy floating panels in the sim.
- Motion: subtle, purposeful (Framer Motion), respects prefers-reduced-motion.
- Every screen needs loading, empty and error states. Fully responsive (360px → 1920px). Lighthouse performance ≥ 90 on landing.
- Original logo: simple wordmark + abstract loop mark, built as SVG in code.

## 9. Landing page sections
Hero (one-line promise + subtle animated loop/3D teaser) → The problem (plastic waste, India/Bangalore) → Why now (regulation tailwind, EPR) → How Punarnava works (animated value chain) → Business model (pellets + EPR credits) → Unit economics snapshot (from assumptions) → Phased roadmap → Why us / team → The ask (investment use of funds) → Contact (mailto + form that opens email; no backend) → Footer.
All copy crisp, investor-grade. Section content driven by `src/data/landing.ts`.

## 10. OS modules (`/os`)
Dashboard (KPIs, roadmap progress) · Feedstock & suppliers · Inbound logistics · Plant operations · Quality · Inventory · Sales & buyers · EPR credits · Compliance & licences tracker · Finance (capex, opex, P&L, cash flow from assumptions) · Hiring plan · Roadmap & tasks.
For now: driven by typed data files + assumptions; realistic structure, clearly marked sample data where real data doesn't exist.

## 11. Simulation (`/sim`) — the showpiece
**Engine** (`/src/sim`, pure TS): discrete-time simulation, deterministic + seedable, independent of rendering, unit-tested.
Flow: collection points (Bangalore map, stylised) → inbound trucks → weighbridge → bale yard → sorting line → shredder → wash line (float-sink) → dryer → extruder → pelletizer → QC lab → packing → finished goods → outbound trucks to buyers.
State per machine: status (running/idle/down/maintenance), throughput, utilisation, energy.
KPIs: tonnes in/out, yield %, energy kWh/t, water use, uptime, inventory per stage, cost/kg, revenue, margin/kg, EPR credits generated, cash.
Controls: play/pause, speed 1x→1000x, day/night cycle, scenario sliders (feedstock price, pellet price, throughput, shifts, power tariff, contamination %), events (machine breakdown, monsoon supply dip, price shock).

**Visual layer** (react-three-fiber):
- Isometric orthographic camera, low-poly procedural models built in code (trucks, forklifts, bales, machines, conveyors, silos, buildings, trees). No copied or branded assets.
- Pastel/brand palette, soft shadows, ambient occlusion feel, smooth camera pan/zoom/rotate + reset.
- Moving trucks along paths, forklifts carrying bales, material visibly flowing on conveyors, machine status lights.
- Floating glass UI: top KPI cards, right detail panel on click (any truck/machine/zone), bottom "batch tracking" timeline (Received → Sorted → Washed → Pelletized → QC → Dispatched), bottom-right tabs (Docks / Machines / Trucks).
- Performance: instanced meshes, 60fps on a normal laptop, graceful fallback on mobile (2D schematic view).
- Build order: engine + 2D schematic first (numbers correct), then 3D.

## 12. R&D wing (`/lab`) — business only
Market overview · Competitor map · Pricing intelligence · Unit-economics model (interactive) · Scenario planner (best/base/worst) · Risk register · Investor data room (documents list, owner-only notes) · Decision log.
Content comes from `/research/*.md` and `assumptions.ts`. Show sources.

## 13. Build phases (update the checklist as you go)
- [x] Phase 1 — Setup: Next.js app, design system, layout, logo, Git + GitHub connected
- [ ] Phase 2 — Landing page (complete, polished, responsive) + deploy to Vercel
- [ ] Phase 3 — Login, roles, middleware protection, private layouts (OS/Sim/Lab/Admin shells)
- [ ] Phase 4 — Assumptions system + Admin assumptions viewer
- [ ] Phase 5 — Simulation engine + tests + 2D schematic view
- [ ] Phase 6 — 3D simulation visual layer
- [ ] Phase 7 — OS modules
- [ ] Phase 8 — R&D wing (import /research)
- [ ] Phase 9 — Polish, performance, security review, investor demo script

## 14. Rules for every session
- Start: read this file + `## Progress log`, state the phase and plan, wait for "go" (plan mode).
- End: update the checklist and progress log below, run build/lint, fix errors, commit with a clear message, push to GitHub.
- One phase per session. If context gets long, tell me to start a fresh session.

## Progress log
- 2026-10-13 · Phase 1 · Next.js 16.4 (App Router, TS strict, Tailwind v4, Turbopack, cacheComponents on) + shadcn/ui (base-nova, Base UI primitives) + motion (Framer Motion's current package name), lucide, recharts, zustand, three/r3f/drei, jose, server-only, next-themes installed. Brand tokens (teal/mint/sand/ink/paper, light+dark, chart + status colours, `.glass` panel, soft shadows) in `globals.css`; Fraunces + Inter + Geist Mono via next/font; loop-mark logo (`components/brand/logo.tsx`, `app/icon.svg`); header/footer/container/theme toggle; temporary design-system preview at `/`; `.env.example`; git connected to github.com/tharungajula2/punarnava. NOTE for Phase 3: Next 16 renamed `middleware.ts` → `proxy.ts` (read `node_modules/next/dist/docs` first). `/research` is still empty — research files needed before Phase 2 copy/numbers. Next: Phase 2 landing page.
