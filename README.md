# Punarnava

A proposed Bengaluru plant for turning post-consumer rigid HDPE into recycled pellets. The site is a short investor presentation and a guided factory design walkthrough. **Punarnava is a concept, not an operating company.**

## What's inside

- **Investor presentation** (`/`): a concise visual story of the problem, opportunity, process, proposed business, risks and phased plan.
- **Factory walkthrough** (`/factory`): the animated 3D workday with trucks, forklifts, moving material and zone labels, plus an interactive plant plan, a guided tour, and the evidence gates for building it. The plan remains usable if 3D cannot start.
- **Archive** (`archive/`): the former OS, case study, sources and contact pages. Their routes were removed; the source remains in Git for later use.
- **Research model** (`research/`, `src/data/assumptions.ts`): planning inputs behind the illustrative figures. It is not presented as operating data.

## Tech stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · react-three-fiber / drei · Recharts · Zustand · Vitest.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # research-model and simulation tests
npm run build
```

On Windows, `start-os.bat` starts the server and opens the factory walkthrough.

Optional env vars are documented in `.env.example`.

## Honesty note

Figures are based on desk research and modelling, not audited results. The plant plan is a design proposal, not an engineering drawing. A real site, tested feedstock, buyer specifications, engineering, approvals and vendor quotations must shape the buildable plan.
