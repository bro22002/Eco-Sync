import axios from 'axios'

interface RouteRequest {
  origin: string
  destination: string
}

interface RouteResponse {
  distance_km: number
  duration_minutes: number
  coordinates: Array<[number, number]>
}

const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY || ''
const OPENROUTE_BASE_URL = 'https://api.openrouteservice.org/v2'

// Geocoding cache to avoid repeated API calls
const geocodingCache: Record<string, { lat: number; lon: number }> = {}

export async function geocodeLocation(location: string): Promise<{ lat: number; lon: number }> {
  if (geocodingCache[location]) {
    return geocodingCache[location]
  }

  try {
    const response = await axios.get(`${OPENROUTE_BASE_URL}/geocode/search`, {
      params: {
        api_key: OPENROUTE_API_KEY,
        text: location,
      },
    })

    const { features } = response.data
    if (features.length === 0) {
      throw new Error(`Location not found: ${location}`)
    }

    const [lon, lat] = features[0].geometry.coordinates
    geocodingCache[location] = { lat, lon }
    return { lat, lon }
  } catch (error) {
    console.error(`Geocoding error for "${location}":`, error instanceof Error ? error.message : error)
    throw error
  }
}

export async function calculateDistance(request: RouteRequest): Promise<RouteResponse> {
  try {
    const origin = await geocodeLocation(request.origin)
    const destination = await geocodeLocation(request.destination)

    const response = await axios.post(
      `${OPENROUTE_BASE_URL}/matrix/driving-car`,
      {
        locations: [[origin.lon, origin.lat], [destination.lon, destination.lat]],
        metrics: ['distance', 'duration'],
        units: 'km',
      },
      {
        headers: {
          Authorization: OPENROUTE_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    )

    const distanceMeters = response.data.distances[0][1]
    const durationSeconds = response.data.durations[0][1]
    const distanceKm = distanceMeters / 1000
    const durationMinutes = durationSeconds / 60

    return {
      distance_km: Math.round(distanceKm * 100) / 100,
      duration_minutes: Math.round(durationMinutes),
      coordinates: [[origin.lon, origin.lat], [destination.lon, destination.lat]],
    }
  } catch (error) {
    console.error('Distance calculation error:', error instanceof Error ? error.message : error)
    throw error
  }
}

export async function calculateBatchDistances(
  routes: Array<{ origin: string; destination: string }>
): Promise<RouteResponse[]> {
  return Promise.all(routes.map((route) => calculateDistance(route)))
}