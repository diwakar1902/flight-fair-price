import { useState } from "react";
import { motion } from "framer-motion";
import { AIRPORTS } from "../data/airports";
import ArchMotif from "./ArchMotif";

export interface RouteSelection {
  origin: string;
  destination: string;
  date: string;
}

interface Props {
  onSubmit: (selection: RouteSelection) => void;
}

const TODAY = new Date().toISOString().slice(0, 10);

const QUICK_PICKS: RouteSelection[] = [
  { origin: "BLR", destination: "JAI", date: "2026-08-28" },
  { origin: "DEL", destination: "GOI", date: "2026-10-25" },
  { origin: "BOM", destination: "CCU", date: "2026-12-30" },
];

export default function RoutePicker({ onSubmit }: Props) {
  const [origin, setOrigin] = useState("BLR");
  const [destination, setDestination] = useState("JAI");
  const [date, setDate] = useState("2026-08-28");

  const canSubmit = origin !== destination;

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function applyQuickPick(pick: RouteSelection) {
    setOrigin(pick.origin);
    setDestination(pick.destination);
    setDate(pick.date);
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ArchMotif className="mx-auto h-24 w-20" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal to-plum px-4 py-1.5 text-sm font-semibold text-white"
      >
        real fares, honestly compared
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-6xl"
      >
        What does your flight
        <br />
        <span className="text-plum">actually</span> cost?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-5 max-w-xl text-balance text-lg text-mist"
      >
        Pick a route and a date. We'll estimate what it costs the airline to
        fly you — plus a fair margin to actually grow — and set it next to
        real fares. No booking, no verdict. You decide.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-10 w-full rounded-3xl bg-card p-5 shadow-[0_24px_60px_-20px_rgba(76,55,140,0.35)] sm:p-7"
      >
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <label className="text-left">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-plum">
              From
            </span>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full rounded-xl border border-line bg-card-2 px-4 py-3 font-mono text-base text-ink outline-none focus:border-plum"
            >
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} — {a.city}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className="mx-auto mt-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-plum text-white shadow-md transition hover:brightness-110 sm:mt-6"
          >
            ⇄
          </button>

          <label className="text-left">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-plum">
              To
            </span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-xl border border-line bg-card-2 px-4 py-3 font-mono text-base text-ink outline-none focus:border-plum"
            >
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} — {a.city}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-3 block text-left">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-plum">
            Travel date
          </span>
          <input
            type="date"
            value={date}
            min={TODAY}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-line bg-card-2 px-4 py-3 font-mono text-base text-ink outline-none focus:border-plum"
          />
        </label>

        {!canSubmit && (
          <p className="mt-3 text-left text-sm font-semibold text-coral-dark">
            Pick two different airports.
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit({ origin, destination, date })}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-teal to-plum px-6 py-3.5 font-display text-lg font-bold text-white shadow-lg shadow-plum/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reveal the numbers
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-2"
      >
        <span className="text-sm text-mist">Try:</span>
        {QUICK_PICKS.map((pick) => (
          <button
            key={`${pick.origin}-${pick.destination}-${pick.date}`}
            type="button"
            onClick={() => applyQuickPick(pick)}
            className="rounded-full border border-line bg-card px-3.5 py-1.5 font-mono text-sm text-fog transition hover:border-plum hover:text-plum"
          >
            {pick.origin} → {pick.destination}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
