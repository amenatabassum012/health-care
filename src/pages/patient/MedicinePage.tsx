import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useQueries, useQuery } from "@tanstack/react-query"
import { LocateFixed, MapPin, MapPinOff, Pill, Search, Store } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { EmptyMedicine } from "@/components/illustrations/EmptyMedicine"
import { searchStock } from "@/lib/api/patient"
import { getNearbyShops, searchShopStock } from "@/lib/api/shops"
import { MOCK_FACILITIES } from "@/mocks/facilities"
import { useGeolocation } from "@/hooks/useGeolocation"
import { distanceKm, KNOWN_LOCALITIES } from "@/lib/geo"
import type { StockItem } from "@/types"

const STATUS_TONE: Record<StockItem["status"], StatusTone> = {
  Available: "completed",
  LowStock: "pending",
  Unavailable: "emergency",
}

export function MedicinePage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")
  const [showLocalityPicker, setShowLocalityPicker] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const { coords, status, requestLocation, setManualLocation } = useGeolocation()

  const manualMatches = useMemo(() => {
    const q = manualInput.trim().toLowerCase()
    if (!q) return KNOWN_LOCALITIES
    return KNOWN_LOCALITIES.filter((loc) => loc.label.toLowerCase().includes(q))
  }, [manualInput])

  const rankedFacilities = useMemo(() => {
    if (!coords) return MOCK_FACILITIES
    return [...MOCK_FACILITIES].sort(
      (a, b) =>
        distanceKm(coords.latitude, coords.longitude, a.latitude ?? 0, a.longitude ?? 0) -
        distanceKm(coords.latitude, coords.longitude, b.latitude ?? 0, b.longitude ?? 0)
    )
  }, [coords])

  const homeFacility = rankedFacilities[0]
  const nearestFacility = rankedFacilities[1]
  const homeFacilityDistance =
    coords && homeFacility?.latitude !== undefined && homeFacility?.longitude !== undefined
      ? distanceKm(coords.latitude, coords.longitude, homeFacility.latitude, homeFacility.longitude)
      : homeFacility?.distanceKm
  const nearestFacilityDistance =
    coords && nearestFacility?.latitude !== undefined && nearestFacility?.longitude !== undefined
      ? distanceKm(coords.latitude, coords.longitude, nearestFacility.latitude, nearestFacility.longitude)
      : nearestFacility?.distanceKm

  const { data: stock } = useQuery({
    queryKey: ["stock", homeFacility?.id, query],
    queryFn: () => searchStock(homeFacility!.id, query),
    enabled: !!homeFacility,
  })

  const { data: shops } = useQuery({
    queryKey: ["nearby-shops", coords?.latitude, coords?.longitude],
    queryFn: () => getNearbyShops(coords ?? undefined),
  })

  const nearbyShops = (shops ?? []).slice(0, 4)
  const shopStockQueries = useQueries({
    queries: nearbyShops.map((shop) => ({
      queryKey: ["shop-stock", shop.id, query],
      queryFn: () => searchShopStock(shop.id, query),
      enabled: !!shops,
    })),
  })

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">{t("patient.medicine.title")}</h1>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("patient.medicine.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 pl-10 text-base"
        />
      </div>

      {status === "idle" && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint text-teal-dark">
              <MapPin className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{t("patient.medicine.locationPromptTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("patient.medicine.locationPromptBody")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" className="flex-1" onClick={requestLocation}>
              <LocateFixed className="size-4" />
              {t("patient.medicine.turnOnLocation")}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowLocalityPicker(true)}>
              {t("patient.medicine.enterManually")}
            </Button>
          </div>
        </div>
      )}

      {status === "locating" && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
          <LocateFixed className="size-3.5 shrink-0 animate-pulse" />
          <span>{t("patient.medicine.locating")}</span>
        </div>
      )}

      {(status === "denied" || status === "unavailable") && (
        <div className="space-y-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <MapPinOff className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{t("patient.medicine.locationOffTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("patient.medicine.locationOffBody")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={requestLocation}>
              <LocateFixed className="size-4" />
              {t("patient.medicine.retryLocation")}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowLocalityPicker(true)}>
              {t("patient.medicine.enterManually")}
            </Button>
          </div>
        </div>
      )}

      {(status === "granted" || status === "manual") && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
          <LocateFixed className="size-3.5 shrink-0" />
          <span>{status === "granted" ? t("patient.medicine.usingMyLocation") : t("patient.medicine.usingChosenLocation")}</span>
          <button
            type="button"
            onClick={() => setShowLocalityPicker((v) => !v)}
            className="ml-auto text-xs font-semibold text-teal-dark underline underline-offset-2"
          >
            {t("patient.medicine.chooseLocation")}
          </button>
        </div>
      )}

      {showLocalityPicker && (
        <div className="space-y-2.5 rounded-xl border border-border bg-card p-3.5">
          <Input
            placeholder={t("patient.medicine.manualLocationPlaceholder")}
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="h-11"
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            {manualMatches.map((loc) => (
              <button
                key={loc.label}
                type="button"
                onClick={() => {
                  setManualLocation(loc)
                  setManualInput("")
                  setShowLocalityPicker(false)
                }}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                {loc.label}
              </button>
            ))}
            {manualMatches.length === 0 && (
              <p className="text-xs text-muted-foreground">{t("patient.medicine.noLocationMatch")}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>
            {t("patient.medicine.availableAt")} — {homeFacility?.name}
          </span>
          {homeFacilityDistance !== undefined && (
            <span className="flex items-center gap-0.5 normal-case tracking-normal">
              <MapPin className="size-3" /> {homeFacilityDistance.toFixed(1)} {t("common.km")}
            </span>
          )}
        </p>
        <div className="space-y-2.5">
          {stock?.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-mint text-teal-dark">
                  <Pill className="size-4" />
                </span>
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
              <StatusBadge tone={STATUS_TONE[item.status]} label={t(`status.${item.status.charAt(0).toLowerCase() + item.status.slice(1)}`)} />
            </div>
          ))}
          {stock?.length === 0 && (
            <EmptyState illustration={EmptyMedicine} title={t("patient.medicine.empty")} />
          )}
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5" />
        {t("patient.medicine.nearestAlternative")}: {nearestFacility?.name}
        {nearestFacilityDistance !== undefined && ` (${nearestFacilityDistance.toFixed(1)} ${t("common.km")})`}
      </p>

      <div>
        <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Store className="size-3.5" />
          {t("patient.medicine.nearbyShops")}
        </h2>
        <div className="space-y-3">
          {nearbyShops.map((shop, i) => {
            const items = shopStockQueries[i]?.data ?? []
            return (
              <div key={shop.id} className="rounded-xl border border-border bg-card p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{shop.name}</p>
                  {shop.distanceKm !== undefined && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {shop.distanceKm.toFixed(1)} {t("common.km")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{shop.address}</p>
                {items.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-xs">
                        <span>{item.name}</span>
                        <StatusBadge tone={STATUS_TONE[item.status]} label={t(`status.${item.status.charAt(0).toLowerCase() + item.status.slice(1)}`)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {nearbyShops.length === 0 && (
            <p className="text-xs text-muted-foreground">{t("patient.medicine.noShopsNearby")}</p>
          )}
        </div>
      </div>
    </div>
  )
}
