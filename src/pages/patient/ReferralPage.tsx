import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { Check, Circle, Clock3 } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { AllCaughtUp } from "@/components/illustrations/AllCaughtUp"
import { getReferrals } from "@/lib/api/patient"
import { getFacilities, getSpecialties, getStaff } from "@/lib/api/shared"
import { useSession } from "@/state/session"
import type { ReferralStatus } from "@/types"
import { cn } from "@/lib/utils"

const STAGES: ReferralStatus[] = ["Pending", "Confirmed", "Completed"]

export function ReferralPage() {
  const { t } = useTranslation()
  const { patient } = useSession()

  const { data: referrals } = useQuery({
    queryKey: ["referrals", patient?.id],
    queryFn: () => getReferrals(patient!.id),
    enabled: !!patient,
  })
  const { data: facilities } = useQuery({ queryKey: ["facilities"], queryFn: getFacilities })
  const { data: specialties } = useQuery({ queryKey: ["specialties"], queryFn: getSpecialties })
  const { data: staff } = useQuery({ queryKey: ["staff"], queryFn: getStaff })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t("patient.referral.title")}</h1>

      {!referrals?.length && (
        <EmptyState illustration={AllCaughtUp} title={t("patient.referral.empty")} />
      )}

      <div className="space-y-4">
        {referrals?.map((r) => {
          const stageIndex = STAGES.indexOf(r.status)
          const toFacility = facilities?.find((f) => f.id === r.toFacilityId)
          const fromFacility = facilities?.find((f) => f.id === r.fromFacilityId)
          const specialty = specialties?.find((s) => s.id === r.specialtyId)
          const fromDoctor = staff?.find((s) => s.id === r.fromDoctorId)
          const toDoctor = staff?.find((s) => s.id === r.toDoctorId)

          return (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                {t("patient.referral.from")}{" "}
                <span className="font-medium text-foreground">
                  {fromDoctor ? fromDoctor.name : fromFacility?.name}
                </span>
                {fromDoctor && fromFacility && ` · ${fromFacility.name}`}
              </p>
              <p className="mt-0.5 text-base font-semibold text-foreground">
                {t("patient.referral.referredTo")} {toDoctor ? toDoctor.name : toFacility?.name}
              </p>
              {toDoctor && toFacility && (
                <p className="text-sm text-muted-foreground">{toFacility.name}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {t("patient.referral.forSpecialty")} {specialty?.label}
              </p>
              <p className="mt-2 text-sm text-foreground">{r.structuredSummary}</p>

              <div className="mt-5 flex items-center">
                {STAGES.map((stage, i) => (
                  <div key={stage} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold",
                          i < stageIndex
                            ? "border-success bg-success text-white"
                            : i === stageIndex
                              ? "border-teal bg-teal text-white"
                              : "border-border bg-background text-muted-foreground"
                        )}
                      >
                        {i < stageIndex ? (
                          <Check className="size-3.5" />
                        ) : i === stageIndex ? (
                          <Clock3 className="size-3.5" />
                        ) : (
                          <Circle className="size-2 fill-current" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          i <= stageIndex ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {t(`patient.referral.${stage.toLowerCase()}`)}
                      </span>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={cn("mx-1 h-0.5 flex-1", i < stageIndex ? "bg-success" : "bg-border")} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
