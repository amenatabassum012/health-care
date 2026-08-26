import { db } from "@/lib/db"
import {
  MOCK_APPOINTMENT,
  MOCK_APPOINTMENTS,
  MOCK_FOLLOW_UPS,
  MOCK_HEALTH_RECORDS,
  MOCK_PATIENT,
  MOCK_REFERRALS,
  MOCK_STOCK,
} from "@/mocks/patients"
import { computeTriageResult, type TriageOption } from "@/mocks/triage"
import type { Appointment, DoctorFeedback, Patient, StockItem, TriageAnswer, TriageSession } from "@/types"
import { networkDelay } from "./delay"
import { supabase } from "@/lib/supabaseClient"
export async function requestOtp(phone: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('otp_codes')
    .insert({ phone, code, expires_at: expiresAt })

  if (error) throw error

  console.log(`OTP for ${phone}: ${code}`)

  return { phone, requestId: `otp-${Date.now()}`, demoCode: code }
}

export async function verifyOtp(phone: string, code: string): Promise<Patient> {
  const { data, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('phone', phone)
    .eq('code', code)
    .eq('verified', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) throw new Error('Invalid or expired OTP')

  await supabase.from('otp_codes').update({ verified: true }).eq('id', data.id)

  return { ...MOCK_PATIENT, phone }
}

export async function getHomeSummary() {
  await networkDelay(400)
  return {
    activeAppointment: MOCK_APPOINTMENT,
    latestReferral: MOCK_REFERRALS.find((r) => r.status !== "Completed"),
    dueFollowUp: MOCK_FOLLOW_UPS.find((f) => f.status === "Pending"),
  }
}

export async function submitTriage(patientId: string, answers: TriageAnswer[]): Promise<TriageSession> {
  await networkDelay(700)
  const result = computeTriageResult(answers)
  const session: TriageSession = {
    id: `triage-${Date.now()}`,
    patientId,
    answers,
    urgency: result.urgency,
    reason: result.reasonKey,
    createdAt: new Date().toISOString(),
  }
  // Written to the local-first cache immediately so it is available offline —
  // see Architecture Specification §6 and .cursorrules §6.
  await db.triageSessions.put(session)
  return session
}

export async function getCachedTriageSessions(patientId: string) {
  return db.triageSessions.where("patientId").equals(patientId).reverse().sortBy("createdAt")
}

export async function createAppointment(
  patientId: string,
  facilityId: string,
  type: Appointment["type"],
  doctorId?: string,
  bookedFor?: { name: string; relation: Appointment["bookedForRelation"] }
): Promise<Appointment> {
  await networkDelay(700)
  const appointment: Appointment = {
    id: `appt-${Date.now()}`,
    patientId,
    facilityId,
    doctorId,
    type,
    slotTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    queuePosition: Math.floor(Math.random() * 6) + 2,
    estimatedWaitMinutes: Math.floor(Math.random() * 40) + 10,
    status: "InQueue",
    bookedForName: bookedFor?.name,
    bookedForRelation: bookedFor?.relation,
  }
  await db.appointments.put(appointment)
  return appointment
}

export async function getAppointments(patientId: string) {
  await networkDelay(400)
  const appointments = MOCK_APPOINTMENTS.filter((a) => a.patientId === patientId)
  await db.appointments.bulkPut(appointments)
  return appointments
}

export async function getCachedAppointments(patientId: string) {
  return db.appointments.where("patientId").equals(patientId).sortBy("slotTime")
}

export async function submitFeedback(
  appointmentId: string,
  doctorId: string,
  patientId: string,
  rating: number,
  comment?: string
): Promise<DoctorFeedback> {
  await networkDelay(500)
  const feedback: DoctorFeedback = {
    id: `fb-${Date.now()}`,
    appointmentId,
    doctorId,
    patientId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  }
  await db.feedback.put(feedback)
  return feedback
}

export async function getFeedbackForAppointment(appointmentId: string) {
  const feedback = await db.feedback.where("appointmentId").equals(appointmentId).first()
  return feedback ?? null
}

export async function getHealthRecords(patientId: string) {
  await networkDelay(400)
  const records = MOCK_HEALTH_RECORDS.filter((r) => r.patientId === patientId)
  await db.healthRecords.bulkPut(records)
  return records
}

export async function getCachedHealthRecords(patientId: string) {
  return db.healthRecords.where("patientId").equals(patientId).reverse().sortBy("date")
}

export async function getReferrals(patientId: string) {
  await networkDelay(400)
  const referrals = MOCK_REFERRALS.filter((r) => r.patientId === patientId)
  await db.referrals.bulkPut(referrals)
  return referrals
}

export async function searchStock(facilityId: string, query: string): Promise<StockItem[]> {
  await networkDelay(350)
  const q = query.trim().toLowerCase()
  return MOCK_STOCK.filter(
    (s) => s.facilityId === facilityId && (!q || s.name.toLowerCase().includes(q))
  )
}

export async function findNearestAvailable(itemName: string, excludeFacilityId: string) {
  await networkDelay(350)
  return MOCK_STOCK.find(
    (s) =>
      s.name.toLowerCase() === itemName.toLowerCase() &&
      s.facilityId !== excludeFacilityId &&
      s.status === "Available"
  )
}

export async function triggerEmergencySos(_patientId: string) {
  await networkDelay(900)
  return {
    routedFacilityName: "District Hospital Haridwar",
    etaMinutes: 12,
    smsFallbackSent: true,
  }
}

export const TRIAGE_ICON_MAP: Record<TriageOption["icon"], string> = {
  fever: "Thermometer",
  lungs: "Wind",
  pregnant: "HeartPulse",
  child: "Baby",
  injury: "Bandage",
  chronic: "Activity",
  skin: "Sparkles",
  other: "CircleHelp",
}
