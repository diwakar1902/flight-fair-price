import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RoutePicker, { type RouteSelection } from "./components/RoutePicker";
import ResultsReveal from "./components/ResultsReveal";
import { findAirport } from "./data/airports";
import { greatCircleKm } from "./lib/distance";
import { calcFlightCosts } from "./lib/cost";
import { festivalFor } from "./data/festivals";

export default function App() {
  const [selection, setSelection] = useState<RouteSelection | null>(null);

  if (!selection) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="picker" exit={{ opacity: 0 }}>
          <RoutePicker onSubmit={setSelection} />
        </motion.div>
      </AnimatePresence>
    );
  }

  const origin = findAirport(selection.origin);
  const destination = findAirport(selection.destination);
  const distanceKm = greatCircleKm(origin, destination);
  const { marginalCost, breakEvenCost, fairPriceCost } = calcFlightCosts(distanceKm);
  const festival = festivalFor(new Date(selection.date));

  return (
    <AnimatePresence mode="wait">
      <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <ResultsReveal
          origin={origin}
          destination={destination}
          date={selection.date}
          distanceKm={distanceKm}
          marginalCost={marginalCost}
          breakEvenCost={breakEvenCost}
          fairPriceCost={fairPriceCost}
          festival={festival}
          onReset={() => setSelection(null)}
        />
      </motion.div>
    </AnimatePresence>
  );
}
