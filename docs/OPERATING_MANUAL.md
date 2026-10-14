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
