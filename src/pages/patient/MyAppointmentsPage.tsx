import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Link } from "react-router-dom"

import {
  CalendarClock,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  Video,
  XCircle,
} from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { AllCaughtUp } from "@/components/illustrations/AllCaughtUp"
import {
  StatusBadge,
  type StatusTone,
} from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  cancelAppointment,
  getFeedbackForAppointment,
  submitFeedback,
} from "@/lib/api/patient"

import {
  getFacilities,
  getStaff,
} from "@/lib/api/shared"

import { supabase } from "@/lib/supabaseClient"
import { useSession } from "@/state/session"

import type {
  Appointment,
  AppointmentStatus,
  Facility,
  StaffUser,
} from "@/types"

import { cn } from "@/lib/utils"

/* =====================================================
   APPOINTMENT STATUS
   ===================================================== */

const CANCELLABLE_STATUSES = [
  "Booked",
  "Pending",
  "InQueue",
  "InProgress",
]

const PRESET_CANCEL_REASONS = [
  "scheduleConflict",
  "feelingBetter",
  "foundAnotherDoctor",
  "bookedByMistake",
] as const

const OTHER_REASON = "other"

const STATUS_TONE: Record<string, StatusTone> = {
  Booked: "info",
  Pending: "pending",
  InQueue: "pending",
  InProgress: "confirmed",
  Completed: "completed",
  Cancelled: "emergency",
}

/* =====================================================
   DATE
   ===================================================== */

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )
}

/* =====================================================
   FIND SUPABASE PATIENT
   ===================================================== */

async function getSupabasePatientId(
  sessionPatient: {
    id: string
    phone?: string | null
  }
): Promise<string | null> {
  /* 1. Try logged-in patient ID */

  const {
    data: patientById,
    error: idError,
  } = await supabase
    .from("patients")
    .select("id")
    .eq("id", sessionPatient.id)
    .maybeSingle()

  if (idError) {
    console.error(
      "Error finding patient by ID:",
      idError
    )
  }

  if (patientById?.id) {
    console.log(
      "Supabase patient found by ID:",
      patientById.id
    )

    return patientById.id
  }

  /* 2. Try phone */

  if (sessionPatient.phone) {
    const normalizedPhone =
      sessionPatient.phone
        .replace(/\D/g, "")
        .replace(/^91/, "")

    const {
      data: patientByPhone,
      error: phoneError,
    } = await supabase
      .from("patients")
      .select("id, phone")
      .eq("phone", normalizedPhone)
      .maybeSingle()

    if (phoneError) {
      console.error(
        "Error finding patient by phone:",
        phoneError
      )
    }

    if (patientByPhone?.id) {
      console.log(
        "Supabase patient found by phone:",
        patientByPhone.id
      )

      return patientByPhone.id
    }
  }

  /* 3. Demo patient */

  const {
    data: demoPatient,
    error: demoError,
  } = await supabase
    .from("patients")
    .select("id")
    .eq("id", "patient-demo-001")
    .maybeSingle()

  if (demoError) {
    console.error(
      "Error finding demo patient:",
      demoError
    )
  }

  if (demoPatient?.id) {
    console.log(
      "Using demo Supabase patient:",
      demoPatient.id
    )

    return demoPatient.id
  }

  console.warn(
    "No matching patient found in Supabase."
  )

  return null
}

/* =====================================================
   GET APPOINTMENTS FROM SUPABASE
   ===================================================== */

async function getSupabaseAppointments(
  sessionPatient: {
    id: string
    phone?: string | null
  }
): Promise<{
  appointments: Appointment[]
  supabasePatientId: string | null
}> {
  const supabasePatientId =
    await getSupabasePatientId(
      sessionPatient
    )

  if (!supabasePatientId) {
    return {
      appointments: [],
      supabasePatientId: null,
    }
  }

  const {
    data,
    error,
  } = await supabase
    .from("appointments")
    .select(`
      id,
      patient_id,
      facility_id,
      doctor_id,
      type,
      slot_time,
      status,
      queue_position,
      estimated_wait_minutes,
      booked_for_name,
      booked_for_relation,
      cancellation_reason,
      created_at,
      wants_asha,
      asha_worker_id
    `)
    .eq(
      "patient_id",
      supabasePatientId
    )
    .order("slot_time", {
      ascending: true,
    })

  if (error) {
    console.error(
      "Error loading Supabase appointments:",
      error
    )

    throw error
  }

  console.log(
    "APPOINTMENTS LOADED FROM SUPABASE:",
    data
  )

  const appointments: Appointment[] =
    (data ?? []).map((row) => ({
      id: row.id,

      patientId:
        row.patient_id,

      facilityId:
        row.facility_id ??
        undefined,

      doctorId:
        row.doctor_id ??
        undefined,

      type:
        row.type,

      slotTime:
        row.slot_time,

      status:
        row.status as AppointmentStatus,

      queuePosition:
        row.queue_position ??
        undefined,

      estimatedWaitMinutes:
        row.estimated_wait_minutes ??
        undefined,

      bookedForName:
        row.booked_for_name ??
        undefined,

      bookedForRelation:
        row.booked_for_relation ??
        undefined,

      cancellationReason:
        row.cancellation_reason ??
        undefined,

      createdAt:
        row.created_at,

      wantsAsha:
        row.wants_asha,

      ashaWorkerId:
        row.asha_worker_id ??
        undefined,
    }))

  return {
    appointments,
    supabasePatientId,
  }
}

/* =====================================================
   FEEDBACK
   ===================================================== */

function AppointmentFeedback({
  appointment,
}: {
  appointment: Appointment
}) {
  const { t } = useTranslation()
  const { patient } = useSession()
  const queryClient = useQueryClient()

  const [
    draftRating,
    setDraftRating,
  ] = useState(0)

  const [
    comment,
    setComment,
  ] = useState("")

  const { data: existing } = useQuery({
    queryKey: [
      "feedback",
      appointment.id,
    ],

    queryFn: () =>
      getFeedbackForAppointment(
        appointment.id
      ),
  })

  const feedbackMutation =
    useMutation({
      mutationFn: () =>
        submitFeedback(
          appointment.id,
          appointment.doctorId!,
          patient!.id,
          draftRating,
          comment.trim() ||
            undefined
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "feedback",
            appointment.id,
          ],
        })

        queryClient.invalidateQueries({
          queryKey: [
            "doctor-rating",
            appointment.doctorId,
          ],
        })
      },
    })

  if (existing) {
    return (
      <div className="mt-3 border-t border-border pt-3">
        <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          {t(
            "patient.appointments.yourRating"
          )}
        </p>

        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(
            (n) => (
              <Star
                key={n}
                className={cn(
                  "size-4",
                  n <= existing.rating
                    ? "fill-warning text-warning"
                    : "text-muted-foreground"
                )}
              />
            )
          )}
        </div>

        {existing.comment && (
          <p className="mt-1.5 text-sm text-foreground">
            {existing.comment}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted-foreground">
        {t(
          "patient.appointments.rateVisit"
        )}
      </p>

      <div className="mt-1.5 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(
          (n) => (
            <button
              key={n}
              type="button"
              aria-label={String(n)}
              onClick={() =>
                setDraftRating(n)
              }
              className="p-0.5"
            >
              <Star
                className={cn(
                  "size-6",
                  n <= draftRating
                    ? "fill-warning text-warning"
                    : "text-muted-foreground"
                )}
              />
            </button>
          )
        )}
      </div>

      {draftRating > 0 && (
        <div className="mt-2.5 space-y-2">
          <Textarea
            value={comment}
            onChange={(e) =>
              setComment(
                e.target.value
              )
            }
            placeholder={t(
              "patient.appointments.commentPlaceholder"
            )}
            rows={2}
            className="bg-background text-sm"
          />

          <Button
            size="sm"
            className="bg-teal text-white hover:bg-teal-dark"
            disabled={
              feedbackMutation.isPending
            }
            onClick={() =>
              feedbackMutation.mutate()
            }
          >
            {feedbackMutation.isPending
              ? t("common.loading")
              : t(
                  "patient.appointments.submitRating"
                )}
          </Button>
        </div>
      )}
    </div>
  )
}

/* =====================================================
   CANCEL APPOINTMENT
   ===================================================== */

function CancelAppointmentDialog({
  appointment,
  t,
}: {
  appointment: Appointment
  t: (
    key: string,
    opts?: Record<
      string,
      unknown
    >
  ) => string
}) {
  const queryClient =
    useQueryClient()

  const [
    open,
    setOpen,
  ] = useState(false)

  const [
    selectedReason,
    setSelectedReason,
  ] = useState<
    string | null
  >(null)

  const [
    customReason,
    setCustomReason,
  ] = useState("")

  const finalReason =
    selectedReason ===
    OTHER_REASON
      ? customReason.trim()
      : selectedReason
        ? t(
            `patient.appointments.cancelReasons.${selectedReason}`
          )
        : ""

  const cancelMutation =
    useMutation({
      mutationFn: () =>
        cancelAppointment(
          appointment.id,
          finalReason
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "supabase-appointments",
          ],
        })

        setOpen(false)
        setSelectedReason(
          null
        )
        setCustomReason("")
      },
    })

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        }
      >
        <XCircle className="size-4" />

        {t(
          "patient.appointments.cancel"
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(
              "patient.appointments.cancelTitle"
            )}
          </DialogTitle>

          <DialogDescription>
            {t(
              "patient.appointments.cancelDescription"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          {PRESET_CANCEL_REASONS.map(
            (key) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setSelectedReason(
                    key
                  )
                }
                className={cn(
                  "w-full rounded-lg border-2 px-3 py-2 text-left text-sm",
                  selectedReason ===
                    key
                    ? "border-teal bg-mint"
                    : "border-border bg-background"
                )}
              >
                {t(
                  `patient.appointments.cancelReasons.${key}`
                )}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() =>
              setSelectedReason(
                OTHER_REASON
              )
            }
            className={cn(
              "w-full rounded-lg border-2 px-3 py-2 text-left text-sm",
              selectedReason ===
                OTHER_REASON
                ? "border-teal bg-mint"
                : "border-border bg-background"
            )}
          >
            {t(
              "patient.appointments.cancelReasons.other"
            )}
          </button>

          {selectedReason ===
            OTHER_REASON && (
            <Textarea
              autoFocus
              value={customReason}
              onChange={(e) =>
                setCustomReason(
                  e.target.value
                )
              }
              placeholder={t(
                "patient.appointments.cancelReasonPlaceholder"
              )}
              rows={3}
              className="bg-background text-sm"
            />
          )}
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={
              !finalReason.trim() ||
              cancelMutation.isPending
            }
            onClick={() =>
              cancelMutation.mutate()
            }
          >
            {cancelMutation.isPending
              ? t("common.loading")
              : t(
                  "patient.appointments.confirmCancel"
                )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* =====================================================
   APPOINTMENT CARD
   ===================================================== */

function AppointmentCard({
  appointment,
  facility,
  doctor,
  dateFormatter,
  timeFormatter,
  t,
}: {
  appointment: Appointment
  facility?: Facility
  doctor?: StaffUser
  dateFormatter: Intl.DateTimeFormat
  timeFormatter: Intl.DateTimeFormat
  t: (
    key: string,
    opts?: Record<
      string,
      unknown
    >
  ) => string
}) {
  const slot =
    new Date(
      appointment.slotTime
    )

  const status =
    String(
      appointment.status
    )

  const statusLabel =
    status === "Pending"
      ? "Pending"
      : t(
          `patient.appointments.status.${status}`
        )

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {doctor ? (
            <Link
              to={`/patient/doctor/${doctor.id}`}
              className="flex items-center gap-1.5 truncate text-base font-semibold text-foreground hover:underline"
            >
              <span className="truncate">
                {doctor.name}
              </span>

              {doctor.verificationStatus ===
                "Verified" && (
                <ShieldCheck
                  className="size-4 shrink-0 text-success"
                  aria-label={t(
                    "patient.appointments.verifiedDoctor"
                  )}
                />
              )}
            </Link>
          ) : (
            <p className="truncate text-base font-semibold text-foreground">
              {t(
                "patient.appointments.unassignedDoctor"
              )}
            </p>
          )}

          {facility && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />

              <span className="truncate">
                {facility.name}
              </span>
            </p>
          )}

          {appointment.bookedForName && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-teal-dark">
              <Users className="size-3.5" />

              <span className="truncate">
                {t(
                  "patient.appointments.bookedFor",
                  {
                    name:
                      appointment.bookedForName,

                    relation: t(
                      `patient.booking.bookedFor.${appointment.bookedForRelation?.toLowerCase()}`
                    ),
                  }
                )}
              </span>
            </p>
          )}
        </div>

        <StatusBadge
          tone={
            STATUS_TONE[status] ??
            "info"
          }
          label={statusLabel}
          className="shrink-0"
        />
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-4 text-teal" />

          {dateFormatter.format(
            slot
          )}{" "}
          ·{" "}
          {timeFormatter.format(
            slot
          )}
        </span>

        {appointment.type ===
          "Teleconsult" && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Video className="size-4" />

            {t(
              "patient.teleconsult.title"
            )}
          </span>
        )}
      </div>

      {/* QUEUE */}

      {appointment.queuePosition !==
        undefined && (
        <p className="mt-2 text-sm font-medium text-teal-dark">
          {t(
            "patient.home.statusQueue"
          )}{" "}
          #{appointment.queuePosition}

          {appointment.estimatedWaitMinutes !==
            undefined && (
            <>
              {" · "}
              {
                appointment.estimatedWaitMinutes
              }{" "}
              {t(
                "patient.booking.minutes"
              )}
            </>
          )}
        </p>
      )}

      {/* CANCELLED REASON */}

      {status === "Cancelled" &&
        appointment.cancellationReason && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              "patient.appointments.cancelledReason",
              {
                reason:
                  appointment.cancellationReason,
              }
            )}
          </p>
        )}

      {/* FEEDBACK */}

      {status === "Completed" &&
        appointment.doctorId && (
          <AppointmentFeedback
            appointment={
              appointment
            }
          />
        )}

      {/* CANCEL */}

      {CANCELLABLE_STATUSES.includes(
        status
      ) && (
        <div className="mt-3 border-t border-border pt-3">
          <CancelAppointmentDialog
            appointment={
              appointment
            }
            t={t}
          />
        </div>
      )}
    </div>
  )
}

/* =====================================================
   MAIN PAGE
   ===================================================== */

export function MyAppointmentsPage() {
  const { t, i18n } =
    useTranslation()

  const { patient } =
    useSession()

  const queryClient =
    useQueryClient()

  const [
    realtimeStatus,
    setRealtimeStatus,
  ] = useState(
    "CONNECTING"
  )

  /* =================================================
     LOAD APPOINTMENTS
     ================================================= */

  const {
    data: appointmentResult,
    isLoading:
      appointmentsLoading,
    error:
      appointmentsError,
  } = useQuery({
    queryKey: [
      "supabase-appointments",
      patient?.id,
      patient?.phone,
    ],

    queryFn: () =>
      getSupabaseAppointments({
        id: patient!.id,
        phone: patient!.phone,
      }),

    enabled: !!patient,

    staleTime: 0,

    refetchOnWindowFocus: true,
  })

  const appointments =
    appointmentResult
      ?.appointments ?? []

  const supabasePatientId =
    appointmentResult
      ?.supabasePatientId

  /* =================================================
     FACILITIES
     ================================================= */

  const {
    data: facilities,
  } = useQuery({
    queryKey: [
      "facilities",
    ],

    queryFn:
      getFacilities,
  })

  /* =================================================
     STAFF / DOCTORS
     ================================================= */

  const {
    data: staff,
  } = useQuery({
    queryKey: [
      "staff",
    ],

    queryFn:
      getStaff,
  })

  /* =================================================
     SUPABASE REALTIME

     IMPORTANT:
     No patient filter here.

     This makes the demo much more reliable.
     When ANY appointment changes, we reload the
     appointments and then display the correct
     appointment belonging to the current patient.
     ================================================= */

  useEffect(() => {
    if (!supabasePatientId) {
      console.log(
        "Realtime waiting for Supabase patient ID"
      )

      return
    }

    console.log(
      "Starting GLOBAL appointment realtime..."
    )

    const channel =
      supabase
        .channel(
          `appointments-realtime-${Date.now()}`
        )

        /* INSERT */

        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "appointments",
          },
          async (payload) => {
            console.log(
              "🔵 LIVE APPOINTMENT INSERT:",
              payload
            )

            await queryClient.refetchQueries({
              queryKey: [
                "supabase-appointments",
                patient?.id,
                patient?.phone,
              ],
              type: "active",
            })
          }
        )

        /* UPDATE */

        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "appointments",
          },
          async (payload) => {
            console.log(
              "🟢 LIVE APPOINTMENT UPDATE:",
              payload
            )

            console.log(
              "OLD APPOINTMENT:",
              payload.old
            )

            console.log(
              "NEW APPOINTMENT:",
              payload.new
            )

            /*
             * Immediately fetch latest data
             * from Supabase.
             */
            await queryClient.refetchQueries({
              queryKey: [
                "supabase-appointments",
                patient?.id,
                patient?.phone,
              ],
              type: "active",
            })

            console.log(
              "✅ Appointment data refreshed after UPDATE"
            )
          }
        )

        /* DELETE */

        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "appointments",
          },
          async (payload) => {
            console.log(
              "🔴 LIVE APPOINTMENT DELETE:",
              payload
            )

            await queryClient.refetchQueries({
              queryKey: [
                "supabase-appointments",
                patient?.id,
                patient?.phone,
              ],
              type: "active",
            })
          }
        )

        /* SUBSCRIBE */

        .subscribe(
          (status) => {
            console.log(
              "🔥 Appointment Realtime connection:",
              status
            )

            setRealtimeStatus(
              status
            )
          }
        )

    return () => {
      console.log(
        "Removing appointment realtime channel"
      )

      supabase.removeChannel(
        channel
      )
    }
  }, [
    supabasePatientId,
    patient?.id,
    patient?.phone,
    queryClient,
  ])

  /* =================================================
     DATE FILTER
     ================================================= */

  const todayStart =
    startOfDay(
      new Date()
    )

  const tomorrowStart =
    new Date(
      todayStart
    )

  tomorrowStart.setDate(
    tomorrowStart.getDate() +
      1
  )

  const sorted = [
    ...appointments,
  ].sort(
    (a, b) =>
      new Date(
        a.slotTime
      ).getTime() -
      new Date(
        b.slotTime
      ).getTime()
  )

  const today =
    sorted.filter(
      (a) => {
        const time =
          new Date(
            a.slotTime
          )

        return (
          time >=
            todayStart &&
          time <
            tomorrowStart
        )
      }
    )

  const upcoming =
    sorted.filter(
      (a) =>
        new Date(
          a.slotTime
        ) >=
        tomorrowStart
    )

  const past =
    sorted
      .filter(
        (a) =>
          new Date(
            a.slotTime
          ) <
          todayStart
      )
      .reverse()

  /* =================================================
     FORMATTERS
     ================================================= */

  const dateFormatter =
    new Intl.DateTimeFormat(
      i18n.language,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    )

  const timeFormatter =
    new Intl.DateTimeFormat(
      i18n.language,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    )

  /* =================================================
     RENDER SECTION
     ================================================= */

  function renderSection(
    titleKey: string,
    items: Appointment[],
    emptyKey: string
  ) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          {t(titleKey)}
        </h2>

        {items.length ? (
          <div className="space-y-3">
            {items.map(
              (
                appointment
              ) => (
                <AppointmentCard
                  key={
                    appointment.id
                  }
                  appointment={
                    appointment
                  }
                  facility={facilities?.find(
                    (f) =>
                      f.id ===
                      appointment.facilityId
                  )}
                  doctor={staff?.find(
                    (s) =>
                      s.id ===
                      appointment.doctorId
                  )}
                  dateFormatter={
                    dateFormatter
                  }
                  timeFormatter={
                    timeFormatter
                  }
                  t={t}
                />
              )
            )}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            {t(emptyKey)}
          </p>
        )}
      </div>
    )
  }

  /* =================================================
     PAGE
     ================================================= */

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t(
            "patient.appointments.title"
          )}
        </h1>

        <p className="text-sm text-muted-foreground">
          {t(
            "patient.appointments.subtitle"
          )}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          {realtimeStatus ===
          "SUBSCRIBED"
            ? "🟢 Live appointment updates connected"
            : `🟡 Realtime: ${realtimeStatus}`}
        </p>
      </div>

      {appointmentsLoading && (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Loading appointments...
        </div>
      )}

      {appointmentsError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load appointments
          from Supabase.
          <br />
          Check the browser console
          for the exact error.
        </div>
      )}

      {!appointmentsLoading &&
        !appointmentsError &&
        !appointments.length && (
          <EmptyState
            illustration={
              AllCaughtUp
            }
            title={t(
              "patient.appointments.empty"
            )}
          />
        )}

      {!!appointments.length && (
        <div className="space-y-8">

          {renderSection(
            "patient.appointments.today",
            today,
            "patient.appointments.noneToday"
          )}

          {renderSection(
            "patient.appointments.upcoming",
            upcoming,
            "patient.appointments.noneUpcoming"
          )}

          {renderSection(
            "patient.appointments.past",
            past,
            "patient.appointments.nonePast"
          )}

        </div>
      )}
    </div>
  )
}