# Punarnava — 7-minute investor demo

What this is: a click-by-click script for showing the app to an investor, live or on a call.
Every number below comes from `src/data/assumptions.ts` (base case = research file R2). If you change an assumption, re-check the numbers here before the next demo.

**Golden rule:** say "plan" or "projection", never "we do" or "we have". Punarnava is pre-revenue: no customers, partners, licences or signed suppliers yet. The app says so too. Don't contradict it.

---

## Before you start (2 minutes, do it before the call)

1. Open the site on a laptop (Chrome, full screen, light theme reads best on projectors/screen-share).
2. Open four tabs, in this order:
   1. `/` (landing)
   2. `/sim` (wait until the 3D plant has loaded, then press **Restart**)
   3. `/os/finance`
   4. `/lab/scenarios`
3. Close other apps (the 3D view pauses when its tab is hidden, which is fine, but other tabs can slow it).
4. If you're in `locked` mode, sign in with the **investor** password first so you see exactly what they'll see.

---

## The script

### 0:00–1:00 · Landing page: the story (tab 1)
**Click:** nothing at first. Let the hero sit for a moment, then scroll slowly.

**Say:**
> "Punarnava means *that which becomes new again*. We're planning a plant in Bengaluru that turns post-consumer rigid plastic into traceable recycled HDPE pellets."

**Scroll to *The problem* and *Why now*. Highlight:**
- Bengaluru generates **500–900 t/day** of plastic waste (two official estimates, not an audited study).
- EPR (Extended Producer Responsibility) now *requires* brands to put recycled plastic into rigid (Category I) packaging, rising to **60% by FY2028-29**. "Demand is being written into law."

### 1:00–2:00 · How it works + business model
**Scroll to *How Punarnava works*, then *Business model*.**

**Say:**
> "Two revenue lines: we sell pellets to manufacturers, and we sell EPR certificates to brands, once we're registered and audited."
> "We start feedstock-first: secure clean supply, then run a single 5-tonne-a-day line."

### 2:00–3:00 · Unit economics
**Scroll to *Unit economics*. Highlight (steady state, base case):**
- Revenue **₹10.37 cr/yr**, EBITDA (operating profit before interest, tax and depreciation) **₹1.86 cr/yr** (~**18%** margin).
- About **₹14.9 per kg** of EBITDA; **₹13.8/kg even with zero EPR income**.
- Break-even at about **45%** of capacity.

**Say the honest part out loud (investors trust it):**
> "This survives any one shock (feedstock +20%, yield −5 points, or price −10%) but not all three at once. That's on the page."

Point at the footnote: *"Projections based on stated assumptions"*, and the **Sources & assumptions** link: every figure has a source.

### 3:00–5:00 · The simulation: the showpiece (tab 2)
**Click:** **Play**, then **60×**. Let it run ~10 seconds.

**Say:**
> "This is a digital twin of the plant, running our real assumptions minute by minute: trucks from collection points, weighbridge, sorting, shredding, washing, extrusion, QC, dispatch."

**Click:** a machine (e.g. the **extruder**) → the right panel shows status, throughput, utilisation and energy.
**Click:** **+1 day** twice so the KPI strip fills up (click **All KPIs** on the strip to show all 12). **Highlight:**
- Yield around **80%** (bales in → pellets out)
- Energy around **310 kWh per tonne**
- Cost around **₹68 per kg**

**Then the "what if":** click **Breakdown** (event buttons; **Monsoon** and **Price shock** sit next to it), switch speed to **250×**, and watch output and cash dip, then recover.
> "We use this to stress-test decisions before we spend money: shifts, prices, contamination, a monsoon supply dip."

*(Optional: open `/sim?scenario=worst` to preload the combined stress case.)*

### 5:00–6:00 · The numbers behind it (tab 3, then tab 4)
**Tab 3, `/os/finance`. Highlight:**
- Total funding envelope **₹279.7 L** = fixed capex **₹179.5 L** (±25% until vendor quotes) + deposit + working capital.
- The cash curve: lowest point about **₹6.6 L in month 9**, the first production month. "Working capital is the squeeze, and we've planned for it."

**Tab 4, `/lab/scenarios`.** Best / base / worst side by side, each checked against the simulation (they agree within about ₹1/kg).

### 6:00–7:00 · Risks, roadmap, the ask
**Click:** `/lab/risks` (risk matrix), then `/os/roadmap` (phases and investment gates).

**Say:**
> "Phase 1 money is released against gates: feedstock under written agreement, offtake letters, consent to operate. Today those are at zero, and the app shows that honestly."

**Back to the landing page → *The ask*.**
> "We're raising **₹[confirm amount] crore** to build the first line. Here's exactly what it pays for, and what it doesn't."

⚠️ The raise amount (**₹2.8 cr**) is still a **placeholder**. Confirm it before you say a number.

**Close:** "Happy to share the data room." Open `/lab/data-room`. It's an honest index: 9 documents available, LOIs and quotes marked *Not started*.

---

## Likely questions (short answers)

| Question | Answer |
|---|---|
| "Do you have customers?" | No. Pre-revenue. Offtake LOIs are a Phase 1 gate. |
| "Where do the numbers come from?" | Desk research (three reports) → one assumptions file. Each figure shows *Researched* / *Placeholder*; none are *Verified* yet. |
| "Why HDPE, not PET?" | PET bottle-to-flake is crowded and price-competitive; rigid HDPE pellets fit the Category I mandate. PET stays a later option. *(Decision D-001 is still "Proposed". Confirm your answer.)* |
| "What breaks the model?" | All three shocks at once. Also feedstock contracts. See `/lab/risks`. |
| "Is this secure?" | Password-protected, read-only investor view. (It's password protection, not encryption.) |

---

## ✅ Before sharing with investors (checklist)

Do these in order. Each one takes a minute or two.

### 1. Lock the private areas
1. Go to **vercel.com** → your **punarnava** project → **Settings** → **Environment Variables**.
2. Set (for **Production**):
   - `AUTH_MODE` = `locked`
   - `OWNER_PASSWORD` = a long password only you know (16+ characters)
   - `INVESTOR_PASSWORD` = a *different* password you'll give investors
   - `SESSION_SECRET` = a random string of **at least 32 characters** (e.g. paste the output of `openssl rand -hex 32`, or use a password manager's generator)
   - `NEXT_PUBLIC_CONTACT_EMAIL` = the address the contact form should open
   - *(optional)* `NEXT_PUBLIC_SITE_URL` = your custom domain, e.g. `https://punarnava.in`, if you add one
3. **Redeploy**: **Deployments** → latest → **⋯** → **Redeploy**. Env changes only apply after a redeploy.
4. Test in a private/incognito window:
   - `/os` → should send you to the sign-in page.
   - Investor password → you see "Investor view · read-only", no **Admin** link.
   - Owner password → you can open `/admin`.

> To cut off all investors later: change `INVESTOR_PASSWORD` and redeploy. Every investor session ends.

### 2. Fix or label placeholders
Open `/admin/assumptions` → filter **Placeholder** (currently **30 of 198**). The ones an investor will see:
- [ ] `raise_amount`: **₹2.8 cr** is a placeholder. Confirm the real ask (shows in the hero and *The ask*).
- [ ] `subsidy_assumed_pct`: 0% (conservative; keep unless you have a sanction).
- [ ] `signed_feedstock_pct`, `signed_offtake_pct`: 0%. True today; update when agreements are signed.
- [ ] `kspcb_consent_days`: 90 days (planning guess).
- [ ] Hiring lead times (2): planning guesses.
- The other 23 are simulation modelling choices (truck count, payloads…). Fine as labelled.

Also check:
- [ ] Decision **D-001** (base case: rigid HDPE, feedstock-first): change from *Proposed* to *Decided* in `src/data/lab/decisions.ts` once you're sure.
- [ ] **Team** section on the landing page: founder only. Add real names/roles only when people have actually agreed.
- [ ] No figure has a source *link* yet (`/lab/research-gaps` has ready-made prompts to fill them in).

### 3. Final look
- [ ] Share the link in WhatsApp to yourself: you should see the Punarnava preview card (title, line, loop logo).
- [ ] Open the site on your phone: landing + `/os` + `/sim` (phones get the 2D view; that's intended).
- [ ] Contact form opens your email app with the right address.
- [ ] Don't share the **owner** password, and don't send passwords in the same message as the link.
