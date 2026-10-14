# Punarnava

A concept case study: a plastic-recycling venture for Bengaluru, taken from research to a landing page, a 7-section operating system and a 3D factory digital twin. Designed and built by Tharun Gajula with AI (Claude Code), in about two days. **Not an operating company.**

**Live:** _[add Vercel URL here]_

## Screenshots

_[landing page screenshot]_ · _[Factory 3D digital twin screenshot]_ · _[Money / unit economics screenshot]_

## What's inside

- **Landing page** (`/`): animated SVG story of the problem, regulation, value chain, economics and roadmap.
- **Case study** (`/case-study`): what was built, how, and the honest outcome.
- **Punarnava OS** (`/os`): seven sections (Command, Factory, Money, Operations, Market, Execution, Vault) with a Ctrl/Cmd+K palette and a presentation mode (press `P`).
- **3D digital twin** (`/os/factory`): a seeded, unit-tested simulation engine rendered with react-three-fiber, with a guided tour (`T`) and cinematic mode (`C`).
- **Assumptions engine** (`src/data/assumptions.ts`): every number has a source, confidence and status badge.

## Tech stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · react-three-fiber / drei · Recharts · Zustand · Vitest · deployed on Vercel.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # simulation and finance model tests
npm run build
```

On Windows, double-click `start-os.bat` to start the server and open the OS.

Optional env vars (see `.env.example`): `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`.

## Honesty note

All figures come from desk research and stated assumptions, labelled Placeholder / Researched / Verified. There is no revenue, no customers and no partners.
