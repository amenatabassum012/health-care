import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation } from "@tanstack/react-query"
import { MessageSquareWarning, PhoneCall, Siren } from "lucide-react"
import { Button } from "@/components/ui/button"
import { triggerEmergencySos } from "@/lib/api/patient"
import { pushEmergencyAlert } from "@/lib/emergencyAlerts"
import { useSession } from "@/state/session"

export function SosPage() {
  const { t } = useTranslation()
  const { patient } = useSession()
  const [confirmed, setConfirmed] = useState(false)

  const mutation = useMutation({
    mutationFn: () => triggerEmergencySos(patient!.id),
    onSuccess: (data) => {
      setConfirmed(true)
      pushEmergencyAlert({
        patientId: patient!.id,
        patientName: patient!.name,
        facilityName: data.routedFacilityName,
      })
    },
  })

  return (
    <div className="flex flex-col items-center px-1 py-8 text-center">
      <span className="mb-5 flex size-20 items-center justify-center rounded-full bg-coral text-white shadow-lg shadow-coral/30">
        <Siren className="size-10" />
      </span>
      <h1 className="text-2xl font-bold text-coral">{t("patient.sos.title")}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("patient.sos.subtitle")}</p>

      {!mutation.isPending && !confirmed && (
        <Button
          size="xl"
          className="mt-10 w-full max-w-xs bg-coral text-white hover:bg-coral/90"
          onClick={() => mutation.mutate()}
        >
          <Siren className="size-5" />
          {t("patient.sos.confirm")}
        </Button>
      )}

      {mutation.isPending && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <span className="size-10 animate-ping rounded-full bg-coral/40" />
          <p className="text-sm font-medium text-foreground">{t("patient.sos.calling")}</p>
        </div>
      )}

      {confirmed && mutation.data && (
        <div className="mt-8 w-full max-w-sm space-y-4">
          <div className="rounded-2xl border border-success/40 bg-success/25 p-5 backdrop-blur-sm">
            <p className="flex items-center justify-center gap-2 font-semibold text-success">
              <PhoneCall className="size-4" />
              {t("patient.sos.routedTo")} {mutation.data.routedFacilityName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t("patient.sos.eta", { minutes: mutation.data.etaMinutes })}</p>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquareWarning className="size-3.5" />
            {t("patient.sos.fallbackSms")}
          </p>
        </div>
      )}
    </div>
  )
}
