import { motion } from "framer-motion";
import type { Airport } from "../data/airports";
import StatBar from "./StatBar";
import FlightOffersList from "./FlightOffersList";
import { formatINR } from "../lib/format";
import { GROWTH_MARGIN_RATE } from "../lib/cost";

interface Props {
  origin: Airport;
  destination: Airport;
  date: string;
  distanceKm: number;
  marginalCost: number;
  breakEvenCost: number;
  fairPriceCost: number;
  festival: string | null;
  onReset: () => void;
}

export default function ResultsReveal({
  origin,
  destination,
  date,
  distanceKm,
  marginalCost,
  breakEvenCost,
  fairPriceCost,
  festival,
  onReset,
}: Props) {
  const maxValue = fairPriceCost * 2.2;
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center px-6 py-12">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        type="button"
        onClick={onReset}
        className="mb-6 flex items-center gap-1.5 self-start text-sm font-semibold text-plum transition hover:text-plum-dark"
      >
        ← check another flight
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-3xl bg-card shadow-[0_24px_60px_-20px_rgba(76,55,140,0.35)]"
      >
        <div className="bg-gradient-to-r from-teal to-plum px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 font-display text-2xl font-bold text-white sm:text-3xl">
              <span>{origin.code}</span>
              <span>→</span>
              <span>{destination.code}</span>
            </div>
            {festival && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                {festival}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-white/85">
            {origin.city} → {destination.city} · {formattedDate} ·{" "}
            {distanceKm.toLocaleString("en-IN")} km
          </p>
        </div>

        <div className="space-y-6 px-6 py-7 sm:px-8">
          <StatBar
            label="Marginal cost"
            sublabel="what one more passenger costs, roughly"
            value={marginalCost}
            maxValue={maxValue}
            colorClass="bg-teal"
            delay={0.1}
          />
          <div>
            <StatBar
              label="Fair price"
              sublabel="operating cost + a margin healthy airlines need to grow"
              value={fairPriceCost}
              maxValue={maxValue}
              colorClass="bg-plum"
              delay={0.3}
            />
            <p className="mt-1.5 text-xs text-mist">
              {formatINR(breakEvenCost)} break-even + {Math.round(GROWTH_MARGIN_RATE * 100)}% margin
              (roughly what it takes to fund fleet growth without going into debt)
            </p>
          </div>
        </div>

        <div className="border-t border-line px-6 py-6 sm:px-8">
          <p className="mb-3 font-display text-lg font-bold text-ink">
            Real fares recently seen on this route
          </p>
          <FlightOffersList
            origin={origin.code}
            destination={destination.code}
            date={date}
            fairPriceCost={fairPriceCost}
          />
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto mt-6 max-w-lg text-center text-xs text-mist"
      >
        Fair price uses great-circle distance × the airline's own disclosed
        cost-per-seat-km, plus an 8% margin (roughly the industry's cost of
        capital per IATA/McKinsey). Marginal cost is a rough illustrative
        estimate. Fares come from Travelpayouts' cached search data — real
        prices real travelers have seen recently, not necessarily this exact
        date or airline. Nothing here is bookable.
      </motion.p>
    </div>
  );
}
