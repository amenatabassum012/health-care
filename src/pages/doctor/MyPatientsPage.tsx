import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { ArrowRight, CalendarClock, MapPin, Users, Video } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { AllCaughtUp } from "@/components/illustrations/AllCaughtUp"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { getDoctorAppointments, getReferralsMadeByDoctor } from "@/lib/api/doctor"
import { getFacilities, getStaff } from "@/lib/api/shared"
import { useSession } from "@/state/session"
import type { Appointment, AppointmentStatus, ReferralStatus } from "@/types"

type DoctorAppointment = Appointment & { patientName: string }

const STATUS_TONE: Record<AppointmentStatus, StatusTone> = {
  Booked: "info",
  InQueue: "pending",
  InProgress: "confirmed",
  Completed: "completed",
  Cancelled: "emergency",
}

const REFERRAL_TONE: Record<ReferralStatus, StatusTone> = {
  Pending: "pending",
  Confirmed: "confirmed",
  Completed: "completed",
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function MyPatientsPage() {
  const { t, i18n } = useTranslation()
  const { staff } = useSession()

  const { data: appointments } = useQuery({
    queryKey: ["doctor-appointments", staff?.id],
    queryFn: () => getDoctorAppointments(staff!.id),
    enabled: !!staff,
  })
  const { data: facilities } = useQuery({ queryKey: ["facilities"], queryFn: getFacilities })
  const { data: staffDirectory } = useQuery({ queryKey: ["staff"], queryFn: getStaff })
  const { data: referralsMade } = useQuery({
    queryKey: ["referrals-made", staff?.id],
    queryFn: () => getReferralsMadeByDoctor(staff!.id),
    enabled: !!staff,
  })

  const todayStart = startOfDay(new Date())
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  const sorted = [...(appointments ?? [])].sort(
    (a, b) => new Date(a.slotTime).getTime() - new Date(b.slotTime).getTime()
  )
  const today = sorted.filter((a) => {
    const slot = new Date(a.slotTime)
    return slot >= todayStart && slot < tomorrowStart
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

  function renderAppointment(appointment: DoctorAppointment, linkable: boolean) {
    const facility = facilities?.find((f) => f.id === appointment.facilityId)
    const slot = new Date(appointment.slotTime)

    const body = (
      <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
              {appointment.bookedForName ?? appointment.patientName}
            </p>
            {appointment.bookedForName && (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3 shrink-0" />
                {t("doctor.patients.bookedByGuardian", {
                  relation: t(`patient.booking.bookedFor.${appointment.bookedForRelation?.toLowerCase()}`),
                  guardian: appointment.patientName,
                })}
              </p>
            )}
            {facility && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{facility.name}</span>
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
            {t("patient.home.statusQueue")} #{appointment.queuePosition}
          </p>
        )}
      </div>
    )

    return linkable ? (
      <Link key={appointment.id} to={`/doctor/consultation/${appointment.id}`} className="block">
        {body}
      </Link>
    ) : (
      <div key={appointment.id}>{body}</div>
    )
  }

  function renderSection(titleKey: string, items: DoctorAppointment[], emptyKey: string, linkable: boolean) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">{t(titleKey)}</h2>
        {items.length ? (
          <div className="space-y-3">{items.map((a) => renderAppointment(a, linkable))}</div>
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
        <h1 className="text-2xl font-bold text-foreground">{t("doctor.patients.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("doctor.patients.subtitle")}</p>
      </div>

      {!appointments?.length && (
        <EmptyState illustration={AllCaughtUp} title={t("doctor.patients.empty")} />
      )}

      {!!appointments?.length && (
        <div className="space-y-8">
          {renderSection("patient.appointments.today", today, "doctor.patients.noneToday", true)}
          {renderSection("patient.appointments.upcoming", upcoming, "doctor.patients.noneUpcoming", false)}
          {renderSection("patient.appointments.past", past, "doctor.patients.nonePast", false)}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          {t("doctor.patients.referredOut")}
        </h2>
        {referralsMade?.length ? (
          <div className="space-y-3">
            {referralsMade.map((r) => {
              const toFacility = facilities?.find((f) => f.id === r.toFacilityId)
              const toDoctor = staffDirectory?.find((s) => s.id === r.toDoctorId)
              return (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-foreground">{r.patientName}</p>
                    <StatusBadge tone={REFERRAL_TONE[r.status]} label={t(`patient.referral.${r.status.toLowerCase()}`)} />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ArrowRight className="size-3.5 shrink-0" />
                    {toDoctor ? toDoctor.name : t("patient.appointments.unassignedDoctor")}
                    {toFacility ? ` · ${toFacility.name}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-foreground">{r.structuredSummary}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            {t("doctor.patients.noneReferredOut")}
          </p>
        )}
      </div>
    </div>
  )
}
