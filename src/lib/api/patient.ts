import { db } from "@/lib/db"
import { MOCK_PATIENT } from "@/mocks/patients"
import { computeTriageResult, type TriageOption } from "@/mocks/triage"
import type { Appointment, DoctorFeedback, HealthRecordEntry, Patient, Referral, StockItem, TriageAnswer, TriageSession } from "@/types"
import { supabase } from "@/lib/supabaseClient"

// DEMO/TEST OTP NUMBERS — for SIH demo & dev only, do NOT ship to production.
// Real SMS delivery requires a paid Supabase SMS provider, so these numbers
// bypass the DB-backed OTP flow entirely and accept a fixed code instead.
// Test numbers -> fixed OTP:
//   +919999999999 -> 123456
//   +919888888888 -> 123456
//   +919777777777 -> 123456
const TEST_OTP_NUMBERS: Record<string, string> = {
  "+919999999999": "123456",
  "+919888888888": "123456",
  "+919777777777": "123456",
}

// Gives each demo/test number its own seeded name so bookings made while
// testing with different numbers don't all show up as the same patient.
const TEST_OTP_NAMES: Record<string, string> = {
  "+919999999999": "Suman Devi",
  "+919888888888": "Anita Kumari",
  "+919777777777": "Radha Sharma",
}

function mapAppointment(row: any): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    facilityId: row.facility_id,
    doctorId: row.doctor_id ?? undefined,
    type: row.type,
    slotTime: row.slot_time,
    queuePosition: row.queue_position ?? undefined,
    estimatedWaitMinutes: row.estimated_wait_minutes ?? undefined,
    status: row.status,
    bookedForName: row.booked_for_name ?? undefined,
    bookedForRelation: row.booked_for_relation ?? undefined,
    cancellationReason: row.cancellation_reason ?? undefined,
    wantsAsha: row.wants_asha ?? false,
    ashaWorkerId: row.asha_worker_id ?? undefined,
  }
}

function mapReferral(row: any): Referral {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    fromFacilityId: row.from_facility_id,
    fromDoctorId: row.from_doctor_id ?? undefined,
    toFacilityId: row.to_facility_id,
    toDoctorId: row.to_doctor_id ?? undefined,
    specialtyId: row.specialty_id,
    urgency: row.urgency,
    structuredSummary: row.structured_summary,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapHealthRecord(row: any): HealthRecordEntry {
  return {
    id: row.id,
    patientId: row.patient_id,
    facilityId: row.facility_id,
    facilityName: row.facility_name,
    type: row.type,
    title: row.title,
    summary: row.summary,
    date: row.date,
  }
}

// Normalizes whatever the login form passes in (raw 10-digit number or
// already-prefixed) to the "+91XXXXXXXXXX" form TEST_OTP_NUMBERS and stored
// phone numbers use, so demo numbers actually match.
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return `+91${digits.slice(-10)}`
}

export async function requestOtp(phoneInput: string) {
  const phone = normalizePhone(phoneInput)
  const testCode = TEST_OTP_NUMBERS[phone]
  if (testCode) {
    console.log(`[TEST OTP] Using fixed demo code for ${phone}: ${testCode}`)
    return { phone, requestId: `otp-test-${Date.now()}`, demoCode: testCode }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('otp_codes')
    .insert({ phone, code, expires_at: expiresAt })

  if (error) throw error

  console.log(`OTP for ${phone}: ${code}`)

  return { phone, requestId: `otp-${Date.now()}`, demoCode: code }
}

function computeAgeFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return null
  const age = Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  return age > 0 ? age : null
}

async function upsertPatientForPhone(phone: string, base: Patient): Promise<Patient> {
  const { data: existing } = await supabase
    .from('patients')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()

  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      phone: existing.phone,
      dob: existing.dob ?? undefined,
      age: existing.age ?? undefined,
      gender: existing.gender ?? undefined,
      symptoms: existing.symptoms ?? undefined,
      preferredLanguage: existing.preferred_language ?? base.preferredLanguage,
      isGuardianManaged: existing.is_guardian_managed ?? false,
      abhaId: existing.abha_id ?? undefined,
    }
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      id: base.id,
      name: base.name,
      phone,
      dob: base.dob ?? null,
      age: computeAgeFromDob(base.dob),
      gender: base.gender ?? null,
      preferred_language: base.preferredLanguage,
      is_guardian_managed: base.isGuardianManaged,
      status: 'Active',
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    dob: data.dob ?? undefined,
    age: data.age ?? undefined,
    gender: data.gender ?? undefined,
    symptoms: data.symptoms ?? undefined,
    preferredLanguage: data.preferred_language ?? base.preferredLanguage,
    isGuardianManaged: data.is_guardian_managed ?? false,
    abhaId: data.abha_id ?? undefined,
  }
}

export async function verifyOtp(phoneInput: string, code: string): Promise<Patient> {
  const phone = normalizePhone(phoneInput)
  const testCode = TEST_OTP_NUMBERS[phone]
  if (testCode) {
    if (code !== testCode) throw new Error('Invalid or expired OTP')
    const name = TEST_OTP_NAMES[phone] ?? MOCK_PATIENT.name
    return upsertPatientForPhone(phone, { ...MOCK_PATIENT, id: `pat-${phone}`, phone, name })
  }

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

  return upsertPatientForPhone(phone, { ...MOCK_PATIENT, id: `pat-${phone}`, phone })
}

// Recomputes an InQueue appointment's real position/wait from the current
// queue snapshot instead of trusting the number frozen at booking time, so
// the count goes down as patients ahead get seen, skipped, or cancel.
async function computeLiveQueueInfo(
  appointment: Pick<Appointment, "id" | "facilityId" | "status">
): Promise<{ queuePosition: number; estimatedWaitMinutes: number } | null> {
  if (appointment.status !== "InQueue" || !appointment.facilityId) return null

  const { data, error } = await supabase
    .from("appointments")
    .select("id, created_at")
    .eq("facility_id", appointment.facilityId)
    .eq("status", "InQueue")
    .order("created_at", { ascending: true })

  if (error) {
    // Never let a live-position lookup failure blank out the whole
    // appointment/home summary — fall back to whatever was already stored.
    console.error("computeLiveQueueInfo failed", error)
    return null
  }

  const position = (data ?? []).findIndex((row: any) => row.id === appointment.id)
  if (position === -1) return null

  return { queuePosition: position + 1, estimatedWaitMinutes: (position + 1) * 10 }
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export async function getHomeSummary(patientId: string) {
  const oneDayAgo = new Date(Date.now() - ONE_DAY_MS).toISOString()

  const [{ data: appointments, error: appointmentsError }, { data: referrals, error: referralsError }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patientId)
        .in("status", ["Booked", "InQueue", "InProgress"])
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("referrals")
        .select("*")
        .eq("patient_id", patientId)
        .neq("status", "Completed")
        .order("created_at", { ascending: false })
        .limit(1),
    ])

  if (appointmentsError) throw appointmentsError
  if (referralsError) throw referralsError

  let activeAppointment = appointments?.[0] ? mapAppointment(appointments[0]) : undefined
  if (activeAppointment) {
    const live = await computeLiveQueueInfo(activeAppointment)
    if (live) activeAppointment = { ...activeAppointment, ...live }
  }

  return {
    activeAppointment,
    latestReferral: referrals?.[0] ? mapReferral(referrals[0]) : undefined,
    dueFollowUp: undefined,
  }
}

// Triage sessions stay local-first (Dexie) until a background sync layer
// exists — see Architecture Specification §6.
export async function submitTriage(patientId: string, answers: TriageAnswer[]): Promise<TriageSession> {
  const result = computeTriageResult(answers)
  const session: TriageSession = {
    id: `triage-${Date.now()}`,
    patientId,
    answers,
    urgency: result.urgency,
    reason: result.reasonKey,
    createdAt: new Date().toISOString(),
  }
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
  bookedFor?: { name: string; relation: Appointment["bookedForRelation"] },
  wantsAsha?: boolean
): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      id: `appt-${Date.now()}`,
      patient_id: patientId,
      facility_id: facilityId,
      doctor_id: doctorId ?? null,
      type,
      slot_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      status: "InQueue",
      booked_for_name: bookedFor?.name ?? null,
      booked_for_relation: bookedFor?.relation ?? null,
      wants_asha: wantsAsha ?? false,
    })
    .select()
    .single()

  if (error) throw error
  const appointment = mapAppointment(data)
  const live = await computeLiveQueueInfo(appointment)
  return live ? { ...appointment, ...live } : appointment
}

export async function getAppointments(patientId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .order("slot_time", { ascending: false })

  if (error) throw error
  const appointments = (data ?? []).map(mapAppointment)

  return Promise.all(
    appointments.map(async (appointment) => {
      const live = await computeLiveQueueInfo(appointment)
      return live ? { ...appointment, ...live } : appointment
    })
  )
}

export async function cancelAppointment(appointmentId: string, reason: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "Cancelled", cancellation_reason: reason })
    .eq("id", appointmentId)
    .select()
    .single()

  if (error) throw error
  return mapAppointment(data)
}

export async function submitFeedback(
  appointmentId: string,
  doctorId: string,
  patientId: string,
  rating: number,
  comment?: string
): Promise<DoctorFeedback> {
  const { data, error } = await supabase
    .from("feedback")
    .insert({
      id: `fb-${Date.now()}`,
      appointment_id: appointmentId,
      doctor_id: doctorId,
      patient_id: patientId,
      rating,
      comment: comment ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return {
    id: data.id,
    appointmentId: data.appointment_id,
    doctorId: data.doctor_id,
    patientId: data.patient_id,
    rating: data.rating,
    comment: data.comment ?? undefined,
    createdAt: data.created_at,
  }
}

export async function getFeedbackForAppointment(appointmentId: string) {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("appointment_id", appointmentId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return {
    id: data.id,
    appointmentId: data.appointment_id,
    doctorId: data.doctor_id,
    patientId: data.patient_id,
    rating: data.rating,
    comment: data.comment ?? undefined,
    createdAt: data.created_at,
  }
}

export async function getPatientProfile(patientId: string): Promise<Patient> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single()

  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    dob: data.dob ?? undefined,
    age: data.age ?? undefined,
    gender: data.gender ?? undefined,
    symptoms: data.symptoms ?? undefined,
    preferredLanguage: data.preferred_language,
    isGuardianManaged: data.is_guardian_managed ?? false,
    abhaId: data.abha_id ?? undefined,
  }
}

export interface UpdatePatientProfileInput {
  name?: string
  age?: number
  gender?: "Male" | "Female" | "Other"
  phone?: string
  symptoms?: string
}

export async function updatePatientProfile(
  patientId: string,
  input: UpdatePatientProfileInput
): Promise<Patient> {
  const { data, error } = await supabase
    .from("patients")
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.age !== undefined && { age: input.age }),
      ...(input.gender !== undefined && { gender: input.gender }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.symptoms !== undefined && { symptoms: input.symptoms }),
    })
    .eq("id", patientId)
    .select()
    .single()

  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    dob: data.dob ?? undefined,
    age: data.age ?? undefined,
    gender: data.gender ?? undefined,
    symptoms: data.symptoms ?? undefined,
    preferredLanguage: data.preferred_language,
    isGuardianManaged: data.is_guardian_managed ?? false,
    abhaId: data.abha_id ?? undefined,
  }
}

export async function getHealthRecords(patientId: string) {
  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapHealthRecord)
}

export async function getReferrals(patientId: string) {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapReferral)
}

export async function searchStock(facilityId: string, query: string): Promise<StockItem[]> {
  const q = query.trim()
  let request = supabase.from("stock_items").select("*").eq("facility_id", facilityId)
  if (q) request = request.ilike("name", `%${q}%`)
  const { data, error } = await request

  if (error) throw error
  return (data ?? []).map((s: any) => ({
    id: s.id,
    facilityId: s.facility_id,
    name: s.name,
    category: s.category,
    status: s.status,
    updatedAt: s.updated_at,
  }))
}

export async function findNearestAvailable(itemName: string, excludeFacilityId: string) {
  const { data, error } = await supabase
    .from("stock_items")
    .select("*")
    .ilike("name", itemName)
    .neq("facility_id", excludeFacilityId)
    .eq("status", "Available")
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return undefined
  return {
    id: data.id,
    facilityId: data.facility_id,
    name: data.name,
    category: data.category,
    status: data.status,
    updatedAt: data.updated_at,
  } as StockItem
}

// No real dispatch system exists yet, so SOS routing stays a fixed demo response.
export async function triggerEmergencySos(_patientId: string) {
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
