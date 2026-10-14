# Punarnava — 7-minute investor demo

What this is: a click-by-click script for showing the app to an investor, live or on a call.
Every number below comes from `src/data/assumptions.ts` (base case = research file R2). If you change an assumption, re-check the numbers here before the next demo.

**Golden rule:** say "plan" or "projection", never "we do" or "we have". Punarnava is pre-revenue: no customers, partners, licences or signed suppliers yet. The app says so too. Don't contradict it.

---

## Before you start (2 minutes, do it before the call)

1. Double-click `start-os.bat` (private pages run only on your laptop; Vercel shows `/` and `/sources` only).
   Open the site on a laptop (Chrome, full screen, light theme reads best on projectors/screen-share).
2. Open two tabs:
   1. `/` (landing)
   2. `/os` (Punarnava OS). Visit **Factory** once (key **2**) so the 3D plant has loaded, then press **Restart**.
   Shortcut: from the OS, press **P** (or the **Present** button) for fullscreen presentation mode. **→ / ←** step through the story (Command → Factory → Money → Market → Execution), **H** hides the caption bar, **Esc** exits. Good for screen-sharing and recording.
3. Close other apps (the 3D view pauses when its tab is hidden, which is fine, but other tabs can slow it).
4. The private tabs are local only. On a call, share your screen; investors can't open `/os` themselves.

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

### 3:00–5:00 · The simulation: the showpiece (tab 2, Factory)
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

*(Optional: open `/os/factory?scenario=worst` to preload the combined stress case.)*

### 5:00–6:00 · The numbers behind it (Money)
**Money · Finance (`/os/money/finance`). Highlight:**
- Total funding envelope **₹279.7 L** = fixed capex **₹179.5 L** (±25% until vendor quotes) + deposit + working capital.
- The cash curve: lowest point about **₹6.6 L in month 9**, the first production month. "Working capital is the squeeze, and we've planned for it."

**Money · Scenarios (`/os/money/scenarios`).** Best / base / worst side by side, each checked against the simulation (they agree within about ₹1/kg).

### 6:00–7:00 · Risks, roadmap, the ask
**Click:** Execution · Risks (`/os/execution/risks`, risk matrix), then Execution · Roadmap (`/os/execution`, phases and investment gates).

**Say:**
> "Phase 1 money is released against gates: feedstock under written agreement, offtake letters, consent to operate. Today those are at zero, and the app shows that honestly."

**Back to the landing page → *The ask*.**
> "We're raising **₹[confirm amount] crore** to build the first line. Here's exactly what it pays for, and what it doesn't."

⚠️ The raise amount (**₹2.8 cr**) is still a **placeholder**. Confirm it before you say a number.

**Close:** "Happy to share the data room." Open Vault · Data room (`/os/vault`). It's an honest index: 9 documents available, LOIs and quotes marked *Not started*.

---

## Likely questions (short answers)

| Question | Answer |
|---|---|
| "Do you have customers?" | No. Pre-revenue. Offtake LOIs are a Phase 1 gate. |
| "Where do the numbers come from?" | Desk research (three reports) → one assumptions file. Each figure shows *Researched* / *Placeholder*; none are *Verified* yet. |
| "Why HDPE, not PET?" | PET bottle-to-flake is crowded and price-competitive; rigid HDPE pellets fit the Category I mandate. PET stays a later option. *(Decision D-001 is still "Proposed". Confirm your answer.)* |
| "What breaks the model?" | All three shocks at once. Also feedstock contracts. See Execution · Risks. |
| "Is this secure?" | The working model runs only on my machine and is not deployed. Investors see the public page; I share the rest on screen or in the data room. |

---

## ✅ Before sharing with investors (checklist)

Do these in order. Each one takes a minute or two.

### 1. Check what is public
1. In Vercel → **Settings** → **Environment Variables**, set (Production): `NEXT_PUBLIC_CONTACT_EMAIL` and, optionally, `NEXT_PUBLIC_SITE_URL`. Redeploy after changes.
2. In a private window, open the live site: `/` and `/sources` load; `/os` (and the old `/sim`, `/lab`, `/admin`) all show "not found". There is no login: those routes are simply not deployed.

### 2. Fix or label placeholders
Open Vault · Assumptions (`/os/vault/assumptions`) → **Browse every assumption** → filter **Placeholder** (currently **30 of 198**). The ones an investor will see:
- [ ] `raise_amount`: **₹2.8 cr** is a placeholder. Confirm the real ask (shows in the hero and *The ask*).
- [ ] `subsidy_assumed_pct`: 0% (conservative; keep unless you have a sanction).
- [ ] `signed_feedstock_pct`, `signed_offtake_pct`: 0%. True today; update when agreements are signed.
- [ ] `kspcb_consent_days`: 90 days (planning guess).
- [ ] Hiring lead times (2): planning guesses.
- The other 23 are simulation modelling choices (truck count, payloads…). Fine as labelled.

Also check:
- [ ] Decision **D-001** (base case: rigid HDPE, feedstock-first): change from *Proposed* to *Decided* in `src/data/lab/decisions.ts` once you're sure.
- [ ] **Team** section on the landing page: founder only. Add real names/roles only when people have actually agreed.
- [ ] No figure has a source *link* yet (Vault · Research gaps has ready-made prompts to fill them in).

### 3. Final look
- [ ] Share the link in WhatsApp to yourself: you should see the Punarnava preview card (title, line, loop logo).
- [ ] Open the live site on your phone: the landing page and `/sources`.
- [ ] Contact form opens your email app with the right address.
- [ ] Share only the public link. Private pages stay on your laptop.
