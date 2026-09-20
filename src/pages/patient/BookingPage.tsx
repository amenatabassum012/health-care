import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarClock, Clock, ExternalLink, HeartHandshake, Hospital, MapPin, Star, Users, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SpeakButton } from "@/components/shared/SpeakButton"
import { getDoctorRatingSummary, getFacilities, getSpecialties, getStaff } from "@/lib/api/shared"
import { createAppointment } from "@/lib/api/patient"
import { useSession } from "@/state/session"
import { facilityLabel } from "@/mocks/facilities"
import type { AppointmentType, DependentRelation, Specialty, StaffUser } from "@/types"
import { cn } from "@/lib/utils"

const RELATIONS: DependentRelation[] = ["Child", "Elder", "Other"]

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === "object" && "message" in error) return String((error as { message: unknown }).message)
  return String(error)
}

function DoctorOption({
  doc,
  specialty,
  selected,
  onSelect,
  t,
}: {
  doc: StaffUser
  specialty?: Specialty
  selected: boolean
  onSelect: () => void
  t: (key: string, opts?: Record<string, unknown>) => string
}) {
  const { data: ratingSummary } = useQuery({
    queryKey: ["doctor-rating", doc.id],
    queryFn: () => getDoctorRatingSummary(doc.id),
  })
  const topQualification = doc.qualifications?.[doc.qualifications.length - 1]

  const speakText = [
    doc.name,
    specialty?.label,
    doc.consultationFeeInr !== undefined ? `₹${doc.consultationFeeInr}` : "",
    ratingSummary?.rating !== undefined ? `${ratingSummary.rating} ${t("patient.doctorProfile.rating")}` : "",
    doc.availability,
  ]
    .filter(Boolean)
    .join(". ")

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "w-full cursor-pointer rounded-xl border-2 px-4 py-3 text-left",
        selected ? "border-teal bg-mint" : "border-border bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{doc.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {specialty?.label}
              {topQualification ? ` · ${topQualification.degree}` : ""}
            </p>
          </div>
          <SpeakButton text={speakText} size="sm" />
        </div>
        {doc.consultationFeeInr !== undefined && (
          <span className="shrink-0 text-sm font-bold text-teal-dark">₹{doc.consultationFeeInr}</span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {ratingSummary?.rating !== undefined && (
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-warning text-warning" />
            <span className="font-semibold text-foreground">{ratingSummary.rating}</span>
            {ratingSummary.ratingCount !== undefined && <span>({ratingSummary.ratingCount})</span>}
          </span>
        )}
        {doc.availability && (
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {doc.availability}
          </span>
        )}
      </div>

      <a
        href={`/patient/doctor/${doc.id}`}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-teal hover:underline"
      >
        {t("patient.booking.viewProfile")}
        <ExternalLink className="size-3" />
      </a>
    </div>
  )
}

export function BookingPage() {
  const { t } = useTranslation()
  const { patient } = useSession()
  const queryClient = useQueryClient()
  const [type, setType] = useState<AppointmentType>("InPerson")
  const [facilityId, setFacilityId] = useState<string | null>(null)
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [bookedForName, setBookedForName] = useState("")
  const [bookedForRelation, setBookedForRelation] = useState<DependentRelation>("Child")
  const [wantsAsha, setWantsAsha] = useState(false)

  const { data: facilities } = useQuery({ queryKey: ["facilities"], queryFn: getFacilities })
  const { data: staff } = useQuery({ queryKey: ["staff"], queryFn: getStaff })
  const { data: specialties } = useQuery({ queryKey: ["specialties"], queryFn: getSpecialties })

  const availableDoctors = staff?.filter(
    (s) =>
      s.facilityId === facilityId &&
      s.verificationStatus === "Verified" &&
      (s.role === "Doctor" || s.role === "Specialist")
  )

  const bookMutation = useMutation({
    mutationFn: () =>
      createAppointment(
        patient!.id,
        facilityId!,
        type,
        doctorId ?? undefined,
        patient?.isGuardianManaged && bookedForName
          ? { name: bookedForName, relation: bookedForRelation }
          : undefined,
        wantsAsha
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", patient?.id] })
      queryClient.invalidateQueries({ queryKey: ["home-summary", patient?.id] })
    },
  })

  if (bookMutation.isSuccess) {
    const appt = bookMutation.data
    return (
      <div className="flex flex-col items-center px-1 py-10 text-center">
        <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-success/15 text-success">
          <CalendarClock className="size-8" />
        </span>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">{t("patient.booking.booked")}</h1>
          <SpeakButton
            autoPlay
            text={`${t("patient.booking.booked")}. ${t("patient.booking.queuePosition")} ${appt.queuePosition}. ${t(
              "patient.booking.estimatedWait"
            )}: ${appt.estimatedWaitMinutes} ${t("patient.booking.minutes")}`}
          />
        </div>
        {appt.bookedForName && (
          <p className="mt-1 text-sm text-muted-foreground">
            {t("patient.booking.bookedFor.summary", {
              name: appt.bookedForName,
              relation: t(`patient.booking.bookedFor.${appt.bookedForRelation?.toLowerCase()}`),
            })}
          </p>
        )}
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
        <div className="mb-3 flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{t("patient.booking.chooseFacility")}</p>
          <SpeakButton autoPlay text={t("patient.booking.chooseFacility")} size="sm" />
        </div>
        <div className="space-y-2.5">
          {facilities?.map((f) => (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setFacilityId(f.id)
                setDoctorId(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setFacilityId(f.id)
                  setDoctorId(null)
                }
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3 text-left",
                facilityId === f.id ? "border-teal bg-mint" : "border-border bg-card"
              )}
            >
              <span>
                <span className="block text-sm font-semibold text-foreground">{facilityLabel(f)}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {f.distanceKm} {t("common.km")}
                </span>
              </span>
              <SpeakButton text={`${facilityLabel(f)}. ${f.distanceKm} ${t("common.km")}`} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {facilityId && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{t("patient.booking.chooseDoctor")}</p>
            <SpeakButton autoPlay text={t("patient.booking.chooseDoctor")} size="sm" />
          </div>
          <div className="space-y-2.5">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setDoctorId(null)}
              onKeyDown={(e) => e.key === "Enter" && setDoctorId(null)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left",
                doctorId === null ? "border-teal bg-mint" : "border-border bg-card"
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Users className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{t("patient.booking.anyDoctor")}</span>
                <span className="block text-xs text-muted-foreground">{t("patient.booking.anyDoctorDesc")}</span>
              </span>
              <SpeakButton
                text={`${t("patient.booking.anyDoctor")}. ${t("patient.booking.anyDoctorDesc")}`}
                size="sm"
              />
            </div>

            {availableDoctors?.map((doc) => (
              <DoctorOption
                key={doc.id}
                doc={doc}
                specialty={specialties?.find((s) => s.id === doc.specialtyId)}
                selected={doctorId === doc.id}
                onSelect={() => setDoctorId(doc.id)}
                t={t}
              />
            ))}

            {availableDoctors?.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                {t("patient.booking.noDoctorsListed")}
              </p>
            )}
          </div>
        </div>
      )}

      {patient?.isGuardianManaged && (
        <div className="space-y-3 rounded-2xl border border-teal/30 bg-mint/40 p-4">
          <p className="text-sm font-semibold text-foreground">{t("patient.booking.bookedFor.title")}</p>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("patient.booking.bookedFor.name")}</Label>
            <Input
              value={bookedForName}
              onChange={(e) => setBookedForName(e.target.value)}
              placeholder={t("patient.booking.bookedFor.namePlaceholder")}
              className="h-11 bg-background"
            />
          </div>
          <div className="flex gap-2">
            {RELATIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setBookedForRelation(r)}
                className={cn(
                  "flex-1 rounded-lg border-2 py-2 text-xs font-medium",
                  bookedForRelation === r ? "border-teal bg-teal text-white" : "border-border bg-background text-foreground"
                )}
              >
                {t(`patient.booking.bookedFor.${r.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {facilityId && (
        <button
          type="button"
          onClick={() => setWantsAsha((v) => !v)}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left",
            wantsAsha ? "border-teal bg-mint" : "border-border bg-card"
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal/15 text-teal-dark">
            <HeartHandshake className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">{t("patient.booking.wantsAsha")}</span>
            <span className="block text-xs text-muted-foreground">{t("patient.booking.wantsAshaDesc")}</span>
          </span>
          <span
            className={cn(
              "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
              wantsAsha ? "bg-teal justify-end" : "bg-muted justify-start"
            )}
          >
            <span className="size-5 rounded-full bg-white shadow" />
          </span>
        </button>
      )}

      {bookMutation.isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive">
          {getErrorMessage(bookMutation.error)}
        </p>
      )}

      <Button
        size="xl"
        className="w-full bg-teal text-white hover:bg-teal-dark"
        disabled={!facilityId || (patient?.isGuardianManaged && !bookedForName) || bookMutation.isPending}
        onClick={() => bookMutation.mutate()}
      >
        {bookMutation.isPending ? t("common.loading") : t("patient.booking.confirm")}
      </Button>
    </div>
  )
}