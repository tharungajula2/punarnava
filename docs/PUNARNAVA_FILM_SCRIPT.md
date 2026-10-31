# Punarnava — Current Concept Walkthrough

Use this as a short local presentation. It describes the current application, not a live deployment. No market, regulatory, financial, or performance claim here has been independently verified for this script.

## Before recording

Run the app locally with `npm ci` and `npm run dev`. Open `http://localhost:3000/` and `http://localhost:3000/factory`. Check the current interface in your own browser before recording. Do not add an unverified hosted URL.

## Three-minute narration outline

### 0:00–0:35 — The concept

“Punarnava is a concept-stage case study about a proposed rigid-plastic recycling plant. This is a design and software prototype, not an operating recycling company.”

Show the home-page opening and the project purpose.

### 0:35–1:15 — The process story

Scroll through the sections on the proposed process and business model. Explain the intended flow from incoming plastic through sorting, washing, processing, and pellets. Describe market and financial figures only as research inputs or assumptions; do not imply customers, contracts, approvals, or operating results.

### 1:15–2:35 — The factory walkthrough

Open `/factory`. Show the 2D plan first, then the animated factory if WebGL is available. Select a process stop and use the guided tour or free 3D exploration. Explain that the model advances locally and the geometry is stylised code, not a surveyed plant or digital twin.

### 2:35–3:00 — What would need proof

Close by naming the next evidence gates: real feedstock samples, buyer requirements, a site, qualified engineering, required approvals, and measured trial performance. These are future work, not accomplishments of this repository.

## Recording checklist

- Keep the “concept / illustrative” distinction visible.
- Avoid reusing figures or legal claims from the historical script without fresh source review.
- Do not claim that any hosted URL works until you check it manually.
- Do not show credentials or private browser content in a recording.

<details>
<summary>Historical film script — preserved, not approved for reuse</summary>

The previous script refers to retired OS routes and includes claims, figures, and presentation directions that have not been verified for the current application. Preserve it as project history; do not treat it as current factual or investor copy.
# PUNARNAVA — Film Script (read-aloud)

Read the **[SAY]** lines word for word. Do what **[SCREEN]** says first, then speak. **[PAUSE]** = stop talking for 3–5 seconds and let the picture breathe.
Full film: about 13 minutes. Every number below comes from `src/data/assumptions.ts` and matches the screen. Numbers marked ⚠ are planning estimates: say "our planning estimate" (already written into the lines).

---

## Scene 1 — Opening hook (0:45)
**[SCREEN]** Open `http://localhost:3000/` (landing page). Stay on the hero. Do not scroll yet.
**[SAY]**
"Hello. This is Punarnava. In Sanskrit, the word means 'that which becomes new again'.
We are setting up a plastic recycling company in Bangalore.
Our promise is simple. We turn waste plastic into clean pellets that factories can use again.
We are pre-revenue. We have no customers yet. What we have is a researched plan, a financial model, and a working simulation of our factory.
Let me show you all of it."
**[PAUSE]** 3 s on the hero loop.

## Scene 2 — The problem (1:15)
**[SCREEN]** Scroll slowly to "The problem" section. Let the India dot grid and the Bengaluru bar animate.
**[SAY]**
"India produces about 4.1 million tonnes of plastic waste a year. Karnataka alone is about 360 thousand tonnes. That is roughly 10 percent of the national total.
Bengaluru generates between 500 and 900 tonnes of plastic waste every single day.
Most of it is thin, flexible packaging. About 70 percent of consumer packaging is flexible. That kind is hard to recycle well.
Rigid plastic, like buckets, crates and drums, is different. It is easier to recycle well. That is where we start."
**[PAUSE]** on the flexible-versus-rigid split.

## Scene 3 — Why now (1:15)
**[SCREEN]** Scroll to "Why now". Let the staircase draw.
**[SAY]**
"One rule changes everything. It is called EPR. That stands for Extended Producer Responsibility. In plain words: the brands that put plastic into the market are legally responsible for taking it back.
For rigid plastic packaging, brands must use recycled content. 30 percent this financial year, then 40, then 50, then 60 percent by FY2029.
Brands cannot meet that on their own. They need recyclers.
Recyclers like us earn EPR certificates, which are proof of recycling, and brands buy them.
There are about 65 thousand registered brand owners and importers. And only about 3,100 registered processors. Demand is large. Organised, traceable supply is small."
**[PAUSE]**

## Scene 4 — What Punarnava does (1:30)
**[SCREEN]** Scroll to "How Punarnava works". Let the conveyor with bale, flake, pellet play.
**[SAY]**
"Here is the whole business in one line. Bale, then flake, then pellet.
We collect waste plastic as bales. A bale is a compressed block of waste.
We sort it, shred it into flakes, wash it, dry it, and melt it through an extruder. An extruder is a machine that melts plastic and pushes it out as strands.
The strands are cut into pellets. Pellets are small grains that a factory can feed straight into its moulding machines.
For every 100 kilos that comes in, about 80 kilos goes out as pellets. The rest is dirt, water and loss.
We earn money two ways."
**[SCREEN]** Scroll to "Business model" (revenue ribbons).
**[SAY]**
"First, we sell the pellets. Our planning price is 82 rupees a kilo.
Second, we sell EPR certificates to brands. Our planning figure is about 1 rupee 10 paise per kilo. That is the smaller stream, and we do not depend on it. Without it, the plant still earns 13 rupees 80 paise a kilo."
**[PAUSE]**

## Scene 5 — Enter the OS (1:00)
**[SCREEN]** Open `http://localhost:3000/os` (or run `start-os.bat`). Stay on **Command**.
**[SAY]**
"Now I will show you how we will run the company. This is Punarnava OS. It is my private operating system, and it only runs on my own computer.
It has seven sections on the left. Command, Factory, Money, Operations, Market, Execution and Vault.
This first screen is Command. Five key numbers, the status of the plant, our progress through the phases, the top three risks, and the next five actions.
Every number here is tagged. It says Placeholder, Researched or Verified, so we never pretend a guess is a fact."
**[PAUSE]**

## Scene 6 — The Factory (3:00)
**[SCREEN]** Press **2** → Factory. Wait for the loading screen to finish. Press **T** (Guided tour).
**[SAY]**
"This is the factory we plan to build, as a live simulation. It is not a video. Every truck, machine and kilo is calculated minute by minute.
I will start the guided tour."
**[SCREEN]** Let the tour run. Press **→** to move to each stop and read the caption aloud at your own pace. Typical stops: gate and weighbridge, unload bay and bale yard, sorting line, shredder, wash line, dryer, extruder and pelletizer, QC lab, packing and warehouse, effluent plant.
**[SAY]** (adapt as the stops appear)
"Trucks arrive at the gate and are weighed. A weighbridge is a big scale for vehicles.
Bales go into the yard. Then the sorting line, where we remove what is not the right plastic.
The shredder cuts it into flakes. The wash line separates by float and sink. Dirt sinks, plastic floats.
The dryer removes the water. The extruder melts it into strands and the pelletizer cuts the pellets.
The lab checks every batch. Then packing, the warehouse, and out to the buyer.
The effluent plant cleans the water so it can be reused. Water use is about 2 cubic metres per tonne.
The plant is designed for 5 tonnes a day, about 26 days a month, with about 21 people."
**[PAUSE]** 5 s during the wash line and extruder.
**[SCREEN]** Press **Esc** to leave the tour. Press **C** for Cinematic mode. Let it orbit for 15 seconds, then press **Esc**.
**[SAY]**
"This is the cinematic view. It simply lets you see the plant as a whole. Green lights are running. Amber is waiting. Red is a machine down."
**[PAUSE]** 10 s.
**[SCREEN]** Click the **Events** button in the left rail → **Monsoon supply dip**. Close the drawer and watch the bale yard and the KPI tiles for 20–30 seconds. Raise the speed in the control dock if it moves too slowly.
**[SAY]**
"Now I will trigger a monsoon. In the rainy season, waste collection drops.
Watch the bale yard. The stock falls, trucks come less often, and the machines start to wait.
This is why we simulate before we spend. We can see which risk hurts, before we put in any money."
**[PAUSE]** let the numbers move.

## Scene 7 — Money (1:45)
**[SCREEN]** Press **3** → Money. Stay on **Unit economics**. Then open the **Finance** tab, then **Scenarios**.
**[SAY]**
"Money. Unit economics means: what does one kilo cost to make, and what does it earn.
Our planning cost is about 68 rupees a kilo. The biggest piece is the plastic we buy, 47 rupees and 50 paise. Then labour, power, rent and the rest.
We sell at 82. The profit before interest and tax is about 14 rupees 90 paise a kilo.
Fixed project cost is about 1.8 crore rupees, plus about 83 lakh rupees of working capital. Working capital is the cash we need to buy plastic before we get paid.
The plant breaks even at about 44 percent of its capacity.
Simple payback at steady state is about one and a half years. Honestly, a realistic payback, including the slow ramp-up, is closer to three and a half years.
Here are the scenarios. The base case is the one I just described. In the worst case, plastic costs 20 percent more, yield falls by 5 points, and pellet price drops 10 percent. In that case the plant loses money, about minus 7 rupees 85 paise a kilo. We show this, because investors should see it."
**[PAUSE]** on the best / base / worst chart.

## Scene 8 — Operations (1:00)
**[SCREEN]** Press **4** → Operations. Click through **Supply**, **Plant**, **Stock & Sales**, **EPR credits**, about 10 seconds each.
**[SAY]**
"Operations is how we run day to day.
Supply: who sends us plastic, and how much.
Plant and quality: machine uptime, yield, and test results for every batch.
Stock and sales: what is in the warehouse and what is dispatched.
EPR credits: the certificates we earn and sell.
Please note: the supplier and buyer lists here are sample data, clearly marked. We have not signed anyone yet."
**[PAUSE]**

## Scene 9 — Market (1:00)
**[SCREEN]** Press **5** → Market. Then the **Competitors** tab.
**[SAY]**
"The Indian recycled plastics market is estimated at about 4.6 billion US dollars in 2026, growing to about 5.8 billion by 2031. In Karnataka alone it is about 4,300 crore rupees.
We have mapped twelve companies. They are mostly bigger, and many are strong in one step of the chain.
Our edge is not size. It is three things: a local rigid-plastic focus, traceable batches from bale to pellet, and a clean EPR certificate trail that brands can audit."
**[PAUSE]**

## Scene 10 — Execution (1:30)
**[SCREEN]** Press **6** → Execution. Show **Roadmap**, then **Licences**, **Hiring**, **Risks**.
**[SAY]**
"Execution is the plan.
Phase one, Prove. Months zero to nine. An 8-week live feedstock trial, and pellet samples to 5 converters. The gate to pass: 60 percent of feedstock and 50 percent of sales in written agreements.
Phase two, Build. About 8 months from locking a site. We lease a shed in the Nelamangala corridor, get pollution-board consent, install the line.
Phase three, Run. Years one to three. We plan 70, then 85, then 95 percent utilisation.
Phase four, Scale. Year three onward, up to about 10 tonnes a day.
Licences: twelve approvals are tracked. None has started yet. We are honest about that.
Top risks: plastic supply shortages, plastic price rising faster than pellet price, a cash squeeze in the first production months, and cheap virgin plastic pushing prices down.
How we handle them: sign supply before we build, keep cash buffers, and stage the plant behind gates."
**[PAUSE]** on the risk matrix.

## Scene 11 — The ask (1:00)
**[SCREEN]** Go back to the landing page `/` and scroll to "The ask". Let the donut draw.
**[SAY]**
"We are raising 2 crore 80 lakh rupees. ⚠ This round size is our planning estimate and is not final.
It pays for the processing line, a compliant site with effluent treatment, power connection, safety and permits, and working capital to buy plastic ahead of sales.
It does not include land purchase, financing cost, or early operating losses.
Our first milestone is the proof gate: signed supply and signed buyers. The second is consent to operate. The third is first pellets out of the plant."
**[PAUSE]**

## Scene 12 — Close (0:30)
**[SCREEN]** Scroll to "Contact" and then the footer.
**[SAY]**
"Punarnava means: made new again. That is what we want to do for plastic, for Bangalore's waste, and for brands that now must use recycled material.
If you are an investor, a collector, a converter or a brand, write to us. The email is on screen.
Thank you."
**[PAUSE]** hold 5 s, then stop recording.

---

# 3-minute short version (YouTube / LinkedIn)

1. **Hook (0:20)** — Landing hero. "This is Punarnava. We are building a plastic recycling company in Bangalore. We are pre-revenue, and I want to show you the plan."
2. **Problem + why now (0:40)** — Problem and Why-now sections. "Bengaluru makes 500 to 900 tonnes of plastic waste a day. New EPR rules force brands to use 30 to 60 percent recycled content in rigid packaging by FY2029. They need recyclers."
3. **What we do (0:30)** — How it works. "Bale, flake, pellet. 5 tonnes a day, about 80 percent comes out as pellets. We sell pellets and EPR certificates."
4. **Factory (0:50)** — OS → press 2 → T. "This is our factory as a live simulation. Every machine and truck is calculated." Trigger the monsoon dip briefly.
5. **Money (0:25)** — Press 3. "Planning profit is about 14.90 rupees a kilo. Break-even at about 44 percent capacity. The worst case loses money, and we show it."
6. **Ask + close (0:15)** — "We are raising 2.8 crore rupees, our planning estimate, to build the first plant. Write to us."

# 60-second elevator version

"Punarnava means 'made new again'. We are building a plastic recycling plant in Bangalore. Bengaluru makes 500 to 900 tonnes of plastic waste every day, and new EPR rules make brands responsible for it. We take rigid plastic bales, wash, melt and cut them into pellets, 5 tonnes a day, and we sell the pellets and EPR certificates. Our planning estimate is a profit of about 15 rupees a kilo, with break-even at 44 percent capacity. We are pre-revenue with no customers yet. We are raising about 2.8 crore rupees, our planning estimate, to build the first plant and prove supply and sales. We have already built a full financial model and a working simulation of the factory."

---

# Recording setup checklist
- [ ] Close notifications: Windows Focus assist ON. Close WhatsApp, email, Slack.
- [ ] Double-click `start-os.bat`. Wait about 10 seconds. Leave its window open (minimised).
- [ ] Browser: Chrome, full screen (**F11**), zoom **100%** (Ctrl+0), one tab only.
- [ ] Start on `http://localhost:3000/` (landing, follows your system theme). The OS opens in **dark mode** by default; keep it dark.
- [ ] Screen 1920×1080 if you can. Plug the laptop into power (3D runs smoother).
- [ ] Open the Factory once before recording so it is warmed up (it loads for a few seconds).
- [ ] Test the microphone. Record in a quiet room. Read slowly.
- [ ] Do a 30-second test recording and listen.

**Keyboard cheat-sheet**
| Key | Does |
|---|---|
| 1–7 | Jump to Command, Factory, Money, Operations, Market, Execution, Vault |
| Ctrl+K | Search / command palette |
| P | Presentation mode on/off (hides chrome and "Show details") |
| → ← Space | Next / previous step (presentation story and Guided tour) |
| H | Hide / show the caption bar (presentation) |
| T | Guided tour (Factory) |
| C | Cinematic mode (Factory) |
| F | Full screen (Factory) |
| Esc | Leave tour / cinematic / presentation |

---

# Before showing anyone — placeholder and weak numbers
Say these as "our planning estimate". They appear in the film.
- [ ] **Raise amount ₹2.8 crore** — placeholder (round not final).
- [ ] **Signed feedstock 0%** and **signed offtake 0%** — placeholders (nothing signed yet).
- [ ] **Capital subsidy 0%** — placeholder (none assumed).
- [ ] **KSPCB consent 90 days** — placeholder, low confidence.
- [ ] **Hiring lead times** (2 values, Execution → Hiring) — placeholders.
- [ ] **23 simulation modelling choices** (Factory behaviour such as breakdown rates) — placeholders.
- [ ] **EPR certificate price ₹1.1/kg** — researched but low confidence (single intermediary quote).
- [ ] **CAPEX ±25%** — no vendor quotes yet.
- [ ] **Supplier / buyer registers in Operations** — sample data, no real names.
- [ ] **No figure is "Verified" and no source has a web link yet.** Say "desk research".
- [ ] Payback: say "about 1.5 years steady state; about 3.5 years realistic".
- [ ] Strategy still to confirm: rigid HDPE pellets vs PET (research files disagree).

---

# Top 10 investor questions — short, honest answers
1. **Do you have customers?** No. We are pre-revenue. The Prove phase exists to get written supply and sales agreements before building.
2. **How much are you raising and why?** ₹2.8 crore (planning estimate). Line, site, effluent plant, permits and working capital. It excludes land, financing cost and early losses.
3. **What does a kilo earn?** About ₹14.90 EBITDA per kg at ₹82/kg pellets; ₹13.8 without any EPR income. EBITDA = profit before interest, tax and depreciation.
4. **When do you break even?** Cash break-even at about 44% of plant capacity. Planned ramp is 70%, 85%, 95% over three years.
5. **What if costs go wrong?** Single shocks stay positive (feedstock +20% gives ₹5.4/kg). All three together turn negative, about −₹7.85/kg. That is why we use gates.
6. **When do you get your money back?** About 1.5 years at steady state, but about 3.5 years realistically with ramp-up.
7. **What is the biggest risk?** Getting enough clean plastic at the right price, and the cash squeeze in the first production months (working capital about ₹83 lakh).
8. **Why would brands buy from you?** They must use recycled content (30% to 60% by FY2029) and need audited certificates. Our batches are traceable. We have not signed any brand yet.
9. **Who are your competitors?** We mapped twelve. Mostly larger. We compete on rigid-plastic focus, traceability and local supply.
10. **How long to start production?** Up to about 8 months from locking a site, plus up to 9 months of proving supply. Consents depend on the pollution board; our 90-day allowance is an estimate.


</details>
