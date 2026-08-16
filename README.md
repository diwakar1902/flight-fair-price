# What Does Your Flight Actually Cost?

A pricing-transparency tool built to answer one question: when a Bengaluru→Jaipur flight hits ₹8,033 during Rakhi, what's actually going on — and how much of that is real cost versus demand-based pricing?

No booking flow, no verdict. It puts three numbers next to each other — what it costs to fly one more passenger, what the airline needs to charge to operate sustainably, and what's actually listed — and lets the reader decide what "fair" means.

**Repo:** [github.com/diwakar1902/flight-fair-price](https://github.com/diwakar1902/flight-fair-price)

---

## The problem

The instinct behind a lot of airline-pricing complaints is "this must be almost pure profit." That's rarely true, and it's rarely false either — the honest answer sits somewhere in between and depends on real inputs: fuel cost, published cost-per-seat-km, and what margin an airline actually needs to stay in business. This project tries to make that calculation visible instead of asserting an answer.

## Approach

Rather than build a generic flight-search clone, the goal was a small number of well-sourced, defensible numbers a reader can actually interrogate — and to be transparent whenever the underlying data was too thin to trust.

## Key decisions

### 1. Grounding "cost" in a real number, not a guess

Early designs used a plausible-sounding cost estimate. Instead, the fair-price calculation is built on **IndiGo's own Q1 FY26 investor disclosures** — ₹1.38/seat-km fuel cost, ₹2.93/seat-km non-fuel cost — multiplied by great-circle distance. For BLR→JAI (1,528 km), that's a **₹6,586 break-even cost**, a number that traces back to a public filing rather than a vibe.

### 2. Break-even isn't "fair" — a business needs to actually grow

The first version of the calculator stopped at break-even and implied *anything above it* was excess. That's wrong, and a useful correction came from treating it as a real business-model question: what margin does an airline need to fund fleet growth without just taking on more debt?

Researching IATA's 2026 outlook and McKinsey's airline-economics work surfaced the actual bar: the industry's cost of capital runs ~8.2% (2026 forecast), and airlines earning *below* that are technically destroying value even while posting an accounting profit. The global industry average net margin (2–4%, revised down to ~2% mid-2026 after fuel-price shocks) sits below that bar most years; well-run carriers like IndiGo clear it, posting 11–14% net margins in strong quarters.

Landed on an **8% margin** on top of break-even — inside the user's own 5–10% instinct, anchored to a real published benchmark rather than picked to make the story land. For BLR→JAI, that moves the "fair price" from ₹6,586 to **₹7,113** — and materially changes the read on real fares: the same route's recently-seen average fares went from reading "19% above fair" (break-even only) to **"10% above fair"** once the margin was properly accounted for. That's a more honest number, even though it's a less dramatic one.

### 3. Picking a data source, after ruling out the obvious ones

Getting real fare data turned out to be the hardest part of the project, not the calculator. In order:

- **Google Flights** — no public API since 2018 (QPX Express was discontinued); no free path exists.
- **Skyscanner's official API** — partner-only, requires an application and an existing audience.
- **Amadeus Self-Service API** — the usual go-to for side projects; Amadeus shut it down entirely in July 2026.
- **Kiwi.com Tequila API** — invite-only, no open signup.
- **Travelpayouts Data API** — free, open signup, no approval wait. Shipped first, with a clear caveat: it's a cache of other users' past searches, not a live search engine.
- **SerpApi's Google Flights API** — real live Google Flights results, legitimately (SerpApi does the fetching as their business, not us scraping directly). Free tier: 100 searches/month.

Final architecture tries SerpApi first for live, airline-attributed fares, and **automatically falls back** to the Travelpayouts cache if the key's missing, the quota's exhausted, or the request fails — so the product degrades gracefully instead of breaking.

### 4. Catching a case where "closest available data" quietly lied

A user comparison against a live Skyscanner search (~₹12,500 for a route on a date close to Diwali) against the tool's own output (~₹7,500 for the same query) surfaced a real bug in the *reasoning*, not the code: the cache had zero entries within two weeks of that date — the "nearest" data being shown was actually **66 days off**, from a slow week in August, with no visibility into the Diwali demand spike. The fix wasn't a better algorithm; it was surfacing the gap honestly — a warning banner now fires whenever the closest cached fare is more than 14 days from the requested date, rather than silently presenting stale numbers as current.

## What shipped

- Pick any route + date across 12 Indian airports
- Three numbers: marginal cost, fair price (break-even + margin, with the breakdown shown), and real recently-seen fares
- Live airline-by-airline fare listing when SerpApi is available (airline, time, price, stops); honest cached-data fallback with staleness warnings when it isn't
- All source reasoning — CASK figures, margin logic, data caveats — surfaced in the UI copy itself, not hidden in a footnote

## What I'd do next

- Deploy it publicly (currently local-only) and see how the 100-searches/month SerpApi quota holds up under real traffic
- Widen airport coverage and add a lightweight cache layer to stretch the free API quota further
- Replace the marginal-cost heuristic (a reasoned estimate, not a modeled one) with a more rigorous fuel-burn calculation

## Stack

React + TypeScript + Vite + Tailwind v4 + Framer Motion. A small Vite dev-server middleware proxies and merges the two pricing APIs server-side, so API keys never reach the client bundle.

## Running locally

```bash
npm install
cp .env.example .env.local   # add your own Travelpayouts token and/or SerpApi key
npm run dev
```
