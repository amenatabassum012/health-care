import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { CalendarClock, MapPin, ShieldCheck, Users, Video } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { AllCaughtUp } from "@/components/illustrations/AllCaughtUp"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { getAppointments } from "@/lib/api/patient"
import { getFacilities, getStaff } from "@/lib/api/shared"
import { useSession } from "@/state/session"
import type { Appointment, AppointmentStatus } from "@/types"
import { cn } from "@/lib/utils"

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

  function renderAppointment(appointment: Appointment) {
    const facility = facilities?.find((f) => f.id === appointment.facilityId)
    const doctor = staff?.find((s) => s.id === appointment.doctorId)
    const slot = new Date(appointment.slotTime)

    return (
      <div key={appointment.id} className="rounded-2xl border border-border bg-card p-4">
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
      </div>
    )
  }

  function renderSection(titleKey: string, items: Appointment[], emptyKey: string) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          {t(titleKey)}
        </h2>
        {items.length ? (
          <div className={cn("space-y-3")}>{items.map(renderAppointment)}</div>
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
