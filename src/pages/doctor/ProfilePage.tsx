import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Award,
  FileCheck2,
  GraduationCap,
  Plus,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UploadCloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { CertificateViewButton } from "@/components/shared/CertificateViewButton"
import { addQualification } from "@/lib/api/doctor"
import { getFacilities, getSpecialties, getStaffById } from "@/lib/api/shared"
import { saveCertificateFile } from "@/lib/certificateStore"
import { useSession } from "@/state/session"
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

export function ProfilePage() {
  const { t } = useTranslation()
  const { staff: sessionStaff } = useSession()
  const qc = useQueryClient()

  const [showAddForm, setShowAddForm] = useState(false)
  const [degree, setDegree] = useState("")
  const [institution, setInstitution] = useState("")
  const [year, setYear] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const [qualFile, setQualFile] = useState<File | null>(null)

  const { data: staff } = useQuery({
    queryKey: ["staff-profile", sessionStaff?.id],
    queryFn: () => getStaffById(sessionStaff!.id),
    enabled: !!sessionStaff,
    initialData: sessionStaff,
  })
  const { data: facilities } = useQuery({ queryKey: ["facilities"], queryFn: getFacilities })
  const { data: specialties } = useQuery({ queryKey: ["specialties"], queryFn: getSpecialties })

  const addQualificationMutation = useMutation({
    mutationFn: addQualification,
    onSuccess: () => {
      toast.success(t("doctor.profile.qualificationAdded"))
      qc.invalidateQueries({ queryKey: ["staff-profile", sessionStaff?.id] })
      setShowAddForm(false)
      setDegree("")
      setInstitution("")
      setYear("")
      setFileName(null)
      setQualFile(null)
    },
  })

  if (!staff) return null

  const facility = facilities?.find((f) => f.id === staff.facilityId)
  const specialty = specialties?.find((s) => s.id === staff.specialtyId)
  const VerificationIcon = VERIFICATION_ICON[staff.verificationStatus]

  async function submitQualification() {
    if (!sessionStaff || !degree || !institution || !year) return
    const qualId = `qual-${Date.now()}`
    if (qualFile) await saveCertificateFile(qualId, qualFile)
    addQualificationMutation.mutate({
      id: qualId,
      staffId: sessionStaff.id,
      degree,
      institution,
      year,
      fileName: qualFile?.name ?? undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("doctor.profile.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("doctor.profile.subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-foreground">{staff.name}</p>
            <p className="text-sm text-muted-foreground">
              {staff.role}
              {specialty ? ` · ${specialty.label}` : ""}
            </p>
            {facility && <p className="text-sm text-muted-foreground">{facility.name}</p>}
          </div>
          <StatusBadge
            tone={VERIFICATION_TONE[staff.verificationStatus]}
            label={t(`status.${staff.verificationStatus.toLowerCase()}`)}
          />
        </div>

        {staff.verificationStatus === "Rejected" && staff.rejectionReason && (
          <p className="mt-3 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{staff.rejectionReason}</p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          <VerificationIcon className="size-4" />
          {t("doctor.profile.certification")}
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{t("doctor.register.nmcNumber")}</dt>
            <dd className="font-medium text-foreground">{staff.nmcRegistrationNo}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <FileCheck2 className="size-3.5" />
              {t("doctor.profile.credentialFile")}
            </dt>
            <dd className="flex items-center gap-2">
              <span className="truncate font-medium text-foreground">
                {staff.credentialFileName ?? t("doctor.profile.noCredential")}
              </span>
              {staff.credentialFileName && (
                <CertificateViewButton
                  certificateId={staff.id}
                  fileName={staff.credentialFileName}
                  label={t("certificate.view")}
                />
              )}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          {staff.verificationStatus === "Verified"
            ? t("doctor.profile.verifiedNote")
            : t("doctor.profile.pendingNote")}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
            <GraduationCap className="size-4" />
            {t("doctor.profile.qualifications")}
          </h2>
          {!showAddForm && (
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="size-3.5" />
              {t("doctor.profile.addQualification")}
            </Button>
          )}
        </div>
        <p className="mb-4 text-xs text-muted-foreground">{t("doctor.profile.qualificationsVisibleNote")}</p>

        {!staff.qualifications?.length && !showAddForm && (
          <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
            {t("doctor.profile.noQualifications")}
          </p>
        )}

        {!!staff.qualifications?.length && (
          <div className="space-y-2.5">
            {staff.qualifications.map((q) => (
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

        {showAddForm && (
          <div className="mt-4 space-y-3 rounded-xl border border-brand-blue/30 bg-brand-blue/5 p-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("doctor.profile.degree")}</Label>
              <Input value={degree} onChange={(e) => setDegree(e.target.value)} className="h-10" placeholder={t("doctor.profile.degreePlaceholder")} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("doctor.profile.institution")}</Label>
                <Input value={institution} onChange={(e) => setInstitution(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("doctor.profile.year")}</Label>
                <Input value={year} onChange={(e) => setYear(e.target.value)} className="h-10" placeholder="2018" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("doctor.profile.certificateUpload")}</Label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-3 py-2.5 text-sm hover:border-brand-blue">
                {fileName ? <FileCheck2 className="size-4 text-success" /> : <UploadCloud className="size-4 text-muted-foreground" />}
                <span className="truncate text-foreground">{fileName ?? t("doctor.profile.chooseFile")}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    setQualFile(file)
                    setFileName(file?.name ?? null)
                  }}
                />
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                className="bg-brand-blue text-white hover:bg-brand-blue/90"
                disabled={!degree || !institution || !year || addQualificationMutation.isPending}
                onClick={submitQualification}
              >
                {addQualificationMutation.isPending ? t("common.loading") : t("common.save")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
