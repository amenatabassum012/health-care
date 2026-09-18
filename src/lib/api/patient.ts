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

export async function requestOtp(phone: string) {
  const testCode = TEST_OTP_NUMBERS[phone]

  if (testCode) {
    console.log(
      `[TEST OTP] Using fixed demo code for ${phone}: ${testCode}`
    )

    return {
      phone,
      requestId: `otp-test-${Date.now()}`,
      demoCode: testCode,
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(
    Date.now() + 5 * 60 * 1000
  ).toISOString()

  const { error } = await supabase
    .from("otp_codes")
    .insert({
      phone,
      code,
      expires_at: expiresAt,
    })

  if (error) throw error

  console.log(`OTP for ${phone}: ${code}`)

  return {
    phone,
    requestId: `otp-${Date.now()}`,
    demoCode: code,
  }
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<Patient> {
  const testCode = TEST_OTP_NUMBERS[phone]

  if (testCode) {
    if (code !== testCode) {
      throw new Error("Invalid or expired OTP")
    }

    return {
      ...MOCK_PATIENT,
      phone,
    }
  }

  const { data, error } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("phone", phone)
    .eq("code", code)
    .eq("verified", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    throw new Error("Invalid or expired OTP")
  }

  await supabase
    .from("otp_codes")
    .update({
      verified: true,
    })
    .eq("id", data.id)

  return {
    ...MOCK_PATIENT,
    phone,
  }
}

/* =========================================================
   PATIENT HOME SUMMARY
   ========================================================= */

export async function getHomeSummary() {
  try {
    /*
     * Get the currently logged-in patient.
     *
     * Your existing OTP login currently returns MOCK_PATIENT,
     * so we use its phone number to find the matching patient
     * in Supabase.
     */

    const phone = MOCK_PATIENT.phone

    let patientId: string | null = null

    if (phone) {
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("id")
        .eq("phone", phone)
        .maybeSingle()

      if (patientError) {
        console.error(
          "Error loading patient from Supabase:",
          patientError
        )
      }

      if (patient) {
        patientId = patient.id
      }
    }

    /*
     * If we cannot find the patient in Supabase,
     * keep the existing demo data instead of breaking
     * the Patient Home page.
     */

    if (!patientId) {
      console.warn(
        "Patient not found in Supabase. Using demo Home data."
      )

      await networkDelay(400)

      return {
        activeAppointment: MOCK_APPOINTMENT,
        latestReferral: MOCK_REFERRALS.find(
          (r) => r.status !== "Completed"
        ),
        dueFollowUp: MOCK_FOLLOW_UPS.find(
          (f) => f.status === "Pending"
        ),
      }
    }

    /* =====================================================
       ACTIVE APPOINTMENT
       ===================================================== */

    const { data: appointment, error: appointmentError } =
      await supabase
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
        "Error loading appointment:",
        appointmentError
      )
    }

    /* =====================================================
       LATEST REFERRAL
       ===================================================== */

    const { data: referral, error: referralError } =
      await supabase
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
        "Error loading referral:",
        referralError
      )
    }

    /* =====================================================
       DUE FOLLOW-UP
       ===================================================== */

    const { data: followUp, error: followUpError } =
      await supabase
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
        "Error loading follow-up:",
        followUpError
      )
    }

    /*
     * Convert Supabase appointment fields to the shape
     * expected by PatientHomePage.
     */

    const activeAppointment = appointment
      ? {
          queuePosition:
            appointment.queue_position ?? 0,

          estimatedWaitMinutes:
            appointment.estimated_wait_minutes ?? 0,

          status: appointment.status,

          id: appointment.id,
        }
      : null

    /*
     * Convert referral status to the format expected
     * by the existing Home UI.
     */

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

    console.log("LIVE HOME SUMMARY:", {
      patientId,
      activeAppointment,
      latestReferral,
      dueFollowUp,
    })

    return {
      activeAppointment,
      latestReferral,
      dueFollowUp,
    }
  } catch (error) {
    console.error(
      "getHomeSummary failed:",
      error
    )

    /*
     * Keep the application usable if Supabase is temporarily
     * unavailable.
     */

    return {
      activeAppointment: MOCK_APPOINTMENT,
      latestReferral: MOCK_REFERRALS.find(
        (r) => r.status !== "Completed"
      ),
      dueFollowUp: MOCK_FOLLOW_UPS.find(
        (f) => f.status === "Pending"
      ),
    }
  }
}

/* =========================================================
   TRIAGE
   ========================================================= */

export async function submitTriage(
  patientId: string,
  answers: TriageAnswer[]
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

  // Written to the local-first cache immediately so it is
  // available offline — see Architecture Specification §6
  // and .cursorrules §6.

  await db.triageSessions.put(session)

  return session
}

export async function getCachedTriageSessions(
  patientId: string
) {
  return db.triageSessions
    .where("patientId")
    .equals(patientId)
    .reverse()
    .sortBy("createdAt")
}

/* =========================================================
   APPOINTMENTS
   ========================================================= */

export async function createAppointment(
  patientId: string,
  facilityId: string,
  type: Appointment["type"],
  doctorId?: string,
  bookedFor?: {
    name: string
    relation: Appointment["bookedForRelation"]
  }
): Promise<Appointment> {
  await networkDelay(700)

  const appointment: Appointment = {
    id: `appt-${Date.now()}`,
    patientId,
    facilityId,
    doctorId,
    type,
    slotTime: new Date(
      Date.now() + 45 * 60 * 1000
    ).toISOString(),
    queuePosition:
      Math.floor(Math.random() * 6) + 2,
    estimatedWaitMinutes:
      Math.floor(Math.random() * 40) + 10,
    status: "InQueue",
    bookedForName: bookedFor?.name,
    bookedForRelation: bookedFor?.relation,
  }

  await db.appointments.put(appointment)

  return appointment
}

export async function getAppointments(
  patientId: string
) {
  await networkDelay(400)

  const appointments = MOCK_APPOINTMENTS.filter(
    (a) => a.patientId === patientId
  )

  await db.appointments.bulkPut(appointments)

  return appointments
}

export async function getCachedAppointments(
  patientId: string
) {
  return db.appointments
    .where("patientId")
    .equals(patientId)
    .sortBy("slotTime")
}

export async function cancelAppointment(
  appointmentId: string,
  reason: string
): Promise<Appointment> {
  await networkDelay(400)

  const appointment =
    await db.appointments.get(appointmentId)

  if (!appointment) {
    throw new Error("Appointment not found")
  }

  const updated: Appointment = {
    ...appointment,
    status: "Cancelled",
    cancellationReason: reason,
  }

  await db.appointments.put(updated)

  return updated
}

/* =========================================================
   FEEDBACK
   ========================================================= */

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

export async function getFeedbackForAppointment(
  appointmentId: string
) {
  const feedback = await db.feedback
    .where("appointmentId")
    .equals(appointmentId)
    .first()

  return feedback ?? null
}

/* =========================================================
   HEALTH RECORDS
   ========================================================= */

export async function getHealthRecords(
  patientId: string
) {
  await networkDelay(400)

  const records = MOCK_HEALTH_RECORDS.filter(
    (r) => r.patientId === patientId
  )

  await db.healthRecords.bulkPut(records)

  return records
}

export async function getCachedHealthRecords(
  patientId: string
) {
  return db.healthRecords
    .where("patientId")
    .equals(patientId)
    .reverse()
    .sortBy("date")
}

/* =========================================================
   REFERRALS
   ========================================================= */

export async function getReferrals(
  patientId: string
) {
  await networkDelay(400)

  const referrals = MOCK_REFERRALS.filter(
    (r) => r.patientId === patientId
  )

  await db.referrals.bulkPut(referrals)

  return referrals
}

/* =========================================================
   MEDICINE / STOCK
   ========================================================= */

export async function searchStock(
  facilityId: string,
  query: string
): Promise<StockItem[]> {
  await networkDelay(350)

  const q = query.trim().toLowerCase()

  return MOCK_STOCK.filter(
    (s) =>
      s.facilityId === facilityId &&
      (!q ||
        s.name.toLowerCase().includes(q))
  )
}

export async function findNearestAvailable(
  itemName: string,
  excludeFacilityId: string
) {
  await networkDelay(350)

  return MOCK_STOCK.find(
    (s) =>
      s.name.toLowerCase() ===
        itemName.toLowerCase() &&
      s.facilityId !== excludeFacilityId &&
      s.status === "Available"
  )
}

/* =========================================================
   EMERGENCY SOS
   ========================================================= */

export async function triggerEmergencySos(
  _patientId: string
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