/** Great-circle distance between two coordinates, in kilometres. */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export interface Coordinates {
  latitude: number
  longitude: number
}

/** Known localities a patient can pick from when device geolocation isn't available or is denied. */
export const KNOWN_LOCALITIES: (Coordinates & { label: string })[] = [
  { label: "Haridwar city", latitude: 29.9457, longitude: 78.1642 },
  { label: "Bahadrabad", latitude: 29.9264, longitude: 78.0322 },
  { label: "Roorkee", latitude: 29.8543, longitude: 77.8880 },
  { label: "Bhagwanpur", latitude: 29.8639, longitude: 77.7511 },
  { label: "Narsan", latitude: 29.8408, longitude: 78.0619 },
  { label: "Rampur Kalan", latitude: 29.8931, longitude: 78.0715 },
]
