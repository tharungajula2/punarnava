# Punarnava

> **A concept-stage case study in circular economy design:** an interactive proposal for turning post-consumer rigid plastic into recycled pellets.

Punarnava pairs a concise project presentation with a guided factory walkthrough. It explores how a proposed recycling plant might be arranged and how material could move through it. The plant does not exist; the figures and workday are illustrative models, not operating results.

| | |
|---|---|
| **Project type** | Sustainability concept and interactive web prototype |
| **Maturity** | Concept study; no operating facility or production data |
| **Current routes** | [Presentation](src/app/page.tsx) · [Factory walkthrough](src/app/factory/page.tsx) |
| **Core stack** | Next.js App Router, React, TypeScript, Tailwind CSS, Three.js / React Three Fiber |

## What is implemented

- A public-facing project narrative covering the problem, proposed process, modelled economics, and staged plan.
- An interactive proposed factory, with a guided tour, selectable work areas, an animated illustrative workday, and an SVG layout fallback.
- A deterministic, seeded TypeScript process model that moves simulated material through plant stages and feeds the 3D scene.
- A typed assumption catalogue that supplies the presentation and the factory model.

## Technical highlights

- **The model is separate from the renderer.** The process engine lives in `src/sim/`; the 3D scene reads its state through a small Zustand store.
- **The visual has a fallback.** Small screens and browsers without usable WebGL can show the selectable 2D plan.
- **Figures are labelled as planning material.** They are based on research notes and assumptions, not supplier quotes, signed contracts, regulatory approvals, or plant measurements.

## Run locally

Prerequisites: a compatible Node.js installation and npm. The repository includes `package-lock.json` for a lockfile-based install.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. On Windows, `start-os.bat` starts the development server and opens the factory route. Available checks are `npm run lint`, `npm test`, and `npm run build`; they have **not** been run as part of this documentation update.

There is no screenshot committed with this README and no hosted demo URL has been verified. Check the current deployment manually before sharing a Vercel link.

## Scope and limitations

- This is a **concept and portfolio prototype**, not an operating recycling business, digital twin of a real facility, engineering plan, or investment forecast.
- The factory geometry is drawn in code from a stylised layout. It is not CAD, BIM, or a buildable site plan.
- The application has no account system, database, live plant connection, or current contact-form submission flow.
- Research references are recorded in the project, but source links and independent verification are incomplete.
- Older OS, lab, and investor-demo materials remain in the repository as historical work; they do not describe the current public routes.

## Project manual

For the architecture, model logic, assumptions, setup, troubleshooting, limitations, and extension notes, see **[PROJECT_BLUEPRINT.md](PROJECT_BLUEPRINT.md)**.
