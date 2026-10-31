# Punarnava — Current Operating Guide

This guide covers the current concept presentation and factory walkthrough. The application has no account system, private routes, or backend. Do not put confidential material in this public repository.

## 1. Start the application

Prerequisites: compatible Node.js and npm. From the repository root:

```bash
npm ci
npm run dev
```

Wait until Next.js reports that the development server is ready, then open `http://localhost:3000`. On Windows, `start-os.bat` starts the server and opens `/factory` after a short delay. The helper expects the default port; if Next.js prints another port, open that address yourself.

## 2. Current pages

| Path | What it contains |
|---|---|
| `/` | The project story, proposed process, illustrative economics, and future gates |
| `/factory` | A selectable plan, an illustrative animated workday, a guided tour, and free 3D exploration where WebGL is available |
| `/os`, `/os/factory`, `/sim` | Redirect to `/factory` |
| `/sources` | Not implemented as a current route |

The 3D view is designed for desktop browsers that support WebGL. Small screens or browsers without usable WebGL receive the SVG plan. The animation is generated from a seeded local model; it is not real plant data.

## 3. Environment and project checks

The optional variables in `.env.example` include `NEXT_PUBLIC_SITE_URL` for public metadata. `NEXT_PUBLIC_CONTACT_EMAIL` is listed there, but no current contact form or code use was found. Do not configure it expecting a working enquiry flow.

Commands defined by the project:

- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npm run build` — production build
- `npm start` — serve a completed build

A documentation update does not imply that these checks have been run. If a future task calls for them, record which commands completed and their results.

## 4. Common issues

- **The app does not start:** confirm Node.js and npm are available, then run `npm ci` from the repository root.
- **Port 3000 is busy:** stop the other server or open the port shown in the terminal.
- **The 3D view does not load:** use the **Layout plan** view or a WebGL-capable desktop browser.
- **A guide mentions the OS or Vault:** it is historical. The current routes are `/` and `/factory`.
- **A Vercel link fails:** deployment status is unverified. Check the URL manually before sharing it.

## 5. Change and release discipline

Review documentation changes in a branch and inspect the full diff. Do not automatically commit or push. Stage, commit, and push only after the project owner explicitly approves the reviewed changes.

<details>
<summary>Historical operating manual — retired OS instructions preserved for reference</summary>

The text below is the previous manual. Its OS sections, keyboard commands, local-only claims, and route directions are obsolete and must not be followed as current instructions.
# Punarnava — Operating Manual (plain English)

## 1. Start the OS
1. Double-click **`start-os.bat`** in the project folder (or the shortcut).
2. A black window opens. Leave it open. After about 10 seconds your browser opens `http://localhost:3000/os`.
3. To stop: close the black window.
If it fails: open the folder in a terminal, run `npm install` once, then try again.

## 2. The 7 sections (keys 1–7, Ctrl+K searches everything)
1. **Command** — five key numbers, plant status, phase progress, top risks, next actions.
2. **Factory** — the live simulation. T = guided tour, C = cinematic, events for breakdown / monsoon / price shock.
3. **Money** — unit economics, finance (capex, cash flow), scenarios best/base/worst.
4. **Operations** — supply, plant & quality, stock & sales, EPR credits.
5. **Market** — market size, competitors, pricing.
6. **Execution** — roadmap, licences, hiring, risks, decisions.
7. **Vault** — data room, every assumption, sources, research gaps.

Press **P** for presentation mode.

## 3. Change a number
Every number lives in `src/data/assumptions.ts`. Never type a number into a page.
Find the entry `id` in OS → Vault → Assumptions, then paste this into Claude Code:

> Read CLAUDE.md. In `src/data/assumptions.ts` change the entry `<id>` to `<new value>`. Set status, source and confidence honestly. Run tests and build, then commit.

## 4. Change the landing page and redeploy
Paste into Claude Code:

> Read CLAUDE.md. On the landing page, change <what you want>. Text lives in `src/data/landing.ts`. Check the build and commit.

Then push to GitHub. Vercel redeploys on its own in 1–2 minutes. Only `/` and `/sources` are published; the OS never goes online.

## 5. Start a new Claude Code session safely
1. Make sure the last session ended with a commit (`git status` should be clean).
2. Open the project folder in a new session. Claude reads `CLAUDE.md` automatically.
3. Say: "Read CLAUDE.md and the progress log. Plan first, wait for my go." One task per session.
4. Never ask it to add a login, delete history, or force-push. If it proposes something destructive, say no.
5. Secrets (keys, passwords) go only in `.env.local`, never in chat or code.


</details>
