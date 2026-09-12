import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"

import {
  ChevronRight,
  Siren,
  Stethoscope,
  Video,
} from "lucide-react"

import {
  StatusBadge,
  type StatusTone,
} from "@/components/shared/StatusBadge"

import { EmptyState } from "@/components/shared/EmptyState"
import { AllCaughtUp } from "@/components/illustrations/AllCaughtUp"

import {
  getDoctorQueue,
  getReferralInbox,
} from "@/lib/api/doctor"

import {
  getFacilities,
  getSpecialties,
  getStaff,
} from "@/lib/api/shared"

import { useSession } from "@/state/session"
import type { TriageUrgency } from "@/types"

import NearbyHealthcare from "@/components/location/NearbyHealthcare"


/* =========================================================
   TRIAGE URGENCY
========================================================= */

const URGENCY_TONE: Record<
  TriageUrgency,
  StatusTone
> = {
  Emergency: "emergency",
  InPerson: "info",
  Teleconsult: "confirmed",
  SelfCare: "completed",
}

const URGENCY_RESULT_KEY: Record<
  TriageUrgency,
  string
> = {
  Emergency: "emergency",
  InPerson: "inPerson",
  Teleconsult: "teleconsult",
  SelfCare: "selfCare",
}


/* =========================================================
   DOCTOR DASHBOARD
========================================================= */

export function DoctorDashboardPage() {
  const { t } = useTranslation()

  const { staff } = useSession()


  /* =======================================================
     DOCTOR QUEUE
  ======================================================= */

  const { data: queue } = useQuery({
    queryKey: [
      "doctor-queue",
      staff?.facilityId,
    ],

    queryFn: () =>
      getDoctorQueue(
        staff!.facilityId
      ),

    enabled: !!staff,
  })


  /* =======================================================
     REFERRAL INBOX
  ======================================================= */

  const { data: referrals } =
    useQuery({
      queryKey: [
        "referral-inbox",
        staff?.facilityId,
      ],

      queryFn: () =>
        getReferralInbox(
          staff!.facilityId
        ),

      enabled: !!staff,
    })


  /* =======================================================
     FACILITIES
  ======================================================= */

  const { data: facilities } =
    useQuery({
      queryKey: ["facilities"],
      queryFn: getFacilities,
    })


  /* =======================================================
     SPECIALTIES
  ======================================================= */

  const { data: specialties } =
    useQuery({
      queryKey: ["specialties"],
      queryFn: getSpecialties,
    })


  /* =======================================================
     STAFF DIRECTORY
  ======================================================= */

  const { data: staffDirectory } =
    useQuery({
      queryKey: ["staff"],
      queryFn: getStaff,
    })


  return (
    <div className="space-y-8">

      {/* ===================================================
          PAGE TITLE
      =================================================== */}

      <h1 className="text-2xl font-bold text-foreground">
        {t("doctor.dashboard.title")}
      </h1>


      {/* ===================================================
          LOCATION & NEARBY HEALTHCARE

          Uses the same shared location system as Patient.
      =================================================== */}

      <NearbyHealthcare
        role="doctor"
        userId={null}
      />


      {/* ===================================================
          DOCTOR QUEUE
      =================================================== */}

      <section>

        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {t("doctor.dashboard.queue")}
        </h2>


        {!queue?.length && (
          <EmptyState
            illustration={AllCaughtUp}
            title={t(
              "doctor.dashboard.queueEmpty"
            )}
          />
        )}


        <div className="overflow-hidden rounded-2xl border border-border bg-card">

          {queue?.map(
            (appt, i) => (
              <Link
                key={appt.id}
                to={`/doctor/consultation/${appt.id}`}
                className={`flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/60 ${
                  i !== 0
                    ? "border-t border-border"
                    : ""
                }`}
              >

                {/* PATIENT */}

                <div className="flex items-center gap-3">

                  <span className="flex size-8 items-center justify-center rounded-full bg-mint text-xs font-bold text-teal-dark">
                    {appt.queuePosition}
                  </span>


                  <div>

                    <p className="text-sm font-semibold text-foreground">
                      {appt.patientName}
                    </p>


                    <p className="flex items-center gap-1 text-xs text-muted-foreground">

                      {appt.type ===
                      "Teleconsult" ? (
                        <Video className="size-3" />
                      ) : (
                        <Stethoscope className="size-3" />
                      )}

                      {t(
                        `patient.booking.${
                          appt.type ===
                          "Teleconsult"
                            ? "teleconsult"
                            : "inPerson"
                        }`
                      )}

                    </p>

                  </div>

                </div>


                {/* URGENCY */}

                <div className="flex items-center gap-2">

                  {appt.urgency ===
                    "Emergency" && (
                    <Siren className="size-4 text-coral" />
                  )}


                  <StatusBadge
                    tone={
                      URGENCY_TONE[
                        appt.urgency
                      ]
                    }
                    label={t(
                      `patient.triage.result.${
                        URGENCY_RESULT_KEY[
                          appt.urgency
                        ]
                      }`
                    )}
                  />


                  <ChevronRight className="size-4 text-muted-foreground" />

                </div>

              </Link>
            )
          )}

        </div>

      </section>


      {/* ===================================================
          REFERRAL INBOX
      =================================================== */}

      <section>

        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {t(
            "doctor.dashboard.referralInbox"
          )}
        </h2>


        {!referrals?.length && (
          <EmptyState
            illustration={AllCaughtUp}
            title={t(
              "doctor.dashboard.referralInboxEmpty"
            )}
          />
        )}


        <div className="grid gap-3 sm:grid-cols-2">

          {referrals?.map(
            (r) => {

              const facility =
                facilities?.find(
                  (f) =>
                    f.id ===
                    r.fromFacilityId
                )


              const specialty =
                specialties?.find(
                  (s) =>
                    s.id ===
                    r.specialtyId
                )


              const fromDoctor =
                staffDirectory?.find(
                  (s) =>
                    s.id ===
                    r.fromDoctorId
                )


              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-border bg-card p-4"
                >

                  {/* PATIENT + URGENCY */}

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-semibold text-foreground">
                      {r.patientName}
                    </p>


                    <StatusBadge
                      tone={
                        r.urgency ===
                        "Critical"
                          ? "emergency"
                          : r.urgency ===
                            "Urgent"
                          ? "pending"
                          : "info"
                      }
                      label={t(
                        `status.${
                          r.urgency ===
                          "Routine"
                            ? "routine"
                            : r.urgency ===
                              "Urgent"
                            ? "urgentLevel"
                            : "critical"
                        }`
                      )}
                    />

                  </div>


                  {/* REFERRAL DETAILS */}

                  <p className="mt-1 text-xs text-muted-foreground">

                    {fromDoctor
                      ? `${fromDoctor.name} · `
                      : ""}

                    {facility?.name}

                    {" · "}

                    {specialty?.label}

                  </p>


                  {/* SUMMARY */}

                  <p className="mt-2 text-sm text-foreground">
                    {r.structuredSummary}
                  </p>

                </div>
              )
            }
          )}

        </div>

      </section>

    </div>
  )
}
