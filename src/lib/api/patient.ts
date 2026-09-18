import { db } from "@/lib/db"
import { MOCK_PATIENT } from "@/mocks/patients"
import { computeTriageResult, type TriageOption } from "@/mocks/triage"
import type {
  Appointment,
  DoctorFeedback,
  Patient,
  StockItem,
  TriageAnswer,
  TriageSession,
} from "@/types"
import { networkDelay } from "./delay"
import { supabase } from "@/lib/supabaseClient"

/* =========================================================
   PHONE
   ========================================================= */

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")

  if (cleaned.length === 10) {
    return `+91${cleaned}`
  }

  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`
  }

  if (phone.startsWith("+")) {
    return phone
  }

  return `+${cleaned}`
}

/* =========================================================
   DEMO OTP
   ========================================================= */

const TEST_OTP_NUMBERS: Record<string, string> = {
  "+919999999999": "123456",
  "+919888888888": "123456",
  "+919777777777": "123456",
}

/* =========================================================
   REQUEST OTP
   ========================================================= */

export async function requestOtp(phone: string) {
  const normalizedPhone = normalizePhone(phone)

  const testCode = TEST_OTP_NUMBERS[normalizedPhone]

  if (testCode) {
    console.log(
      `[TEST OTP] Using fixed demo code for ${normalizedPhone}: ${testCode}`,
    )

    return {
      phone: normalizedPhone,
      requestId: `otp-test-${Date.now()}`,
      demoCode: testCode,
    }
  }

  const code = Math.floor(
    100000 + Math.random() * 900000,
  ).toString()

  const expiresAt = new Date(
    Date.now() + 5 * 60 * 1000,
  ).toISOString()

  const { error } = await supabase
    .from("otp_codes")
    .insert({
      phone: normalizedPhone,
      code,
      expires_at: expiresAt,
      verified: false,
    })

  if (error) {
    throw error
  }

  console.log(`OTP for ${normalizedPhone}: ${code}`)

  return {
    phone: normalizedPhone,
    requestId: `otp-${Date.now()}`,
    demoCode: code,
  }
}

/* =========================================================
   VERIFY OTP
   ========================================================= */

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<Patient> {
  const normalizedPhone = normalizePhone(phone)

  const testCode = TEST_OTP_NUMBERS[normalizedPhone]

  if (testCode) {
    if (code !== testCode) {
      throw new Error("Invalid or expired OTP")
    }

    return {
      ...MOCK_PATIENT,
      phone: normalizedPhone,
    }
  }

  const { data, error } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("phone", normalizedPhone)
    .eq("code", code)
    .eq("verified", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    throw new Error("Invalid or expired OTP")
  }

  await supabase
    .from("otp_codes")
    .update({
      verified: true,
    })
    .eq("id", data.id)

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("phone", normalizedPhone)
    .maybeSingle()

  if (!patient) {
    return {
      ...MOCK_PATIENT,
      phone: normalizedPhone,
    }
  }

  return {
    ...MOCK_PATIENT,
    ...patient,
    id: patient.id,
    name: patient.name ?? MOCK_PATIENT.name,
    phone: normalizedPhone,
    preferredLanguage:
      patient.preferred_language ??
      patient.preferredLanguage ??
      MOCK_PATIENT.preferredLanguage,
    isGuardianManaged:
      patient.is_guardian_managed ??
      patient.isGuardianManaged ??
      false,
  } as Patient
}

/* =========================================================
   FIND CURRENT PATIENT
   ========================================================= */

async function getCurrentPatient() {
  const phone = normalizePhone(MOCK_PATIENT.phone)

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("phone", phone)
    .maybeSingle()

  if (error) {
    console.error(
      "Unable to load patient:",
      error,
    )
  }

  return data
}

/* =========================================================
   PATIENT HOME SUMMARY
   ========================================================= */

export async function getHomeSummary() {
  try {
    const patient = await getCurrentPatient()

    if (!patient) {
      console.warn(
        "Patient not found in Supabase.",
      )

      return {
        activeAppointment: null,
        latestReferral: null,
        dueFollowUp: null,
      }
    }

    const patientId = patient.id

    /* ---------------- Appointment ---------------- */

    const {
      data: appointment,
      error: appointmentError,
    } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", patientId)
      .in("status", [
        "Booked",
        "InQueue",
        "InProgress",
      ])
      .order("slot_time", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle()

    if (appointmentError) {
      console.error(
        "Appointment error:",
        appointmentError,
      )
    }

    /* ---------------- Referral ---------------- */

    const {
      data: referral,
      error: referralError,
    } = await supabase
      .from("referrals")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

    if (referralError) {
      console.error(
        "Referral error:",
        referralError,
      )
    }

    /* ---------------- Follow-up ---------------- */

    const {
      data: followUp,
      error: followUpError,
    } = await supabase
      .from("follow_ups")
      .select("*")
      .eq("patient_id", patientId)
      .eq("status", "Pending")
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle()

    if (followUpError) {
      console.error(
        "Follow-up error:",
        followUpError,
      )
    }

    const activeAppointment = appointment
      ? {
          id: appointment.id,
          queuePosition:
            appointment.queue_position ?? 0,
          estimatedWaitMinutes:
            appointment.estimated_wait_minutes ?? 0,
          status: appointment.status,
        }
      : null

    const latestReferral = referral
      ? {
          ...referral,
          status: referral.status,
        }
      : null

    const dueFollowUp = followUp
      ? {
          ...followUp,
          status: followUp.status,
        }
      : null

    console.log(
      "LIVE HOME SUMMARY:",
      {
        patientId,
        activeAppointment,
        latestReferral,
        dueFollowUp,
      },
    )

    return {
      activeAppointment,
      latestReferral,
      dueFollowUp,
    }
  } catch (error) {
    console.error(
      "getHomeSummary failed:",
      error,
    )

    return {
      activeAppointment: null,
      latestReferral: null,
      dueFollowUp: null,
    }
  }
}

/* =========================================================
   TRIAGE
   ========================================================= */

export async function submitTriage(
  patientId: string,
  answers: TriageAnswer[],
): Promise<TriageSession> {
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

  await db.triageSessions.put(session)

  return session
}

export async function getCachedTriageSessions(
  patientId: string,
) {
  return db.triageSessions
    .where("patientId")
    .equals(patientId)
    .reverse()
    .sortBy("createdAt")
}

/* =========================================================
   CREATE APPOINTMENT - SUPABASE
   ========================================================= */

export async function createAppointment(
  patientId: string,
  facilityId: string,
  type: Appointment["type"],
  doctorId?: string,
  bookedFor?: {
    name: string
    relation: Appointment["bookedForRelation"]
  },
): Promise<Appointment> {
  const slotTime = new Date(
    Date.now() + 45 * 60 * 1000,
  ).toISOString()

  const queuePosition =
    Math.floor(Math.random() * 6) + 2

  const estimatedWaitMinutes =
    Math.floor(Math.random() * 40) + 10

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: patientId,
      facility_id: facilityId,
      doctor_id: doctorId ?? null,
      type,
      slot_time: slotTime,
      queue_position: queuePosition,
      estimated_wait_minutes:
        estimatedWaitMinutes,
      status: "InQueue",
      booked_for_name:
        bookedFor?.name ?? null,
      booked_for_relation:
        bookedFor?.relation ?? null,
      wants_asha: false,
    })
    .select("*")
    .single()

  if (error) {
    console.error(
      "Create appointment error:",
      error,
    )

    throw error
  }

  return {
    id: data.id,
    patientId: data.patient_id,
    facilityId: data.facility_id,
    doctorId:
      data.doctor_id ?? undefined,
    type: data.type,
    slotTime: data.slot_time,
    queuePosition:
      data.queue_position ?? undefined,
    estimatedWaitMinutes:
      data.estimated_wait_minutes ?? undefined,
    status: data.status,
    bookedForName:
      data.booked_for_name ?? undefined,
    bookedForRelation:
      data.booked_for_relation ?? undefined,
    wantsAsha:
      data.wants_asha ?? false,
    ashaWorkerId:
      data.asha_worker_id ?? undefined,
  } as Appointment
}

/* =========================================================
   GET APPOINTMENTS - SUPABASE
   ========================================================= */

export async function getAppointments(
  patientId: string,
) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .order("slot_time", {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data ?? []
}

/* =========================================================
   CACHED APPOINTMENTS
   ========================================================= */

export async function getCachedAppointments(
  patientId: string,
) {
  return getAppointments(patientId)
}

/* =========================================================
   CANCEL APPOINTMENT
   ========================================================= */

export async function cancelAppointment(
  appointmentId: string,
  reason: string,
): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: "Cancelled",
      cancellation_reason: reason,
    })
    .eq("id", appointmentId)
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return {
    id: data.id,
    patientId: data.patient_id,
    facilityId: data.facility_id,
    doctorId:
      data.doctor_id ?? undefined,
    type: data.type,
    slotTime: data.slot_time,
    queuePosition:
      data.queue_position ?? undefined,
    estimatedWaitMinutes:
      data.estimated_wait_minutes ??
      undefined,
    status: data.status,
    bookedForName:
      data.booked_for_name ?? undefined,
    bookedForRelation:
      data.booked_for_relation ??
      undefined,
    cancellationReason:
      data.cancellation_reason ??
      undefined,
    wantsAsha:
      data.wants_asha ?? false,
    ashaWorkerId:
      data.asha_worker_id ?? undefined,
  } as Appointment
}

/* =========================================================
   FEEDBACK
   ========================================================= */

export async function submitFeedback(
  appointmentId: string,
  doctorId: string,
  patientId: string,
  rating: number,
  comment?: string,
): Promise<DoctorFeedback> {
  const { data, error } = await supabase
    .from("feedback")
    .insert({
      appointment_id: appointmentId,
      doctor_id: doctorId,
      patient_id: patientId,
      rating,
      comment: comment ?? null,
    })
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return {
    ...data,
    createdAt:
      data.created_at ??
      new Date().toISOString(),
  } as DoctorFeedback
}

export async function getFeedbackForAppointment(
  appointmentId: string,
) {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("appointment_id", appointmentId)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ?? null
}

/* =========================================================
   HEALTH RECORDS
   ========================================================= */

export async function getHealthRecords(
  patientId: string,
) {
  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getCachedHealthRecords(
  patientId: string,
) {
  return getHealthRecords(patientId)
}

/* =========================================================
   REFERRALS
   ========================================================= */

export async function getReferrals(
  patientId: string,
) {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data ?? []
}

/* =========================================================
   MEDICINE / STOCK
   ========================================================= */

export async function searchStock(
  facilityId: string,
  query: string,
): Promise<StockItem[]> {
  const q = query.trim().toLowerCase()

  const { data, error } = await supabase
    .from("shop_stock")
    .select("*")
    .order("updated_at", {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return (data ?? [])
    .filter(
      (item) =>
        item.shop_id === facilityId &&
        (!q ||
          String(item.name)
            .toLowerCase()
            .includes(q)),
    )
    .map(
      (item): StockItem => ({
        id: item.id,
        facilityId: item.shop_id,
        name: item.name,
        category: item.category,
        status: item.status,
        updatedAt: item.updated_at,
      }),
    )
}

export async function findNearestAvailable(
  itemName: string,
  excludeFacilityId: string,
) {
  const { data, error } = await supabase
    .from("shop_stock")
    .select("*")
    .eq("status", "Available")

  if (error) {
    throw error
  }

  const item = (data ?? []).find(
    (stock) =>
      stock.shop_id !== excludeFacilityId &&
      String(stock.name).toLowerCase() ===
        itemName.toLowerCase(),
  )

  if (!item) {
    return undefined
  }

  return {
    id: item.id,
    facilityId: item.shop_id,
    name: item.name,
    category: item.category,
    status: item.status,
    updatedAt: item.updated_at,
  } as StockItem
}

/* =========================================================
   EMERGENCY SOS
   ========================================================= */

export async function triggerEmergencySos(
  _patientId: string,
) {
  await networkDelay(900)

  return {
    routedFacilityName:
      "District Hospital Haridwar",
    etaMinutes: 12,
    smsFallbackSent: true,
  }
}

/* =========================================================
   TRIAGE ICON MAP
   ========================================================= */

export const TRIAGE_ICON_MAP: Record<
  TriageOption["icon"],
  string
> = {
  fever: "Thermometer",
  lungs: "Wind",
  pregnant: "HeartPulse",
  child: "Baby",
  injury: "Bandage",
  chronic: "Activity",
  skin: "Sparkles",
  other: "CircleHelp",
}