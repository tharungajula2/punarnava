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
- **`AUTH_MODE` env var (`"open"` | `"locked"`, default `"open"`; code in `src/lib/auth/mode.ts`).**
  - `open`: `/os`, `/sim`, `/lab`, `/admin` are reachable without login, everyone gets the full owner view, login link/sign-out/role badge are hidden, `/login` redirects to `/os`.
  - `locked`: the password protection described below works exactly as before.
  - **Do NOT re-add login barriers or delete the auth code** — it is kept intact for switching back to `locked`. All new private features must work in `open` mode without login and still call `getSession()`/`requireRole()` (they return an owner session in open mode).
  - Both modes: private routes send `noindex` (robots meta via the `(private)` layout + `X-Robots-Tag` header from `src/proxy.ts`).
  - Changing `AUTH_MODE` in Vercel needs a redeploy (the footer is statically built).
- The rest of this section describes `locked` mode:
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
- [x] Phase 2 — Landing page (complete, polished, responsive) + deploy to Vercel *(Vercel build fixed via vercel.json in Phase 3)*
- [x] Phase 3 — Login, roles, middleware protection, private layouts (OS/Sim/Lab/Admin shells)
- [x] Phase 4 — Assumptions system + Admin assumptions viewer
- [x] Phase 5 — Simulation engine + tests + 2D schematic view
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
- 2026-10-13 · Phase 2 · Read all 3 research files. **Strategy conflict flagged**: R1 recommends PET bottle → washed flakes; R2 recommends ~5 t/day rigid HDPE → pellets; R3 recommends feedstock network first, then polyolefin pellets. Landing base case = feedstock-first + 5 t/day rigid HDPE pellet line (founder to confirm; PET kept as Phase 4 option). Built `src/data/assumptions.ts` (63 typed entries, all `researched` except `raise_amount` = placeholder, helpers `v()`, `num()`, `money()`, `publicAssumptions()`) and `src/data/landing.ts` (all copy; every number via `v()`). Landing sections in `src/components/landing/*`: hero (pure-SVG animated loop, zero JS), problem, why now (EPR recycled-content bars), how it works (8-step flow), business model, unit economics (per-kg cost bar + stress test), roadmap with gates, why us/team (founder only, no invented bios), the ask (use of funds), contact (mailto form, needs `NEXT_PUBLIC_CONTACT_EMAIL`), collapsible sources table. Header nav + no-JS mobile menu, error/404 pages. Page is fully static; only client JS = motion reveals + contact form. Checked 360px (no overflow), light + dark. `.claude/launch.json` gained a `prod` preview config. Open items: founder to confirm strategy, raise amount, contact email, team names; run Lighthouse on the Vercel URL. Next: Phase 3 (login/roles via `proxy.ts`).
- 2026-10-13 · Phase 3 · **Vercel fix**: first deploy failed with "No Output Directory named public" because the project was detected as framework "Other"; added `vercel.json` with `"framework": "nextjs"`. **Auth**: `src/proxy.ts` (Next 16 name for middleware) guards `/os`, `/sim`, `/lab`, `/admin` and bounces signed-in users off `/login`; investors are redirected away from `/admin`. `src/lib/auth/token.ts` (jose HS256, 7-day, Web Crypto only so proxy can use it) stores role + an HMAC fingerprint of that role's password, so changing `OWNER_PASSWORD`/`INVESTOR_PASSWORD` revokes that role's sessions (tested). `src/lib/auth/actions.ts` = login/logout Server Actions: constant-time password compare, generic error, per-IP growing delay on failures (in-memory, per instance — a speed bump, not a lockout), httpOnly + sameSite=lax cookie (secure in production), `next` param restricted to private paths. `src/lib/auth/session.ts` (server-only) = `getSession()` / `requireRole()` for a second check in Server Components (used on `/admin`). Because `cacheComponents` is on, every session read sits inside `<Suspense>`; private pages are partial-prerendered shells. Private shell in `src/app/(private)/` (header with role badge — "Investor view · read-only" — theme toggle, sign out; sidebar on desktop, scrolling tab bar on mobile; loading + error states; noindex). Placeholder module cards for OS/Sim/Lab/Admin mark which phase builds them. Footer has a "Team sign-in" link. Tested locally: logged-out redirects, wrong password, investor vs owner, httpOnly cookie, logout, password-change revocation, 360px. Founder to set the 3 env vars locally + in Vercel. Next: Phase 4 (assumptions system + admin viewer).
- 2026-10-13 · AUTH_MODE · Added `AUTH_MODE` (`open` default | `locked`). Open = no login on /os,/sim,/lab,/admin, owner view, login UI hidden; locked = Phase 3 behaviour unchanged. noindex on private routes in both modes. See section 4. Founder must set AUTH_MODE=open in Vercel + redeploy.
- 2026-10-13 · Phase 4 · `assumptions.ts` now 100 entries (95 researched, 5 placeholder, 0 verified, 6 flagged `conflict`, owner-only `alternatives` category holds the PET/R3 options). No entry has a `sourceUrl`: the research files have no links — top research gap. Landing audited against /research and reworded: hero is future tense (pre-revenue), mandate scoped to rigid Category I + food-contact exemption, "only 3,117 processors" capacity implication removed, EPR certificates described as post-registration/audit and capped by capacity, economics title no longer claims it survives bad months (single shocks stay positive, all three do not), "operator" team claim removed, ask states what the round excludes, disclaimer carries "projections based on stated assumptions". New: `/admin/assumptions` (search, status filter, grouped by category, badges, source links, counts) and `src/data/research-gaps.ts` (9 ready-to-paste ChatGPT prompts, shown on the same page). Open: founder to confirm strategy (R1 PET vs R2 HDPE vs R3 network-first), raise amount. Next: Phase 5 (simulation engine).
- 2026-10-13 · Phase 5 · **Engine** `src/sim/` (pure TS, no React/Date/Math.random): `engine.ts` = `PlantSim`, fixed 1-minute steps, seeded mulberry32 RNG kept in state. Material moves as FIFO parcels tagged by lot (= truckload) through 9 buffers and 8 units (sorting → shredder → wash → dryer → extruder → pelletizer → QC hold → packing → finished goods); inbound trucks collect from 5 sample collection points, queue at one weighbridge; one outbound truck dispatches 5 t loads to sample buyers. Shifts (productive window then planned cleaning), Mon–Sat, random breakdowns (MTBF/MTTR), losses per R2 (11/4/5 %), energy split per machine, water, all R2 cost lines, payables (10 d) / receivables (21 d), EPR credits, cash. Events: breakdown, monsoon dip, price shock. `getKpis()` / `trailingUnitEconomics()` are the only KPI source; `truckPosition()` ready for Phase 6. `params.ts` (server-only) builds `SimParams` from assumptions.ts; the page passes plain numbers to the client so owner-only data never ships. `assumptions.ts` gained a `simulation` category (42 entries: 19 researched splits of R2, 23 placeholders = modelling choices); landing sources table excludes it. **Tests** (Vitest, `npm test`, 14): mass balance daily through events, cash ledger + profit = Δcash + receivables − payables, determinism, calibration (base case reproduces R2: 80% yield, 310 kWh/t, ₹68.2 cost/kg, ₹14.9 EBITDA/kg), scenario directions. **UI** `/sim` (`components/sim/`): Zustand store wraps the engine; rAF loop (1× = 1 sim-minute/s … 1000×), UI refresh ~10 Hz, charts ~2 Hz; animated SVG schematic with status lights, surge-bin levels, click-for-details; stylised Bengaluru network map with moving trucks; 12 KPI cards; 6 scenario sliders with status badges; event buttons + log; batch-tracking table; Recharts throughput / inventory / margin per kg / cash. Checked at 1440 px and phone width, no page overflow. Note: background browser tabs pause the sim (rAF). Next: Phase 6 (3D layer rendering engine state only).
