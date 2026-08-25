import { db } from "@/lib/db"
import { MOCK_APPOINTMENT, MOCK_APPOINTMENTS, MOCK_PATIENT_DIRECTORY, MOCK_REFERRALS } from "@/mocks/patients"
import { MOCK_STAFF } from "@/mocks/staff"
import type { Appointment, Qualification, Referral, ReferralUrgency, StaffRole, StaffUser } from "@/types"
import { networkDelay } from "./delay"

export interface StaffRegistrationInput {
  id?: string
  name: string
  phone: string
  email: string
  role: StaffRole
  facilityId: string
  specialtyId?: string
  nmcRegistrationNo: string
  credentialFileName?: string
}

export async function registerStaff(input: StaffRegistrationInput): Promise<StaffUser> {
  await networkDelay(900)
  const { id, ...rest } = input
  const staff: StaffUser = {
    id: id ?? `staff-${Date.now()}`,
    verificationStatus: "Pending",
    ...rest,
  }
  MOCK_STAFF.push(staff)
  return staff
}

export async function loginStaff(staffIdOrPhone: string): Promise<StaffUser> {
  await networkDelay(600)
  const staff = MOCK_STAFF.find(
    (s) => s.phone === staffIdOrPhone || s.id === staffIdOrPhone
  )
  if (!staff) {
    // Demo fallback: first verified doctor, so the flow is explorable without
    // needing to remember a seeded phone number.
    return MOCK_STAFF.find((s) => s.verificationStatus === "Verified" && s.role !== "FacilityAdmin")!
  }
  return staff
}

export async function getPendingStaff(facilityId: string): Promise<StaffUser[]> {
  await networkDelay(400)
  return MOCK_STAFF.filter((s) => s.facilityId === facilityId && s.verificationStatus === "Pending")
}

export async function approveStaff(staffId: string) {
  await networkDelay(500)
  const staff = MOCK_STAFF.find((s) => s.id === staffId)
  if (staff) staff.verificationStatus = "Verified"
  return staff
}

export async function rejectStaff(staffId: string, reason: string) {
  await networkDelay(500)
  const staff = MOCK_STAFF.find((s) => s.id === staffId)
  if (staff) {
    staff.verificationStatus = "Rejected"
    staff.rejectionReason = reason
  }
  return staff
}

export async function getDoctorQueue(_facilityId: string) {
  await networkDelay(400)
  return [
    { ...MOCK_APPOINTMENT, patientName: "Suman Devi", urgency: "InPerson" as const },
    {
      ...MOCK_APPOINTMENT,
      id: "appt-002",
      patientId: "pat-002",
      patientName: "Deepak Kumar",
      queuePosition: 1,
      type: "Teleconsult" as const,
      urgency: "Teleconsult" as const,
      status: "InProgress" as const,
    },
    {
      ...MOCK_APPOINTMENT,
      id: "appt-003",
      patientId: "pat-003",
      patientName: "Baby of Kavita",
      queuePosition: 2,
      urgency: "Emergency" as const,
    },
  ]
}

/**
 * Marks the consultation done — this is the trigger that lets the patient
 * rate the visit, so the appointment moves to Completed in both the shared
 * mock store and the offline cache the patient side reads from.
 */
export async function completeConsultation(appointment: Appointment): Promise<Appointment> {
  await networkDelay(500)
  const completed: Appointment = { ...appointment, status: "Completed" }
  const idx = MOCK_APPOINTMENTS.findIndex((a) => a.id === completed.id)
  if (idx >= 0) {
    MOCK_APPOINTMENTS[idx] = completed
  } else {
    MOCK_APPOINTMENTS.push(completed)
  }
  await db.appointments.put(completed)
  return completed
}

export async function getReferralInbox(facilityId: string) {
  await networkDelay(400)
  return MOCK_REFERRALS.filter((r) => r.toFacilityId === facilityId)
}

export interface AddQualificationInput {
  id?: string
  staffId: string
  degree: string
  institution: string
  year: string
  fileName?: string
}

export async function addQualification(input: AddQualificationInput): Promise<StaffUser> {
  await networkDelay(600)
  const staffMember = MOCK_STAFF.find((s) => s.id === input.staffId)
  if (!staffMember) throw new Error("Staff not found")
  const qualification: Qualification = {
    id: input.id ?? `qual-${Date.now()}`,
    degree: input.degree,
    institution: input.institution,
    year: input.year,
    fileName: input.fileName,
  }
  staffMember.qualifications = [...(staffMember.qualifications ?? []), qualification]
  return staffMember
}

export async function getDoctorAppointments(doctorId: string) {
  await networkDelay(400)
  const appointments = MOCK_APPOINTMENTS.filter((a) => a.doctorId === doctorId).map((a) => ({
    ...a,
    patientName: MOCK_PATIENT_DIRECTORY[a.patientId] ?? a.patientId,
  }))
  await db.appointments.bulkPut(appointments)
  return appointments
}

export interface CreateReferralInput {
  patientId: string
  patientName: string
  fromFacilityId: string
  fromDoctorId: string
  toFacilityId: string
  toDoctorId?: string
  specialtyId: string
  urgency: ReferralUrgency
  structuredSummary: string
}

export async function createReferral(input: CreateReferralInput): Promise<Referral> {
  await networkDelay(700)
  const now = new Date().toISOString()
  const referral: Referral = {
    id: `ref-${Date.now()}`,
    status: "Pending",
    createdAt: now,
    updatedAt: now,
    ...input,
  }
  MOCK_REFERRALS.push(referral)
  await db.referrals.put(referral)
  return referral
}

export async function getReferralsMadeByDoctor(doctorId: string) {
  await networkDelay(400)
  return MOCK_REFERRALS.filter((r) => r.fromDoctorId === doctorId)
}

export async function getFacilityMetrics(facilityId: string) {
  await networkDelay(500)
  return {
    facilityId,
    patientLoadToday: 42,
    referralCompletionRate: 0.81,
    stockAvailabilityRate: 0.74,
    avgWaitMinutes: 27,
  }
}
