export interface FareSighting {
  price: number;
  departDate: string;
  departureTime: string | null;
  airline: string | null;
  stops: number;
  durationMin: number | null;
  source: string;
  /** null means "live now" (e.g. Google Flights); a timestamp means cached data. */
  foundAt: string | null;
}

export type DataSource = "google_flights" | "travelpayouts";

export interface FlightDataResult {
  dataSource: DataSource;
  sightings: FareSighting[];
}

interface RawResponse {
  success: boolean;
  dataSource?: DataSource;
  sightings?: FareSighting[];
  error?: string;
}

export async function fetchFlightData(origin: string, destination: string, date: string): Promise<FlightDataResult> {
  const res = await fetch(`/api/flights?origin=${origin}&destination=${destination}&date=${date}`);
  const json: RawResponse = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || "Couldn't reach the pricing data source");
  }

  return { dataSource: json.dataSource ?? "travelpayouts", sightings: json.sightings ?? [] };
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs(Math.round((new Date(a).getTime() - new Date(b).getTime()) / msPerDay));
}

/** Nearest-date sightings to the requested date, closest first, cheapest as tiebreaker. */
export function nearestSightings(sightings: FareSighting[], targetDate: string, count = 8): FareSighting[] {
  return [...sightings]
    .sort((a, b) => {
      const dayDiff = daysBetween(a.departDate, targetDate) - daysBetween(b.departDate, targetDate);
      return dayDiff !== 0 ? dayDiff : a.price - b.price;
    })
    .slice(0, count)
    .sort((a, b) => a.price - b.price);
}

export { daysBetween };
