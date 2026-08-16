import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  fetchFlightData,
  nearestSightings,
  daysBetween,
  type FareSighting,
  type DataSource,
} from "../lib/flightDataClient";
import { formatINR } from "../lib/format";

interface Props {
  origin: string;
  destination: string;
  date: string;
  fairPriceCost: number;
}

type Status = "loading" | "error" | "ready";

function stopsLabel(stops: number): string {
  if (stops === 0) return "Direct";
  return stops === 1 ? "1 stop" : `${stops} stops`;
}

function relativeDays(iso: string): string {
  const found = new Date(iso);
  const now = new Date();
  const diff = Math.max(0, Math.round((now.getTime() - found.getTime()) / (1000 * 60 * 60 * 24)));
  if (diff === 0) return "found today";
  if (diff === 1) return "found yesterday";
  return `found ${diff}d ago`;
}

function departureTimeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function dateBadge(departDate: string, targetDate: string): string {
  const diff = daysBetween(departDate, targetDate);
  const formatted = new Date(departDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (diff === 0) return formatted;
  return `${formatted} · ${diff}d from your date`;
}

function ratioClasses(ratio: number): string {
  if (ratio >= 1.3) return "bg-coral/15 text-coral-dark";
  if (ratio <= 0.95) return "bg-teal/15 text-teal-dark";
  return "bg-mustard/20 text-fog";
}

export default function FlightOffersList({ origin, destination, date, fairPriceCost }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [dataSource, setDataSource] = useState<DataSource>("travelpayouts");
  const [sightings, setSightings] = useState<FareSighting[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchFlightData(origin, destination, date)
      .then(({ dataSource: source, sightings: all }) => {
        if (cancelled) return;
        setDataSource(source);
        // Live results are already for the exact date; cached results need nearest-date matching.
        setSightings(source === "google_flights" ? all.slice(0, 8) : nearestSightings(all, date, 8));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [origin, destination, date]);

  if (status === "loading") {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-card-2" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="rounded-2xl bg-card-2 px-4 py-4 text-sm text-fog">
        Couldn't load real fares right now ({errorMessage}). Check the API keys in{" "}
        <code className="font-mono text-ink">.env.local</code>.
      </p>
    );
  }

  if (sightings.length === 0) {
    return (
      <p className="rounded-2xl bg-card-2 px-4 py-4 text-sm text-fog">
        No fare data for this route yet. Try a busier route like Delhi → Mumbai,
        or a date closer to today.
      </p>
    );
  }

  const isLive = dataSource === "google_flights";
  const closestGapDays = isLive ? 0 : Math.min(...sightings.map((s) => daysBetween(s.departDate, date)));
  const isStale = !isLive && closestGapDays > 14;

  const avgPrice = Math.round(sightings.reduce((sum, s) => sum + s.price, 0) / sightings.length);
  const avgRatio = avgPrice / fairPriceCost;
  const avgDiffPct = Math.round(Math.abs(avgRatio - 1) * 100);
  const avgLine =
    avgRatio >= 1.05
      ? `${avgDiffPct}% above fair price`
      : avgRatio <= 0.95
        ? `${avgDiffPct}% below fair price`
        : "about even with fair price";

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-teal" : "bg-mustard"}`} />
        <span className="text-xs font-semibold text-mist">
          {isLive ? "live via Google Flights" : "approximate — cached fare data"}
        </span>
      </div>

      {isStale && (
        <p className="mb-4 rounded-2xl bg-coral/15 px-4 py-3 text-sm text-coral-dark">
          No cached fares within two weeks of your date — the closest data we
          have is {closestGapDays} days off. Prices below reflect that other
          period, not necessarily this one (they'll miss festival or
          holiday-driven demand near your actual date). Treat as a rough
          reference, not a quote for {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}.
        </p>
      )}

      <div className="mb-4 rounded-2xl bg-gradient-to-r from-teal/10 to-plum/10 px-4 py-3.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-plum">
          average of these {sightings.length} fares
        </p>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="font-display text-2xl font-bold text-ink">{formatINR(avgPrice)}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${ratioClasses(avgRatio)}`}>
            {avgLine}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {sightings.map((s, i) => {
          const ratio = s.price / fairPriceCost;
          const ratioLabel = `${ratio.toFixed(1)}× fair price`;

          return (
            <motion.div
              key={`${s.departDate}-${s.source}-${s.price}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="flex flex-col gap-2 rounded-2xl bg-card-2 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm text-ink">
                  {s.airline ? s.airline : dateBadge(s.departDate, date)}
                  {s.airline && s.departureTime ? ` · ${departureTimeLabel(s.departureTime)}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-mist">
                  {stopsLabel(s.stops)} · via {s.source}
                  {s.foundAt ? ` · ${relativeDays(s.foundAt)}` : ""}
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="font-mono text-lg font-bold text-ink">{formatINR(s.price)}</p>
                <p className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${ratioClasses(ratio)}`}>
                  {ratioLabel}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
