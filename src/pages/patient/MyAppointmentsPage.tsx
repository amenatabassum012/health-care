import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { CalendarClock, MapPin, ShieldCheck, Star, Users, Video, XCircle } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { AllCaughtUp } from "@/components/illustrations/AllCaughtUp"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
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
import { cancelAppointment, getAppointments, getFeedbackForAppointment, submitFeedback } from "@/lib/api/patient"
import { getFacilities, getStaff } from "@/lib/api/shared"
import { useSession } from "@/state/session"
import type { Appointment, AppointmentStatus, Facility, StaffUser } from "@/types"
import { cn } from "@/lib/utils"

const CANCELLABLE_STATUSES: AppointmentStatus[] = ["Booked", "InQueue", "InProgress"]

const PRESET_CANCEL_REASONS = [
  "scheduleConflict",
  "feelingBetter",
  "foundAnotherDoctor",
  "bookedByMistake",
] as const
const OTHER_REASON = "other"

const STATUS_TONE: Record<AppointmentStatus, StatusTone> = {
  Booked: "info",
  InQueue: "pending",
  InProgress: "confirmed",
  Completed: "completed",
  Cancelled: "emergency",
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function AppointmentFeedback({ appointment }: { appointment: Appointment }) {
  const { t } = useTranslation()
  const { patient } = useSession()
  const queryClient = useQueryClient()
  const [draftRating, setDraftRating] = useState(0)
  const [comment, setComment] = useState("")

  const { data: existing } = useQuery({
    queryKey: ["feedback", appointment.id],
    queryFn: () => getFeedbackForAppointment(appointment.id),
  })

  const feedbackMutation = useMutation({
    mutationFn: () =>
      submitFeedback(appointment.id, appointment.doctorId!, patient!.id, draftRating, comment.trim() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", appointment.id] })
      queryClient.invalidateQueries({ queryKey: ["doctor-rating", appointment.doctorId] })
    },
  })

  if (existing) {
    return (
      <div className="mt-3 border-t border-border pt-3">
        <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          {t("patient.appointments.yourRating")}
        </p>
        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={cn("size-4", n <= existing.rating ? "fill-warning text-warning" : "text-muted-foreground")}
            />
          ))}
        </div>
        {existing.comment && <p className="mt-1.5 text-sm text-foreground">{existing.comment}</p>}
      </div>
    )
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted-foreground">{t("patient.appointments.rateVisit")}</p>
      <div className="mt-1.5 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={String(n)}
            onClick={() => setDraftRating(n)}
            className="p-0.5"
          >
            <Star className={cn("size-6", n <= draftRating ? "fill-warning text-warning" : "text-muted-foreground")} />
          </button>
        ))}
      </div>
      {draftRating > 0 && (
        <div className="mt-2.5 space-y-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("patient.appointments.commentPlaceholder")}
            rows={2}
            className="bg-background text-sm"
          />
          <Button
            size="sm"
            className="bg-teal text-white hover:bg-teal-dark"
            disabled={feedbackMutation.isPending}
            onClick={() => feedbackMutation.mutate()}
          >
            {feedbackMutation.isPending ? t("common.loading") : t("patient.appointments.submitRating")}
          </Button>
        </div>
      )}
    </div>
  )
}

function CancelAppointmentDialog({
  appointment,
  t,
}: {
  appointment: Appointment
  t: (key: string, opts?: Record<string, unknown>) => string
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [customReason, setCustomReason] = useState("")

  const finalReason =
    selectedReason === OTHER_REASON
      ? customReason.trim()
      : selectedReason
        ? t(`patient.appointments.cancelReasons.${selectedReason}`)
        : ""

  const cancelMutation = useMutation({
    mutationFn: () => cancelAppointment(appointment.id, finalReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", appointment.patientId] })
      setOpen(false)
      setSelectedReason(null)
      setCustomReason("")
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        {t("patient.appointments.cancel")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("patient.appointments.cancelTitle")}</DialogTitle>
          <DialogDescription>{t("patient.appointments.cancelDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          {PRESET_CANCEL_REASONS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedReason(key)}
              className={cn(
                "w-full rounded-lg border-2 px-3 py-2 text-left text-sm",
                selectedReason === key ? "border-teal bg-mint" : "border-border bg-background"
              )}
            >
              {t(`patient.appointments.cancelReasons.${key}`)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedReason(OTHER_REASON)}
            className={cn(
              "w-full rounded-lg border-2 px-3 py-2 text-left text-sm",
              selectedReason === OTHER_REASON ? "border-teal bg-mint" : "border-border bg-background"
            )}
          >
            {t("patient.appointments.cancelReasons.other")}
          </button>
          {selectedReason === OTHER_REASON && (
            <Textarea
              autoFocus
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder={t("patient.appointments.cancelReasonPlaceholder")}
              rows={3}
              className="bg-background text-sm"
            />
          )}
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={!finalReason.trim() || cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            {cancelMutation.isPending ? t("common.loading") : t("patient.appointments.confirmCancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
  t: (key: string, opts?: Record<string, unknown>) => string
}) {
  const slot = new Date(appointment.slotTime)

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {doctor ? (
            <Link
              to={`/patient/doctor/${doctor.id}`}
              className="flex items-center gap-1.5 truncate text-base font-semibold text-foreground hover:underline"
            >
              <span className="truncate">{doctor.name}</span>
              {doctor.verificationStatus === "Verified" && (
                <ShieldCheck
                  className="size-4 shrink-0 text-success"
                  aria-label={t("patient.appointments.verifiedDoctor")}
                />
              )}
            </Link>
          ) : (
            <p className="truncate text-base font-semibold text-foreground">
              {t("patient.appointments.unassignedDoctor")}
            </p>
          )}
          {facility && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{facility.name}</span>
            </p>
          )}
          {appointment.bookedForName && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-teal-dark">
              <Users className="size-3.5 shrink-0" />
              <span className="truncate">
                {t("patient.appointments.bookedFor", {
                  name: appointment.bookedForName,
                  relation: t(`patient.booking.bookedFor.${appointment.bookedForRelation?.toLowerCase()}`),
                })}
              </span>
            </p>
          )}
        </div>
        <StatusBadge
          tone={STATUS_TONE[appointment.status]}
          label={t(`patient.appointments.status.${appointment.status}`)}
          className="shrink-0"
        />
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-4 text-teal" />
          {dateFormatter.format(slot)} · {timeFormatter.format(slot)}
        </span>
        {appointment.type === "Teleconsult" && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Video className="size-4" />
            {t("patient.teleconsult.title")}
          </span>
        )}
      </div>

      {appointment.status === "InQueue" && appointment.queuePosition !== undefined && (
        <p className="mt-2 text-sm font-medium text-teal-dark">
          {t("patient.home.statusQueue")} #{appointment.queuePosition} ·{" "}
          {appointment.estimatedWaitMinutes} {t("patient.booking.minutes")}
        </p>
      )}

      {appointment.status === "Cancelled" && appointment.cancellationReason && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t("patient.appointments.cancelledReason", { reason: appointment.cancellationReason })}
        </p>
      )}

      {appointment.status === "Completed" && appointment.doctorId && (
        <AppointmentFeedback appointment={appointment} />
      )}

      {CANCELLABLE_STATUSES.includes(appointment.status) && (
        <div className="mt-3 border-t border-border pt-3">
          <CancelAppointmentDialog appointment={appointment} t={t} />
        </div>
      )}
    </div>
  )
}

export function MyAppointmentsPage() {
  const { t, i18n } = useTranslation()
  const { patient } = useSession()

  const { data: appointments } = useQuery({
    queryKey: ["appointments", patient?.id],
    queryFn: () => getAppointments(patient!.id),
    enabled: !!patient,
  })
  const { data: facilities } = useQuery({ queryKey: ["facilities"], queryFn: getFacilities })
  const { data: staff } = useQuery({ queryKey: ["staff"], queryFn: getStaff })

  const todayStart = startOfDay(new Date())
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  const sorted = [...(appointments ?? [])].sort(
    (a, b) => new Date(a.slotTime).getTime() - new Date(b.slotTime).getTime()
  )
  const today = sorted.filter((a) => {
    const t = new Date(a.slotTime)
    return t >= todayStart && t < tomorrowStart
  })
  const upcoming = sorted.filter((a) => new Date(a.slotTime) >= tomorrowStart)
  const past = sorted.filter((a) => new Date(a.slotTime) < todayStart).reverse()

  const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const timeFormatter = new Intl.DateTimeFormat(i18n.language, {
    hour: "numeric",
    minute: "2-digit",
  })

  function renderSection(titleKey: string, items: Appointment[], emptyKey: string) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          {t(titleKey)}
        </h2>
        {items.length ? (
          <div className="space-y-3">
            {items.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                facility={facilities?.find((f) => f.id === appointment.facilityId)}
                doctor={staff?.find((s) => s.id === appointment.doctorId)}
                dateFormatter={dateFormatter}
                timeFormatter={timeFormatter}
                t={t}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            {t(emptyKey)}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("patient.appointments.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("patient.appointments.subtitle")}</p>
      </div>

      {!appointments?.length && (
        <EmptyState illustration={AllCaughtUp} title={t("patient.appointments.empty")} />
      )}

      {!!appointments?.length && (
        <div className="space-y-8">
          {renderSection("patient.appointments.today", today, "patient.appointments.noneToday")}
          {renderSection("patient.appointments.upcoming", upcoming, "patient.appointments.noneUpcoming")}
          {renderSection("patient.appointments.past", past, "patient.appointments.nonePast")}
        </div>
      )}
    </div>
  )
}
