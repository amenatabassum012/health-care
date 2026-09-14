import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { Activity, ClipboardCheck, Gauge, Package, Users } from "lucide-react"
import { getFacilityMetrics } from "@/lib/api/doctor"
import { searchStock } from "@/lib/api/patient"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { useSession } from "@/state/session"
import { cn } from "@/lib/utils"

function MetricTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users
  label: string
  value: string
  tone: "teal" | "blue" | "amber" | "success"
}) {
  const toneClasses = {
    teal: "bg-mint text-teal-dark",
    blue: "bg-brand-blue/10 text-brand-blue",
    amber: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
  }[tone]
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className={cn("flex size-10 items-center justify-center rounded-xl", toneClasses)}>
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-2xl font-extrabold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

const STOCK_TONE: Record<string, StatusTone> = {
  Available: "completed",
  LowStock: "pending",
  Unavailable: "emergency",
}

export function FacilityDashboardPage() {
  const { t } = useTranslation()
  const { staff } = useSession()

  const { data } = useQuery({
    queryKey: ["facility-metrics", staff?.facilityId],
    queryFn: () => getFacilityMetrics(staff!.facilityId),
    enabled: !!staff,
  })

  const { data: stock = [] } = useQuery({
    queryKey: ["facility-stock", staff?.facilityId],
    queryFn: () => searchStock(staff!.facilityId, ""),
    enabled: !!staff,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t("doctor.admin.facilityDashboard")}</h1>

      <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        <Activity className="size-3.5" />
        {t("doctor.admin.qualityMetrics")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile icon={Users} tone="teal" label={t("doctor.admin.patientLoad")} value={String(data?.patientLoadToday ?? "—")} />
        <MetricTile
          icon={ClipboardCheck}
          tone="blue"
          label={t("doctor.admin.referralCompletion")}
          value={data ? `${Math.round(data.referralCompletionRate * 100)}%` : "—"}
        />
        <MetricTile
          icon={Package}
          tone="amber"
          label={t("doctor.admin.stockStatus")}
          value={data ? `${Math.round(data.stockAvailabilityRate * 100)}%` : "—"}
        />
        <MetricTile
          icon={Gauge}
          tone="success"
          label={t("doctor.admin.avgWait")}
          value={data ? `${data.avgWaitMinutes} ${t("patient.booking.minutes")}` : "—"}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Activity className="size-3.5" />
          {t("doctor.admin.stockStatus")}
        </h2>
        <div className="space-y-2">
          {stock.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted px-3.5 py-2.5 text-sm">
              <span>{s.name}</span>
              <StatusBadge tone={STOCK_TONE[s.status]} label={t(`status.${s.status.charAt(0).toLowerCase() + s.status.slice(1)}`)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
