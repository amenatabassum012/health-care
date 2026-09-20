import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import {
  QrCode,
  Stethoscope,
  GitBranch,
  ClipboardCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { EmptyRecords } from "@/components/illustrations/EmptyRecords"
import { getHealthRecords } from "@/lib/api/patient"
import { useSession } from "@/state/session"
import type { HealthRecordEntry } from "@/types"

const TYPE_ICON: Record<
  HealthRecordEntry["type"],
  typeof Stethoscope
> = {
  Consultation: Stethoscope,
  Referral: GitBranch,
  Triage: ClipboardCheck,
}

export function RecordsPage() {
  const { t } = useTranslation()
  const { patient } = useSession()
  const [qrOpen, setQrOpen] = useState(false)

  const { data: records } = useQuery({
    queryKey: ["health-records", patient?.id],
    queryFn: () => getHealthRecords(patient!.id),
    enabled: !!patient,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("patient.records.title")}
        </h1>

        <p className="text-sm text-muted-foreground">
          {t("patient.records.subtitle")}
        </p>
      </div>

      {/* QR Button */}
      <Button
        size="xl"
        className="w-full bg-teal text-white hover:bg-teal-dark"
        onClick={() => setQrOpen(true)}
      >
        <QrCode className="size-4" />
        {t("patient.records.showQr")}
      </Button>

      {/* Empty State */}
      {!records?.length && (
        <EmptyState
          illustration={EmptyRecords}
          title={t("patient.records.empty")}
        />
      )}

      {/* Health Records */}
      <div className="relative space-y-5 border-l-2 border-border pl-5">
        {records?.map((r) => {
          const Icon =
            TYPE_ICON[
              r.type as keyof typeof TYPE_ICON
            ]

          return (
            <div
              key={r.id}
              className="relative"
            >
              <span className="absolute top-1 -left-[27px] flex size-5 items-center justify-center rounded-full bg-teal text-white">
                <Icon className="size-3" />
              </span>

              <p className="text-xs font-medium text-muted-foreground">
                {r.date} · {r.facilityName}
              </p>

              <p className="text-sm font-semibold text-foreground">
                {r.title}
              </p>

              <p className="text-sm text-muted-foreground">
                {r.summary}
              </p>
            </div>
          )
        })}
      </div>

      {/* QR Dialog */}
      <Dialog
        open={qrOpen}
        onOpenChange={setQrOpen}
      >
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>
              {t("patient.records.showQr")}
            </DialogTitle>
          </DialogHeader>

          <div className="mx-auto flex size-48 items-center justify-center rounded-2xl bg-mint">
            <QrCode className="size-28 text-teal-dark" />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {t("patient.records.qrConsent")}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}