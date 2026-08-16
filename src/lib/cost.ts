// Constants sourced from published airline disclosures (IndiGo Q1 FY26 investor
// results) and general aviation-economics rules of thumb. Refreshed periodically
// by hand for now; the shape here is what a future live data source would slot into.

/** Fuel cost per available-seat-km, INR. */
export const FUEL_CASK = 1.38;
/** Non-fuel (crew, maintenance, airport fees, lease, overhead) cost per available-seat-km, INR. */
export const NONFUEL_CASK = 2.93;
/** Total cost per available-seat-km, INR. */
export const TOTAL_CASK = FUEL_CASK + NONFUEL_CASK;

/**
 * Margin airlines need on top of raw operating cost to genuinely fund growth —
 * not just post an accounting profit. IATA puts the industry's cost of capital
 * (WACC) at ~8.2% for 2026; return on invested capital below that means growth
 * is funded by debt/dilution, not real earnings. The global industry average net
 * margin (2-4%) sits below this bar most years; well-run carriers like IndiGo
 * clear it, posting 11-14% net margins in strong quarters.
 */
export const GROWTH_MARGIN_RATE = 0.08;

/**
 * Rough share of per-seat fuel cost attributable to one passenger's marginal
 * weight (body + baggage) on a flight that's departing regardless. Most fuel
 * burn pays for moving the aircraft itself, not any one passenger.
 */
const MARGINAL_FUEL_FRACTION = 0.08;
/** Flat per-passenger cost: catering, ground handling share, ticketing overhead. */
const MARGINAL_FLAT_COST = 150;

export interface FlightCosts {
  distanceKm: number;
  marginalCost: number;
  breakEvenCost: number;
  fairPriceCost: number;
}

export function calcFlightCosts(distanceKm: number): FlightCosts {
  const marginalCost = Math.round(
    FUEL_CASK * distanceKm * MARGINAL_FUEL_FRACTION + MARGINAL_FLAT_COST,
  );
  const breakEvenCost = Math.round(TOTAL_CASK * distanceKm);
  const fairPriceCost = Math.round(breakEvenCost * (1 + GROWTH_MARGIN_RATE));
  return { distanceKm, marginalCost, breakEvenCost, fairPriceCost };
}
