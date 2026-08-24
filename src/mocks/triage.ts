import type { TriageAnswer, TriageUrgency } from "@/types"

export interface TriageOption {
  value: string
  labelKey: string
  icon: "fever" | "lungs" | "pregnant" | "child" | "injury" | "chronic" | "skin" | "other"
}

export interface TriageQuestion {
  id: string
  titleKey: string
  type: "single" | "multi"
  options: TriageOption[]
}

/**
 * Rule-based triage decision tree (Architecture Specification §4 — Triage Engine).
 * Deliberately simple and versionable: this is decision support, not diagnosis.
 */
export const TRIAGE_QUESTIONS: TriageQuestion[] = [
  {
    id: "category",
    titleKey: "patient.triage.q1.title",
    type: "single",
    options: [
      { value: "fever", labelKey: "patient.triage.q1.fever", icon: "fever" },
      { value: "breathing", labelKey: "patient.triage.q1.breathing", icon: "lungs" },
      { value: "pregnancy", labelKey: "patient.triage.q1.pregnancy", icon: "pregnant" },
      { value: "child", labelKey: "patient.triage.q1.child", icon: "child" },
      { value: "injury", labelKey: "patient.triage.q1.injury", icon: "injury" },
      { value: "chronic", labelKey: "patient.triage.q1.chronic", icon: "chronic" },
      { value: "skin", labelKey: "patient.triage.q1.skin", icon: "skin" },
      { value: "other", labelKey: "patient.triage.q1.other", icon: "other" },
    ],
  },
  {
    id: "severity",
    titleKey: "patient.triage.q2.title",
    type: "single",
    options: [
      { value: "mild", labelKey: "patient.triage.q2.mild", icon: "other" },
      { value: "moderate", labelKey: "patient.triage.q2.moderate", icon: "other" },
      { value: "severe", labelKey: "patient.triage.q2.severe", icon: "other" },
    ],
  },
  {
    id: "duration",
    titleKey: "patient.triage.q3.title",
    type: "single",
    options: [
      { value: "today", labelKey: "patient.triage.q3.today", icon: "other" },
      { value: "few_days", labelKey: "patient.triage.q3.fewDays", icon: "other" },
      { value: "long", labelKey: "patient.triage.q3.long", icon: "other" },
    ],
  },
  {
    id: "danger_signs",
    titleKey: "patient.triage.q4.title",
    type: "multi",
    options: [
      { value: "chest_pain", labelKey: "patient.triage.q4.chestPain", icon: "other" },
      { value: "breathless", labelKey: "patient.triage.q4.breathless", icon: "lungs" },
      { value: "bleeding", labelKey: "patient.triage.q4.bleeding", icon: "other" },
      { value: "unconscious", labelKey: "patient.triage.q4.unconscious", icon: "other" },
      { value: "none", labelKey: "patient.triage.q4.none", icon: "other" },
    ],
  },
]

export interface TriageResult {
  urgency: TriageUrgency
  reasonKey: string
}

export function computeTriageResult(answers: TriageAnswer[]): TriageResult {
  const dangerSigns = answers.find((a) => a.questionId === "danger_signs")?.value ?? ""
  const severity = answers.find((a) => a.questionId === "severity")?.value
  const duration = answers.find((a) => a.questionId === "duration")?.value
  const category = answers.find((a) => a.questionId === "category")?.value

  const hasDangerSign = dangerSigns.split(",").some((v) => v && v !== "none")

  if (hasDangerSign) {
    return { urgency: "Emergency", reasonKey: "patient.triage.result.emergencyReason" }
  }
  if (severity === "severe" || category === "pregnancy" || category === "chronic") {
    return { urgency: "InPerson", reasonKey: "patient.triage.result.inPersonReason" }
  }
  if (severity === "moderate" || duration === "long") {
    return { urgency: "Teleconsult", reasonKey: "patient.triage.result.teleconsultReason" }
  }
  return { urgency: "SelfCare", reasonKey: "patient.triage.result.selfCareReason" }
}
