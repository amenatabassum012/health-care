import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { UserRound } from "lucide-react"
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
import { getPatientProfile, updatePatientProfile } from "@/lib/api/patient"
import { useSession } from "@/state/session"
import type { Patient } from "@/types"

export function PatientProfilePage() {
  const { t } = useTranslation()
  const { patient: sessionPatient, setPatient } = useSession()
  const queryClient = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ["patient-profile", sessionPatient?.id],
    queryFn: () => getPatientProfile(sessionPatient!.id),
    enabled: !!sessionPatient,
    initialData: sessionPatient ?? undefined,
  })

  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<Patient["gender"] | undefined>()
  const [phone, setPhone] = useState("")
  const [symptoms, setSymptoms] = useState("")

  useEffect(() => {
    if (!profile) return
    setName(profile.name ?? "")
    setAge(profile.age !== undefined ? String(profile.age) : "")
    setGender(profile.gender)
    setPhone(profile.phone ?? "")
    setSymptoms(profile.symptoms ?? "")
  }, [profile])

  const saveMutation = useMutation({
    mutationFn: () =>
      updatePatientProfile(sessionPatient!.id, {
        name,
        age: age ? Number(age) : undefined,
        gender,
        phone,
        symptoms,
      }),
    onSuccess: (updated) => {
      toast.success(t("patient.profile.saved"))
      setPatient(updated)
      queryClient.invalidateQueries({ queryKey: ["patient-profile", sessionPatient?.id] })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-mint text-teal-dark">
          <UserRound className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("patient.profile.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("patient.profile.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label>{t("patient.profile.name")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("patient.profile.age")}</Label>
            <Input
              type="number"
              min={0}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={t("patient.profile.agePlaceholder")}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("patient.profile.gender")}</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Patient["gender"])}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">{t("patient.profile.genderMale")}</SelectItem>
                <SelectItem value="Female">{t("patient.profile.genderFemale")}</SelectItem>
                <SelectItem value="Other">{t("patient.profile.genderOther")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("patient.profile.contact")}</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
        </div>

        <div className="space-y-1.5">
          <Label>{t("patient.profile.symptoms")}</Label>
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            placeholder={t("patient.profile.symptomsPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">{t("patient.profile.symptomsHint")}</p>
        </div>

        <Button
          size="xl"
          className="w-full bg-teal text-white hover:bg-teal-dark"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </div>
  )
}
