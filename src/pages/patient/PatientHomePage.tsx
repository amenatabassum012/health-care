import { useEffect } from "react"
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
import { supabase } from "@/lib/supabaseClient"

import NearbyHealthcare from "@/components/location/NearbyHealthcare"

export function PatientHomePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const HOME_QUERY_KEY = ["home-summary"]

  const { data, isLoading, error } = useQuery({
    queryKey: HOME_QUERY_KEY,
    queryFn: getHomeSummary,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  /*
   * ============================================================
   * REALTIME UPDATES
   * ============================================================
   *
   * Listen to Supabase changes from:
   *
   * 1. appointments
   * 2. referrals
   * 3. follow_ups
   *
   * Whenever a database row changes, we immediately
   * refetch the Home Dashboard data.
   *
   * IMPORTANT:
   * We use refetchQueries() instead of only invalidateQueries()
   * so that the new database value is fetched immediately.
   */

  useEffect(() => {
    console.log("🚀 Starting Patient Home Realtime...")

    const channel = supabase
      .channel("patient-home-realtime")

      // --------------------------------------------------------
      // APPOINTMENTS
      // --------------------------------------------------------
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        async (payload) => {
          console.log("🔥 LIVE APPOINTMENT UPDATE")
          console.log("Appointment payload:", payload)

          console.log("OLD DATA:", payload.old)
          console.log("NEW DATA:", payload.new)

          try {
            await queryClient.refetchQueries({
              queryKey: HOME_QUERY_KEY,
              type: "active",
            })

            console.log(
              "✅ Patient Home updated after appointment change"
            )
          } catch (error) {
            console.error(
              "❌ Failed to refresh Patient Home:",
              error
            )
          }
        }
      )

      // --------------------------------------------------------
      // REFERRALS
      // --------------------------------------------------------
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "referrals",
        },
        async (payload) => {
          console.log("🔥 LIVE REFERRAL UPDATE")
          console.log("Referral payload:", payload)

          try {
            await queryClient.refetchQueries({
              queryKey: HOME_QUERY_KEY,
              type: "active",
            })

            console.log(
              "✅ Patient Home updated after referral change"
            )
          } catch (error) {
            console.error(
              "❌ Failed to refresh Patient Home:",
              error
            )
          }
        }
      )

      // --------------------------------------------------------
      // FOLLOW UPS
      // --------------------------------------------------------
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follow_ups",
        },
        async (payload) => {
          console.log("🔥 LIVE FOLLOW-UP UPDATE")
          console.log("Follow-up payload:", payload)

          try {
            await queryClient.refetchQueries({
              queryKey: HOME_QUERY_KEY,
              type: "active",
            })

            console.log(
              "✅ Patient Home updated after follow-up change"
            )
          } catch (error) {
            console.error(
              "❌ Failed to refresh Patient Home:",
              error
            )
          }
        }
      )

      // --------------------------------------------------------
      // SUBSCRIBE
      // --------------------------------------------------------
      .subscribe((status) => {
        console.log(
          "📡 Patient Home Realtime connection:",
          status
        )

        if (status === "SUBSCRIBED") {
          console.log(
            "🟢 Patient Home Realtime is CONNECTED"
          )
        }

        if (status === "CHANNEL_ERROR") {
          console.error(
            "🔴 Patient Home Realtime CHANNEL ERROR"
          )
        }

        if (status === "TIMED_OUT") {
          console.error(
            "🟠 Patient Home Realtime TIMED OUT"
          )
        }

        if (status === "CLOSED") {
          console.warn(
            "⚠️ Patient Home Realtime connection CLOSED"
          )
        }
      })

    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------
    return () => {
      console.log(
        "🔌 Removing Patient Home Realtime channel..."
      )

      supabase.removeChannel(channel)
    }
  }, [queryClient])

  /*
   * ============================================================
   * DEBUGGING
   * ============================================================
   */

  useEffect(() => {
    console.log(
      "📊 CURRENT PATIENT HOME DATA:",
      data
    )

    if (data?.activeAppointment) {
      console.log(
        "📅 ACTIVE APPOINTMENT:",
        data.activeAppointment
      )

      console.log(
        "📌 STATUS:",
        data.activeAppointment.status
      )

      console.log(
        "📍 QUEUE POSITION:",
        data.activeAppointment.queuePosition
      )

      console.log(
        "⏱️ WAIT TIME:",
        data.activeAppointment.estimatedWaitMinutes
      )
    }
  }, [data])

  /*
   * ============================================================
   * ERROR DEBUGGING
   * ============================================================
   */

  useEffect(() => {
    if (error) {
      console.error(
        "❌ Patient Home getHomeSummary error:",
        error
      )
    }
  }, [error])

  return (
    <div className="space-y-6">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("patient.home.greeting")}
        </h1>

        <p className="text-sm text-muted-foreground">
          {t("patient.home.subtitle")}
        </p>
      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {isLoading && (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Loading your latest health information...
        </div>
      )}

      {/* ======================================================
          ACTIVE APPOINTMENT
      ====================================================== */}

      {data?.activeAppointment && (
        <Link
          to="/patient/appointments"
          className="flex items-center justify-between rounded-2xl border border-teal/30 bg-mint/60 px-4 py-3"
        >
          <div className="flex items-center gap-3">

            <StatusBadge
              tone="confirmed"
              label={t("patient.home.statusQueue")}
            />

            <span className="text-lg font-bold text-teal-dark">
              #{data.activeAppointment.queuePosition}
            </span>

          </div>

          <span className="text-xs text-muted-foreground">
            {data.activeAppointment.estimatedWaitMinutes}{" "}
            {t("patient.booking.minutes")}
          </span>
        </Link>
      )}

      {/* ======================================================
          LATEST REFERRAL
      ====================================================== */}

      {data?.latestReferral && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">

          <span className="text-sm font-medium text-foreground">
            {t("patient.home.statusReferral")}
          </span>

          <StatusBadge
            tone={
              data.latestReferral.status === "Confirmed"
                ? "confirmed"
                : "pending"
            }
            label={t(
              `patient.referral.${data.latestReferral.status.toLowerCase()}`
            )}
          />

        </div>
      )}

      {/* ======================================================
          FOLLOW UP
      ====================================================== */}

      {data?.dueFollowUp && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">

          <span className="text-sm font-medium text-foreground">
            {t("patient.home.statusFollowUp")}
          </span>

          <StatusBadge
            tone="pending"
            label={t("status.pending")}
          />

        </div>
      )}

      {/* ======================================================
          AI TRIAGE
      ====================================================== */}

      <Link
        to="/patient/triage"
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-teal to-teal-dark p-5 text-white shadow-md shadow-teal-dark/20 transition-transform hover:-translate-y-0.5"
      >

        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15">

          <Stethoscope className="size-6" />

        </span>

        <div className="min-w-0 flex-1">

          <p className="text-base font-bold">
            {t("patient.triage.startTitle")}
          </p>

          <p className="truncate text-sm text-white/80">
            {t("patient.triage.startSubtitle")}
          </p>

        </div>

        <ChevronRight className="size-5 shrink-0" />

      </Link>

      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <div className="grid gap-3">

        <ActionCard
          to="/patient/appointments"
          icon={CalendarCheck}
          title={t("patient.home.myAppointments")}
          description={t("patient.home.myAppointmentsDesc")}
        />

        <ActionCard
          to="/patient/booking"
          icon={CalendarClock}
          title={t("patient.home.bookAppointment")}
          description={t("patient.home.bookAppointmentDesc")}
        />

        <ActionCard
          to="/patient/teleconsult"
          icon={Video}
          title={t("patient.home.startTeleconsult")}
          description={t("patient.home.startTeleconsultDesc")}
        />

        <ActionCard
          to="/patient/records"
          icon={FileClock}
          title={t("patient.home.myHealthRecords")}
          description={t("patient.home.myHealthRecordsDesc")}
        />

        <ActionCard
          to="/patient/referral"
          icon={GitBranch}
          title={t("patient.home.trackReferral")}
          description={t("patient.home.trackReferralDesc")}
        />

        <ActionCard
          to="/patient/medicine"
          icon={Pill}
          title={t("patient.home.checkMedicine")}
          description={t("patient.home.checkMedicineDesc")}
        />

        <ActionCard
          to="/patient/sos"
          icon={Siren}
          tone="emergency"
          title={t("patient.home.emergencySos")}
          description={t("patient.home.emergencySosDesc")}
        />

      </div>

      {/* ======================================================
          LOCATION & NEARBY HEALTHCARE
      ====================================================== */}

      <NearbyHealthcare
        role="patient"
        userId={null}
      />

    </div>
  )
}