import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Building2,
  Check,
  ClipboardList,
  FileCheck2,
  Search,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  UserRound,
  UserCog,
} from "lucide-react"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSpecialties, searchFacilities } from "@/lib/api/shared"
import { registerStaff } from "@/lib/api/doctor"
import { saveCertificateFile } from "@/lib/certificateStore"
import { facilityLabel } from "@/mocks/facilities"
import type { StaffRole } from "@/types"
import { cn } from "@/lib/utils"

const STEPS = ["basic", "role", "facility", "specialty", "credentials"] as const

const ROLE_OPTIONS: { role: StaffRole; icon: typeof Stethoscope; titleKey: string; descKey: string }[] = [
  { role: "Doctor", icon: Stethoscope, titleKey: "doctor.register.roleDoctor", descKey: "doctor.register.roleDoctorDesc" },
  { role: "Specialist", icon: UserRound, titleKey: "doctor.register.roleSpecialist", descKey: "doctor.register.roleSpecialistDesc" },
  { role: "CHO", icon: ClipboardList, titleKey: "doctor.register.roleCho", descKey: "doctor.register.roleChoDesc" },
  { role: "FacilityAdmin", icon: UserCog, titleKey: "doctor.register.roleAdmin", descKey: "doctor.register.roleAdminDesc" },
]

export function DoctorRegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [stepIndex, setStepIndex] = useState(0)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<StaffRole | null>(null)
  const [facilityQuery, setFacilityQuery] = useState("")
  const [facilityId, setFacilityId] = useState<string | null>(null)
  const [facilityName, setFacilityName] = useState("")
  const [specialtyId, setSpecialtyId] = useState<string | undefined>(undefined)
  const [nmcNumber, setNmcNumber] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const [credentialFile, setCredentialFile] = useState<File | null>(null)

  const { data: facilities } = useQuery({
    queryKey: ["facility-search", facilityQuery],
    queryFn: () => searchFacilities(facilityQuery),
  })
  const { data: specialties } = useQuery({ queryKey: ["specialties"], queryFn: getSpecialties })

  const submitMutation = useMutation({
    mutationFn: async () => {
      const staff = await registerStaff({
        name,
        phone,
        email,
        role: role!,
        facilityId: facilityId!,
        specialtyId,
        nmcRegistrationNo: nmcNumber,
        credentialFileName: fileName ?? undefined,
      })
      if (credentialFile) await saveCertificateFile(staff.id, credentialFile)
      return staff
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : t("doctor.register.submitError")
      toast.error(message)
    },
  })

  const step = STEPS[stepIndex]
  const isSpecialist = role === "Specialist"

  const canProceed =
    (step === "basic" && name && phone && email) ||
    (step === "role" && role) ||
    (step === "facility" && facilityId) ||
    (step === "specialty" && (!isSpecialist || specialtyId)) ||
    (step === "credentials" && nmcNumber && fileName)

  function next() {
    if (step === "credentials") {
      submitMutation.mutate()
      return
    }
    let nextIndex = stepIndex + 1
    if (STEPS[nextIndex] === "specialty" && !isSpecialist) nextIndex += 1
    setStepIndex(nextIndex)
  }

  function back() {
    let prevIndex = stepIndex - 1
    if (STEPS[prevIndex] === "specialty" && !isSpecialist) prevIndex -= 1
    setStepIndex(Math.max(0, prevIndex))
  }

  if (submitMutation.isSuccess) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 bg-rhc-pattern-shield px-5 py-10 text-center">
        <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-warning/15 text-warning">
          <ShieldCheck className="size-8" />
        </span>
        <h1 className="text-2xl font-bold text-foreground">{t("doctor.register.pendingTitle")}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("doctor.register.pendingBody")}</p>
        <Button size="xl" className="mt-8 bg-teal text-white hover:bg-teal-dark" onClick={() => navigate("/doctor/login")}>
          {t("doctor.register.backToLogin")}
        </Button>
      </div>
    )
  }

  const visibleSteps = isSpecialist ? STEPS.length : STEPS.length - 1
  const visibleIndex = isSpecialist ? stepIndex : stepIndex > STEPS.indexOf("specialty") ? stepIndex - 1 : stepIndex

  return (
    <div
      className="relative flex min-h-svh flex-col items-center bg-cover bg-center px-5 py-8"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/5934405/pexels-photo-5934405.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background/70" />
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-7 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <BrandMark compact />
          <Link to="/doctor/login" className="text-xs text-muted-foreground hover:underline">
            {t("doctor.login.login")}
          </Link>
        </div>

        <h1 className="mb-5 text-xl font-bold text-foreground">{t("doctor.register.title")}</h1>

        <div className="mb-6 flex items-center gap-3">
          <Progress value={((visibleIndex + 1) / visibleSteps) * 100} className="h-2 flex-1" />
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {t("doctor.register.stepOf", { current: visibleIndex + 1, total: visibleSteps })}
          </span>
        </div>

        {step === "basic" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">{t("doctor.register.step1Title")}</h2>
            <div className="space-y-2">
              <Label>{t("doctor.register.name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>{t("doctor.register.phone")}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>{t("doctor.register.email")}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            </div>
          </div>
        )}

        {step === "role" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">{t("doctor.register.step2Title")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLE_OPTIONS.map(({ role: r, icon: Icon, titleKey, descKey }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left",
                    role === r ? "border-brand-blue bg-brand-blue/5" : "border-border bg-background"
                  )}
                >
                  <Icon className="size-5 text-brand-blue" />
                  <span className="text-sm font-semibold text-foreground">{t(titleKey)}</span>
                  <span className="text-xs text-muted-foreground">{t(descKey)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "facility" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">{t("doctor.register.step3Title")}</h2>
            <p className="text-xs text-muted-foreground">{t("doctor.register.facilityHint")}</p>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={facilityQuery}
                onChange={(e) => setFacilityQuery(e.target.value)}
                placeholder={t("doctor.register.facilitySearch")}
                className="h-11 pl-10"
              />
            </div>
            <div className="max-h-56 space-y-2 overflow-y-auto">
              {facilities?.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFacilityId(f.id)
                    setFacilityName(f.name)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left",
                    facilityId === f.id ? "border-brand-blue bg-brand-blue/5" : "border-border bg-background"
                  )}
                >
                  <Building2 className="size-4 shrink-0 text-brand-blue" />
                  <span className="text-sm font-medium text-foreground">{facilityLabel(f)}</span>
                  {facilityId === f.id && <Check className="ml-auto size-4 shrink-0 text-brand-blue" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "specialty" && isSpecialist && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">{t("doctor.register.step4Title")}</h2>
            <p className="text-xs text-muted-foreground">{t("doctor.register.specialtyHint")}</p>
            <Select value={specialtyId} onValueChange={(v) => setSpecialtyId(v ?? undefined)}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder={t("doctor.register.specialtySelect")} />
              </SelectTrigger>
              <SelectContent>
                {specialties?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === "credentials" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">{t("doctor.register.step5Title")}</h2>
            <div className="space-y-2">
              <Label>{t("doctor.register.nmcNumber")}</Label>
              <Input value={nmcNumber} onChange={(e) => setNmcNumber(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>{t("doctor.register.credentialUpload")}</Label>
              <p className="text-xs text-muted-foreground">{t("doctor.register.credentialUploadHint")}</p>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/60 px-4 py-6 text-center hover:border-brand-blue">
                {fileName ? <FileCheck2 className="size-6 text-success" /> : <UploadCloud className="size-6 text-muted-foreground" />}
                <span className="text-sm font-medium text-foreground">{fileName ?? t("doctor.profile.chooseFile")}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    setCredentialFile(file)
                    setFileName(file?.name ?? null)
                  }}
                />
              </label>
            </div>
            {facilityName && (
              <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                {facilityName} {role && `· ${t(ROLE_OPTIONS.find((r) => r.role === role)!.titleKey)}`}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {stepIndex > 0 && (
            <Button variant="outline" size="xl" onClick={back}>
              {t("common.back")}
            </Button>
          )}
          <Button
            size="xl"
            className="flex-1 bg-brand-blue text-white hover:bg-brand-blue/90"
            disabled={!canProceed || submitMutation.isPending}
            onClick={next}
          >
            {submitMutation.isPending
              ? t("common.loading")
              : step === "credentials"
                ? t("doctor.register.submitRegistration")
                : t("common.next")}
          </Button>
        </div>
      </div>
    </div>
  )
}
