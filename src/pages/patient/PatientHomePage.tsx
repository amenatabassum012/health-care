import { useTranslation } from "react-i18next"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"

import {
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  FileClock,
  GitBranch,
  Pill,
  Siren,
  Stethoscope,
  Video,
} from "lucide-react"

import { ActionCard } from "@/components/shared/ActionCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getHomeSummary } from "@/lib/api/patient"
import { useSession } from "@/state/session"
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh"

import NearbyHealthcare from "@/components/location/NearbyHealthcare"

export function PatientHomePage() {
  const { t } = useTranslation()
  const { patient } = useSession()
  const queryClient = useQueryClient()

  const { data } = useQuery({
  queryKey: ["home-summary", patient?.id],
  queryFn: () => getHomeSummary(),
  enabled: !!patient?.id,
})

  // Not filtered to this patient's own row: another patient ahead in the
  // same facility queue being seen/cancelled changes this patient's live
  // position too, so any appointment change should trigger a refetch.
  useRealtimeRefresh("appointments", () =>
    queryClient.invalidateQueries({ queryKey: ["home-summary", patient?.id] })
  )

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("patient.home.greeting")}
        </h1>

        <p className="text-sm text-muted-foreground">
          {t("patient.home.subtitle")}
        </p>
      </div>


      {/* ACTIVE APPOINTMENT */}

      {data?.activeAppointment && (
        <Link
          to="/patient/appointments"
          className="flex items-center justify-between rounded-2xl border border-teal/30 bg-mint/60 px-4 py-3"
        >
          <div className="flex items-center gap-3">

            <StatusBadge
              tone="confirmed"
              label={t(
                "patient.home.statusQueue"
              )}
            />

            <span className="text-lg font-bold text-teal-dark">
              #{data.activeAppointment.queuePosition}
            </span>

          </div>

          <span className="text-xs text-muted-foreground">
            {
              data.activeAppointment
                .estimatedWaitMinutes
            }{" "}
            {t("patient.booking.minutes")}
          </span>

        </Link>
      )}


      {/* LATEST REFERRAL */}

      {data?.latestReferral && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">

          <span className="text-sm font-medium text-foreground">
            {t(
              "patient.home.statusReferral"
            )}
          </span>

          <StatusBadge
            tone={
              data.latestReferral.status ===
              "Confirmed"
                ? "confirmed"
                : "pending"
            }
            label={t(
              `patient.referral.${data.latestReferral.status.toLowerCase()}`
            )}
          />

        </div>
      )}


      {/* FOLLOW UP */}

      {data?.dueFollowUp && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">

          <span className="text-sm font-medium text-foreground">
            {t(
              "patient.home.statusFollowUp"
            )}
          </span>

          <StatusBadge
            tone="pending"
            label={t("status.pending")}
          />

        </div>
      )}


      {/* AI TRIAGE */}

      <Link
        to="/patient/triage"
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-teal to-teal-dark p-5 text-white shadow-md shadow-teal-dark/20 transition-transform hover:-translate-y-0.5"
      >

        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15">

          <Stethoscope className="size-6" />

        </span>

        <div className="min-w-0 flex-1">

          <p className="text-base font-bold">
            {t(
              "patient.triage.startTitle"
            )}
          </p>

          <p className="truncate text-sm text-white/80">
            {t(
              "patient.triage.startSubtitle"
            )}
          </p>

        </div>

        <ChevronRight className="size-5 shrink-0" />

      </Link>


      {/* QUICK ACTIONS */}

      <div className="grid gap-3">

        <ActionCard
          to="/patient/appointments"
          icon={CalendarCheck}
          title={t(
            "patient.home.myAppointments"
          )}
          description={t(
            "patient.home.myAppointmentsDesc"
          )}
        />

        <ActionCard
          to="/patient/booking"
          icon={CalendarClock}
          title={t(
            "patient.home.bookAppointment"
          )}
          description={t(
            "patient.home.bookAppointmentDesc"
          )}
        />

        <ActionCard
          to="/patient/teleconsult"
          icon={Video}
          title={t(
            "patient.home.startTeleconsult"
          )}
          description={t(
            "patient.home.startTeleconsultDesc"
          )}
        />

        <ActionCard
          to="/patient/records"
          icon={FileClock}
          title={t(
            "patient.home.myHealthRecords"
          )}
          description={t(
            "patient.home.myHealthRecordsDesc"
          )}
        />

        <ActionCard
          to="/patient/referral"
          icon={GitBranch}
          title={t(
            "patient.home.trackReferral"
          )}
          description={t(
            "patient.home.trackReferralDesc"
          )}
        />

        <ActionCard
          to="/patient/medicine"
          icon={Pill}
          title={t(
            "patient.home.checkMedicine"
          )}
          description={t(
            "patient.home.checkMedicineDesc"
          )}
        />

        <ActionCard
          to="/patient/sos"
          icon={Siren}
          tone="emergency"
          title={t(
            "patient.home.emergencySos"
          )}
          description={t(
            "patient.home.emergencySosDesc"
          )}
        />

      </div>


      {/* LOCATION & NEARBY HEALTHCARE */}

      <NearbyHealthcare
        role="patient"
        userId={null}
      />

    </div>
  )
}