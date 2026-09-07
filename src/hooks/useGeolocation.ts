import { useCallback, useState } from "react"
import type { Coordinates } from "@/lib/geo"

export type GeolocationStatus = "idle" | "locating" | "granted" | "denied" | "unavailable" | "manual"

/**
 * Wraps the browser Geolocation API with a manual-entry fallback for when a
 * patient denies permission or the device has no GPS — see MedicinePage,
 * which sorts nearby facilities/shops by whichever coordinates are set here.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [status, setStatus] = useState<GeolocationStatus>("idle")

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable")
      return
    }
    setStatus("locating")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setStatus("granted")
      },
      () => {
        setStatus("denied")
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    )
  }, [])

  const setManualLocation = useCallback((location: Coordinates) => {
    setCoords(location)
    setStatus("manual")
  }, [])

  return { coords, status, requestLocation, setManualLocation }
}
