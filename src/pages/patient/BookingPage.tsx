import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CalendarClock, Hospital, MapPin, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFacilities } from "@/lib/api/shared"
import { createAppointment } from "@/lib/api/patient"
import { useSession } from "@/state/session"
import { facilityLabel } from "@/mocks/facilities"
import type { AppointmentType } from "@/types"
import { cn } from "@/lib/utils"

export function BookingPage() {
  const { t } = useTranslation()
  const { patient } = useSession()
  const [type, setType] = useState<AppointmentType>("InPerson")
  const [facilityId, setFacilityId] = useState<string | null>(null)

  const { data: facilities } = useQuery({ queryKey: ["facilities"], queryFn: getFacilities })

  const bookMutation = useMutation({
    mutationFn: () => createAppointment(patient!.id, facilityId!, type),
  })

  if (bookMutation.isSuccess) {
    const appt = bookMutation.data
    return (
      <div className="flex flex-col items-center px-1 py-10 text-center">
        <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-success/15 text-success">
          <CalendarClock className="size-8" />
        </span>
        <h1 className="text-2xl font-bold text-foreground">{t("patient.booking.booked")}</h1>
        <div className="mt-6 w-full max-w-xs rounded-2xl border border-teal/30 bg-mint/60 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-dark">
            {t("patient.booking.queuePosition")}
          </p>
          <p className="mt-1 text-5xl font-extrabold text-teal-dark">#{appt.queuePosition}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("patient.booking.estimatedWait")}: {appt.estimatedWaitMinutes} {t("patient.booking.minutes")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t("patient.booking.title")}</h1>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setType("InPerson")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 p-4",
            type === "InPerson" ? "border-teal bg-mint" : "border-border bg-card"
          )}
        >
          <Hospital className="size-6 text-teal-dark" />
          <span className="text-sm font-semibold">{t("patient.booking.inPerson")}</span>
        </button>
        <button
          type="button"
          onClick={() => setType("Teleconsult")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 p-4",
            type === "Teleconsult" ? "border-teal bg-mint" : "border-border bg-card"
          )}
        >
          <Video className="size-6 text-teal-dark" />
          <span className="text-sm font-semibold">{t("patient.booking.teleconsult")}</span>
        </button>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">{t("patient.booking.chooseFacility")}</p>
        <div className="space-y-2.5">
          {facilities?.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFacilityId(f.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left",
                facilityId === f.id ? "border-teal bg-mint" : "border-border bg-card"
              )}
            >
              <span>
                <span className="block text-sm font-semibold text-foreground">{facilityLabel(f)}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {f.distanceKm} {t("common.km")}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <Button
        size="xl"
        className="w-full bg-teal text-white hover:bg-teal-dark"
        disabled={!facilityId || bookMutation.isPending}
        onClick={() => bookMutation.mutate()}
      >
        {bookMutation.isPending ? t("common.loading") : t("patient.booking.confirm")}
      </Button>
    </div>
  )
}
