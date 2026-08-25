import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Award,
  FileCheck2,
  GraduationCap,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { AllCaughtUp } from "@/components/illustrations/AllCaughtUp"
import { CertificateViewButton } from "@/components/shared/CertificateViewButton"
import { getFacilities, getSpecialties, getStaffById } from "@/lib/api/shared"
import type { VerificationStatus } from "@/types"

const VERIFICATION_TONE: Record<VerificationStatus, StatusTone> = {
  Verified: "completed",
  Pending: "pending",
  Rejected: "emergency",
}

const VERIFICATION_ICON: Record<VerificationStatus, typeof ShieldCheck> = {
  Verified: ShieldCheck,
  Pending: ShieldAlert,
  Rejected: ShieldX,
}

export function DoctorProfilePage() {
  const { doctorId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: doctor } = useQuery({
    queryKey: ["staff-profile", doctorId],
    queryFn: () => getStaffById(doctorId!),
    enabled: !!doctorId,
  })
  const { data: facilities } = useQuery({ queryKey: ["facilities"], queryFn: getFacilities })
  const { data: specialties } = useQuery({ queryKey: ["specialties"], queryFn: getSpecialties })

  const backButton = (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      {t("common.back")}
    </button>
  )

  if (doctor === undefined) return null

  if (!doctor) {
    return (
      <div className="space-y-6">
        {backButton}
        <EmptyState illustration={AllCaughtUp} title={t("patient.doctorProfile.notFound")} />
      </div>
    )
  }

  const facility = facilities?.find((f) => f.id === doctor.facilityId)
  const specialty = specialties?.find((s) => s.id === doctor.specialtyId)
  const VerificationIcon = VERIFICATION_ICON[doctor.verificationStatus]

  return (
    <div className="space-y-6">
      {backButton}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-foreground">{doctor.name}</p>
            <p className="text-sm text-muted-foreground">
              {doctor.role}
              {specialty ? ` · ${specialty.label}` : ""}
            </p>
            {facility && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {facility.name}
              </p>
            )}
          </div>
          <StatusBadge
            tone={VERIFICATION_TONE[doctor.verificationStatus]}
            label={t(`status.${doctor.verificationStatus.toLowerCase()}`)}
          />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <VerificationIcon className="size-3.5" />
          {doctor.verificationStatus === "Verified"
            ? t("patient.doctorProfile.verifiedNote")
            : t("patient.doctorProfile.unverifiedNote")}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          <GraduationCap className="size-4" />
          {t("doctor.profile.qualifications")}
        </h2>

        {!doctor.qualifications?.length && (
          <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
            {t("doctor.profile.noQualifications")}
          </p>
        )}

        {!!doctor.qualifications?.length && (
          <div className="space-y-2.5">
            {doctor.qualifications.map((q) => (
              <div key={q.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint text-teal-dark">
                  <Award className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{q.degree}</p>
                  <p className="text-xs text-muted-foreground">{q.institution} · {q.year}</p>
                  {q.fileName && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <p className="flex items-center gap-1 text-xs text-success">
                        <FileCheck2 className="size-3" />
                        {q.fileName}
                      </p>
                      <CertificateViewButton certificateId={q.id} fileName={q.fileName} label={t("certificate.view")} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
