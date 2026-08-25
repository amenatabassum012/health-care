import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { MapPin, Pill, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { EmptyMedicine } from "@/components/illustrations/EmptyMedicine"
import { searchStock } from "@/lib/api/patient"
import { MOCK_FACILITIES } from "@/mocks/facilities"
import type { StockItem } from "@/types"

const STATUS_TONE: Record<StockItem["status"], StatusTone> = {
  Available: "completed",
  LowStock: "pending",
  Unavailable: "emergency",
}

const HOME_FACILITY_ID = "fac-phc-001"

export function MedicinePage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")

  const { data: stock } = useQuery({
    queryKey: ["stock", HOME_FACILITY_ID, query],
    queryFn: () => searchStock(HOME_FACILITY_ID, query),
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

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("patient.medicine.availableAt")} — {MOCK_FACILITIES.find((f) => f.id === HOME_FACILITY_ID)?.name}
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
        {t("patient.medicine.nearestAlternative")}: {MOCK_FACILITIES.find((f) => f.id === "fac-dh-001")?.name}
      </p>
    </div>
  )
}
