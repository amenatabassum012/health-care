import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CheckCircle2, ClipboardList, FlaskConical, GitBranch, Plus, Search, Stethoscope, Trash2, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { getFacilities, getSpecialties, getStaff } from "@/lib/api/shared"
import { getHealthRecords, getPatientProfile, searchStock } from "@/lib/api/patient"
import { completeConsultation, createReferral, getDoctorQueue } from "@/lib/api/doctor"
import { useSession } from "@/state/session"
import type { PrescriptionItem, ReferralUrgency } from "@/types"

const URGENCY_TONE: Record<ReferralUrgency, StatusTone> = {
  Routine: "info",
  Urgent: "pending",
  Critical: "emergency",
}

export function ConsultationPage() {
  const { appointmentId } = useParams()
  const { t } = useTranslation()
  const { staff } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const commonDiagnoses = t("doctor.consultation.diagnoses", { returnObjects: true }) as string[]

  const [diagnosisQuery, setDiagnosisQuery] = useState("")
  const [diagnoses, setDiagnoses] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [labTests, setLabTests] = useState<string[]>([])
  const [labTestQuery, setLabTestQuery] = useState("")
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([])
  const [showReferral, setShowReferral] = useState(false)
  const [refSpecialty, setRefSpecialty] = useState<string | undefined>()
  const [refFacility, setRefFacility] = useState<string | undefined>()
  const [refDoctor, setRefDoctor] = useState<string | undefined>()
  const [refUrgency, setRefUrgency] = useState<ReferralUrgency>("Routine")
  const [refSummary, setRefSummary] = useState("")
  const [stockQuery, setStockQuery] = useState("")

  const { data: facilities } = useQuery({ queryKey: ["facilities"], queryFn: getFacilities })
  const { data: specialties } = useQuery({ queryKey: ["specialties"], queryFn: getSpecialties })
  const { data: staffDirectory } = useQuery({ queryKey: ["staff"], queryFn: getStaff })
  const { data: queue } = useQuery({
    queryKey: ["doctor-queue", staff?.facilityId],
    queryFn: () => getDoctorQueue(staff!.facilityId),
    enabled: !!staff,
  })
  const { data: stockResults } = useQuery({
    queryKey: ["stock-check", staff?.facilityId, stockQuery],
    queryFn: () => searchStock(staff!.facilityId, stockQuery),
    enabled: !!staff && stockQuery.length > 0,
  })

  const currentPatient = queue?.find((a) => a.id === appointmentId)

  const { data: patientHistory = [] } = useQuery({
    queryKey: ["health-records", currentPatient?.patientId],
    queryFn: () => getHealthRecords(currentPatient!.patientId),
    enabled: !!currentPatient,
  })

  const { data: patientProfile } = useQuery({
    queryKey: ["patient-profile", currentPatient?.patientId],
    queryFn: () => getPatientProfile(currentPatient!.patientId),
    enabled: !!currentPatient,
  })

  const currentFacility = facilities?.find((f) => f.id === staff?.facilityId)

  const completeMutation = useMutation({
    mutationFn: () =>
      completeConsultation({
        appointment: currentPatient!,
        facilityId: staff!.facilityId,
        facilityName: currentFacility?.name,
        diagnoses,
        notes,
        labTests,
      }),
    onSuccess: () => {
      toast.success(t("doctor.consultation.consultationSaved"))
      queryClient.invalidateQueries({ queryKey: ["doctor-queue"] })
      navigate("/doctor/dashboard")
    },
  })

  const referralDoctorOptions = staffDirectory?.filter(
    (s) =>
      s.facilityId === refFacility &&
      s.specialtyId === refSpecialty &&
      s.verificationStatus === "Verified"
  )

  const referralMutation = useMutation({
    mutationFn: createReferral,
    onSuccess: () => {
      toast.success(t("doctor.consultation.referral") + " — " + t("patient.referral.pending"))
      setShowReferral(false)
      setRefSpecialty(undefined)
      setRefFacility(undefined)
      setRefDoctor(undefined)
      setRefSummary("")
    },
  })

  const filteredDiagnoses = commonDiagnoses.filter(
    (d) => d.toLowerCase().includes(diagnosisQuery.toLowerCase()) && !diagnoses.includes(d)
  )

  function addPrescriptionRow() {
    setPrescription((p) => [...p, { medicine: "", dosage: "", durationDays: 5 }])
  }
  function updateRow(i: number, patch: Partial<PrescriptionItem>) {
    setPrescription((p) => p.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  }
  function removeRow(i: number) {
    setPrescription((p) => p.filter((_, idx) => idx !== i))
  }

  function addLabTest() {
    const value = labTestQuery.trim()
    if (!value || labTests.includes(value)) return
    setLabTests((tests) => [...tests, value])
    setLabTestQuery("")
  }
  function removeLabTest(test: string) {
    setLabTests((tests) => tests.filter((t) => t !== test))
  }

  function submitReferral() {
    if (!refSpecialty || !refFacility || !staff) {
      toast.error(t("doctor.consultation.referral"))
      return
    }
    referralMutation.mutate({
      patientId: currentPatient?.patientId ?? "unknown",
      patientName: currentPatient?.patientName ?? t("doctor.consultation.unknownPatient"),
      fromFacilityId: staff.facilityId,
      fromDoctorId: staff.id,
      toFacilityId: refFacility,
      toDoctorId: refDoctor,
      specialtyId: refSpecialty,
      urgency: refUrgency,
      structuredSummary: refSummary,
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("doctor.consultation.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("doctor.consultation.appointmentLabel", { id: appointmentId })}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <Label className="mb-3 flex items-center gap-1.5">
            <User className="size-3.5" />
            {t("doctor.consultation.patientDetails")}
          </Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("patient.profile.name")}</p>
              <p className="text-sm font-medium text-foreground">
                {currentPatient?.patientName ?? t("doctor.consultation.unknownPatient")}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("doctor.consultation.age")}</p>
              <p className="text-sm font-medium text-foreground">
                {patientProfile?.age ?? t("doctor.consultation.notProvided")}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("doctor.consultation.gender")}</p>
              <p className="text-sm font-medium text-foreground">
                {patientProfile?.gender ?? t("doctor.consultation.notProvided")}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("doctor.consultation.contact")}</p>
              <p className="text-sm font-medium text-foreground">
                {patientProfile?.phone ?? t("doctor.consultation.notProvided")}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("doctor.consultation.symptoms")}</p>
              <p className="text-sm font-medium text-foreground">
                {patientProfile?.symptoms || t("doctor.consultation.notProvided")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <Label className="mb-2 block">{t("doctor.consultation.diagnosis")}</Label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={diagnosisQuery}
              onChange={(e) => setDiagnosisQuery(e.target.value)}
              placeholder={t("doctor.consultation.diagnosisPlaceholder")}
              className="h-11 pl-10"
            />
          </div>
          {diagnosisQuery && (
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border">
              {filteredDiagnoses.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDiagnoses((prev) => [...prev, d])
                    setDiagnosisQuery("")
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {d}
                </button>
              ))}
            </div>
          )}
          {diagnoses.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {diagnoses.map((d) => (
                <span key={d} className="flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-xs font-medium text-teal-dark">
                  {d}
                  <button type="button" onClick={() => setDiagnoses((prev) => prev.filter((x) => x !== d))}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <Label className="mb-2 flex items-center gap-1.5">
            <ClipboardList className="size-3.5" />
            {t("doctor.consultation.notes")}
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder={t("doctor.consultation.notesPlaceholder")}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <Label className="mb-3 flex items-center gap-1.5">
            <FlaskConical className="size-3.5" />
            {t("doctor.consultation.labTests")}
          </Label>
          <div className="flex gap-2">
            <Input
              value={labTestQuery}
              onChange={(e) => setLabTestQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addLabTest()
                }
              }}
              placeholder={t("doctor.consultation.testPlaceholder")}
              className="h-10"
            />
            <Button variant="outline" size="sm" onClick={addLabTest}>
              <Plus className="size-3.5" />
              {t("doctor.consultation.addTest")}
            </Button>
          </div>
          {labTests.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {labTests.map((test) => (
                <span key={test} className="flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-xs font-medium text-teal-dark">
                  {test}
                  <button type="button" onClick={() => removeLabTest(test)}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">{t("doctor.consultation.noTestsYet")}</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <Label>{t("doctor.consultation.prescription")}</Label>
            <Button variant="outline" size="sm" onClick={addPrescriptionRow}>
              <Plus className="size-3.5" />
              {t("doctor.consultation.addMedicine")}
            </Button>
          </div>
          <div className="space-y-2">
            {prescription.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_90px_70px_auto] gap-2">
                <Input
                  placeholder={t("doctor.consultation.medicinePlaceholder")}
                  value={row.medicine}
                  onChange={(e) => updateRow(i, { medicine: e.target.value })}
                  className="h-9"
                />
                <Input
                  placeholder={t("doctor.consultation.dosagePlaceholder")}
                  value={row.dosage}
                  onChange={(e) => updateRow(i, { dosage: e.target.value })}
                  className="h-9"
                />
                <Input
                  type="number"
                  value={row.durationDays}
                  onChange={(e) => updateRow(i, { durationDays: Number(e.target.value) })}
                  className="h-9"
                />
                <Button variant="ghost" size="icon" onClick={() => removeRow(i)}>
                  <Trash2 className="size-4 text-coral" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <Label>{t("doctor.consultation.checkAvailability")}</Label>
          </div>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={stockQuery}
              onChange={(e) => setStockQuery(e.target.value)}
              placeholder={t("doctor.consultation.diagnosticPlaceholder")}
              className="h-10 pl-10"
            />
          </div>
          {stockResults && stockResults.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {stockResults.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                  {s.name}
                  <StatusBadge
                    tone={s.status === "Available" ? "completed" : s.status === "LowStock" ? "pending" : "emergency"}
                    label={t(`status.${s.status.charAt(0).toLowerCase() + s.status.slice(1)}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {!showReferral ? (
          <Button variant="outline" size="xl" onClick={() => setShowReferral(true)}>
            <GitBranch className="size-4" />
            {t("doctor.consultation.referral")}
          </Button>
        ) : (
          <div className="rounded-2xl border border-brand-blue/30 bg-brand-blue/5 p-5">
            <Label className="mb-3 block text-brand-blue">{t("doctor.consultation.referral")}</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("doctor.consultation.referralSpecialty")}</Label>
                <Select
                  value={refSpecialty}
                  onValueChange={(v) => {
                    setRefSpecialty(v ?? undefined)
                    setRefDoctor(undefined)
                  }}
                >
                  <SelectTrigger className="h-10 w-full"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {specialties?.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("doctor.consultation.referralFacility")}</Label>
                <Select
                  value={refFacility}
                  onValueChange={(v) => {
                    setRefFacility(v ?? undefined)
                    setRefDoctor(undefined)
                  }}
                >
                  <SelectTrigger className="h-10 w-full"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {facilities?.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {refFacility && refSpecialty && (
              <div className="mt-3 space-y-1.5">
                <Label className="text-xs">{t("doctor.consultation.referralDoctor")}</Label>
                <Select value={refDoctor} onValueChange={(v) => setRefDoctor(v ?? undefined)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={t("doctor.consultation.referralDoctorAny")} />
                  </SelectTrigger>
                  <SelectContent>
                    {referralDoctorOptions?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {referralDoctorOptions?.length === 0 && (
                  <p className="text-xs text-muted-foreground">{t("doctor.consultation.referralDoctorNone")}</p>
                )}
              </div>
            )}
            <div className="mt-3 space-y-1.5">
              <Label className="text-xs">{t("doctor.consultation.referralUrgency")}</Label>
              <div className="flex gap-2">
                {(["Routine", "Urgent", "Critical"] as ReferralUrgency[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setRefUrgency(u)}
                    className={refUrgency === u ? "" : "opacity-50"}
                  >
                    <StatusBadge tone={URGENCY_TONE[u]} label={t(`status.${u === "Routine" ? "routine" : u === "Urgent" ? "urgentLevel" : "critical"}`)} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <Label className="text-xs">{t("doctor.consultation.referralSummary")}</Label>
              <Textarea value={refSummary} onChange={(e) => setRefSummary(e.target.value)} rows={3} />
            </div>
            <Button className="mt-4 bg-brand-blue text-white hover:bg-brand-blue/90" onClick={submitReferral}>
              {t("common.submit")}
            </Button>
          </div>
        )}

        <Button
          size="xl"
          className="w-full bg-teal text-white hover:bg-teal-dark"
          disabled={!currentPatient || completeMutation.isPending}
          onClick={() => completeMutation.mutate()}
        >
          <CheckCircle2 className="size-4" />
          {completeMutation.isPending ? t("common.loading") : t("doctor.consultation.saveConsultation")}
        </Button>
      </div>

      <aside className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Stethoscope className="size-3.5" />
          {t("doctor.dashboard.viewHistory")}
        </h2>
        <div className="space-y-3">
          {patientHistory.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-3.5">
              <p className="text-[11px] text-muted-foreground">{r.date} · {r.facilityName}</p>
              <p className="text-sm font-semibold text-foreground">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.summary}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
