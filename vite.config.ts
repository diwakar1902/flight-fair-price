import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Server-only shape both branches below normalize into, so the client never
// has to know which upstream actually answered the request.
interface UnifiedSighting {
  price: number
  departDate: string
  departureTime: string | null
  airline: string | null
  stops: number
  durationMin: number | null
  source: string
  foundAt: string | null
}

interface SerpApiFlightLeg {
  airline: string
  departure_airport: { time: string }
}

interface SerpApiItinerary {
  price: number
  total_duration: number
  flights: SerpApiFlightLeg[]
}

interface SerpApiResponse {
  error?: string
  best_flights?: SerpApiItinerary[]
  other_flights?: SerpApiItinerary[]
}

async function fetchGoogleFlights(
  apiKey: string,
  origin: string,
  destination: string,
  date: string,
): Promise<UnifiedSighting[] | null> {
  const url = new URL('https://serpapi.com/search')
  url.searchParams.set('engine', 'google_flights')
  url.searchParams.set('departure_id', origin)
  url.searchParams.set('arrival_id', destination)
  url.searchParams.set('outbound_date', date)
  url.searchParams.set('type', '2') // one-way
  url.searchParams.set('currency', 'INR')
  url.searchParams.set('hl', 'en')
  url.searchParams.set('gl', 'in')
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url)
  if (!res.ok) return null
  const json = (await res.json()) as SerpApiResponse
  if (json.error) return null

  const itineraries = [...(json.best_flights ?? []), ...(json.other_flights ?? [])]
  if (itineraries.length === 0) return null

  return itineraries.map((it) => {
    const first = it.flights[0]
    return {
      price: it.price,
      departDate: date,
      departureTime: first?.departure_airport?.time ?? null,
      airline: first?.airline ?? null,
      stops: it.flights.length - 1,
      durationMin: it.total_duration ?? null,
      source: 'Google Flights',
      foundAt: null,
    }
  })
}

interface TravelpayoutsEntry {
  value: number
  depart_date: string
  number_of_changes: number
  gate: string
  found_at: string
}

async function fetchTravelpayouts(
  token: string,
  origin: string,
  destination: string,
): Promise<UnifiedSighting[]> {
  const url = new URL('https://api.travelpayouts.com/v2/prices/latest')
  url.searchParams.set('origin', origin)
  url.searchParams.set('destination', destination)
  url.searchParams.set('currency', 'inr')
  url.searchParams.set('one_way', 'true')
  url.searchParams.set('sorting', 'price')
  url.searchParams.set('limit', '30')

  const res = await fetch(url, { headers: { 'X-Access-Token': token } })
  const json = await res.json()
  const entries: TravelpayoutsEntry[] = json.data ?? []

  return entries
    .filter((e) => e.value > 0 && e.depart_date)
    .map((e) => ({
      price: e.value,
      departDate: e.depart_date,
      departureTime: null,
      airline: null,
      stops: e.number_of_changes ?? 0,
      durationMin: null,
      source: e.gate?.trim() || 'fare calendar',
      foundAt: e.found_at,
    }))
}

// Tries live Google Flights data first (via SerpApi) and falls back to the
// Travelpayouts cache when the key is missing, the quota's exhausted, or the
// request errors — so the app degrades gracefully instead of breaking.
function flightsProxy(serpApiKey: string, travelpayoutsToken: string): Plugin {
  return {
    name: 'flights-proxy',
    configureServer(server) {
      server.middlewares.use('/api/flights', async (req, res) => {
        try {
          const requestUrl = new URL(req.url ?? '', 'http://localhost')
          const origin = requestUrl.searchParams.get('origin')
          const destination = requestUrl.searchParams.get('destination')
          const date = requestUrl.searchParams.get('date')

          if (!origin || !destination || !date) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'origin, destination, and date are required' }))
            return
          }

          if (serpApiKey) {
            const liveResults = await fetchGoogleFlights(serpApiKey, origin, destination, date).catch(() => null)
            if (liveResults) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, dataSource: 'google_flights', sightings: liveResults }))
              return
            }
          }

          if (!travelpayoutsToken) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Neither SERPAPI_KEY nor TRAVELPAYOUTS_TOKEN is configured' }))
            return
          }

          const cachedResults = await fetchTravelpayouts(travelpayoutsToken, origin, destination)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, dataSource: 'travelpayouts', sightings: cachedResults }))
        } catch {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Upstream flight data request failed' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      flightsProxy(env.SERPAPI_KEY ?? '', env.TRAVELPAYOUTS_TOKEN ?? ''),
    ],
  }
})
