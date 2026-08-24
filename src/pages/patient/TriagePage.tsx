import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Activity,
  AlertTriangle,
  Bandage,
  Baby,
  CalendarClock,
  CheckCircle2,
  CircleHelp,
  HeartPulse,
  Siren,
  Sparkles,
  Stethoscope,
  Thermometer,
  Video,
  Wind,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { TRIAGE_QUESTIONS, computeTriageResult } from "@/mocks/triage"
import { submitTriage } from "@/lib/api/patient"
import { useSession } from "@/state/session"
import type { TriageAnswer, TriageUrgency } from "@/types"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  fever: Thermometer,
  lungs: Wind,
  pregnant: HeartPulse,
  child: Baby,
  injury: Bandage,
  chronic: Activity,
  skin: Sparkles,
  other: CircleHelp,
}

const URGENCY_META: Record<
  TriageUrgency,
  { tone: StatusTone; icon: LucideIcon; titleKey: string }
> = {
  Emergency: { tone: "emergency", icon: Siren, titleKey: "patient.triage.result.emergency" },
  InPerson: { tone: "info", icon: Stethoscope, titleKey: "patient.triage.result.inPerson" },
  Teleconsult: { tone: "confirmed", icon: Video, titleKey: "patient.triage.result.teleconsult" },
  SelfCare: { tone: "completed", icon: CheckCircle2, titleKey: "patient.triage.result.selfCare" },
}

export function TriagePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { patient } = useSession()

  const [started, setStarted] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ReturnType<typeof computeTriageResult> | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const question = TRIAGE_QUESTIONS[stepIndex]
  const isLast = stepIndex === TRIAGE_QUESTIONS.length - 1

  function selectOption(value: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
  }

  async function handleNext() {
    if (!isLast) {
      setStepIndex((i) => i + 1)
      return
    }
    setSubmitting(true)
    const list: TriageAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }))
    const session = await submitTriage(patient!.id, list)
    setResult({ urgency: session.urgency, reasonKey: session.reason })
    setSubmitting(false)
  }

  if (result) {
    const meta = URGENCY_META[result.urgency]
    const Icon = meta.icon
    return (
      <div className="flex flex-col items-center px-1 py-6 text-center">
        <span
          className={cn(
            "mb-4 flex size-16 items-center justify-center rounded-2xl",
            result.urgency === "Emergency"
              ? "bg-coral text-white"
              : result.urgency === "SelfCare"
                ? "bg-success/15 text-success"
                : "bg-mint text-teal-dark"
          )}
        >
          <Icon className="size-8" />
        </span>
        <p className="text-sm text-muted-foreground">{t("patient.triage.result.title")}</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">{t(meta.titleKey)}</h1>
        <StatusBadge tone={meta.tone} label={t(meta.titleKey)} className="mt-3" />
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">{t(result.reasonKey)}</p>

        {result.urgency === "SelfCare" && (
          <p className="mt-4 rounded-xl bg-muted p-4 text-sm text-foreground">
            {t("patient.triage.result.selfCareTips")}
          </p>
        )}

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          {result.urgency === "Emergency" && (
            <Button size="xl" className="bg-coral text-white hover:bg-coral/90" onClick={() => navigate("/patient/sos")}>
              <Siren className="size-4" />
              {t("patient.triage.result.callEmergency")}
            </Button>
          )}
          {result.urgency === "InPerson" && (
            <Button size="xl" className="bg-teal text-white hover:bg-teal-dark" onClick={() => navigate("/patient/booking")}>
              <CalendarClock className="size-4" />
              {t("patient.triage.result.bookNow")}
            </Button>
          )}
          {result.urgency === "Teleconsult" && (
            <Button size="xl" className="bg-teal text-white hover:bg-teal-dark" onClick={() => navigate("/patient/teleconsult")}>
              <Video className="size-4" />
              {t("patient.triage.result.startCall")}
            </Button>
          )}
          <Button variant="outline" size="xl" onClick={() => navigate("/patient/home")}>
            {t("nav.home")}
          </Button>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center px-1 py-8 text-center">
        <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-mint text-teal-dark">
          <Stethoscope className="size-8" />
        </span>
        <h1 className="text-2xl font-bold text-foreground">{t("patient.triage.startTitle")}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("patient.triage.startSubtitle")}</p>
        <Button size="xl" className="mt-8 w-full max-w-sm bg-teal text-white hover:bg-teal-dark" onClick={() => setStarted(true)}>
          {t("patient.triage.start")}
        </Button>
      </div>
    )
  }

  const isDangerStep = question.id === "danger_signs"
  const selected = answers[question.id]

  return (
    <div className="py-2">
      <div className="mb-6 flex items-center gap-3">
        <Progress value={((stepIndex + 1) / TRIAGE_QUESTIONS.length) * 100} className="h-2 flex-1" />
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {t("patient.triage.stepOf", { current: stepIndex + 1, total: TRIAGE_QUESTIONS.length })}
        </span>
      </div>

      <h1 className="mb-5 text-xl font-bold text-foreground">{t(question.titleKey)}</h1>

      <div className={cn("grid gap-3", isDangerStep ? "grid-cols-1" : "grid-cols-2")}>
        {question.options.map((opt) => {
          const Icon = ICONS[opt.icon]
          const active = selected === opt.value
          const isWarningOption = isDangerStep && opt.value !== "none"
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => selectOption(opt.value)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                isDangerStep ? "flex-row" : "flex-col text-center",
                active
                  ? isWarningOption
                    ? "border-coral bg-coral/5"
                    : "border-teal bg-mint"
                  : "border-border bg-card hover:border-teal-mid"
              )}
            >
              {isWarningOption && active ? (
                <AlertTriangle className="size-6 shrink-0 text-coral" />
              ) : (
                <Icon className={cn("shrink-0", isDangerStep ? "size-5" : "size-7", active ? "text-teal-dark" : "text-muted-foreground")} />
              )}
              <span className={cn("text-sm font-semibold", active ? "text-foreground" : "text-foreground")}>
                {t(opt.labelKey)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex gap-3">
        {stepIndex > 0 && (
          <Button variant="outline" size="xl" onClick={() => setStepIndex((i) => i - 1)}>
            {t("common.back")}
          </Button>
        )}
        <Button
          size="xl"
          className="flex-1 bg-teal text-white hover:bg-teal-dark"
          disabled={!selected || submitting}
          onClick={handleNext}
        >
          {submitting ? t("common.loading") : isLast ? t("common.submit") : t("common.next")}
        </Button>
      </div>
    </div>
  )
}
