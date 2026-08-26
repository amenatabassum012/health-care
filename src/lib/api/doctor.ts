import { db } from "@/lib/db"
import { MOCK_APPOINTMENT, MOCK_APPOINTMENTS, MOCK_PATIENT_DIRECTORY, MOCK_REFERRALS } from "@/mocks/patients"
import { MOCK_STAFF } from "@/mocks/staff"
import type { Appointment, Qualification, Referral, ReferralUrgency, StaffRole, StaffUser } from "@/types"
import { networkDelay } from "./delay"
import { supabase } from "@/lib/supabaseClient"

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
  const { id, ...rest } = input

  const { data, error } = await supabase
    .from('staff')
    .insert({
      name: rest.name,
      phone: rest.phone,
      email: rest.email,
      role: rest.role,
      facility_id: rest.facilityId,
      specialty_id: rest.specialtyId ?? null,
      nmc_registration_no: rest.nmcRegistrationNo,
      credential_file_name: rest.credentialFileName ?? null,
      verification_status: 'Pending',
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email,
    role: data.role,
    facilityId: data.facility_id,
    specialtyId: data.specialty_id,
    nmcRegistrationNo: data.nmc_registration_no,
    credentialFileName: data.credential_file_name,
    verificationStatus: data.verification_status,
  } as StaffUser
}

export async function loginStaff(staffIdOrPhone: string): Promise<StaffUser> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .or(`phone.eq.${staffIdOrPhone},id.eq.${staffIdOrPhone}`)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Staff not found. Please register first.')

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email,
    role: data.role,
    facilityId: data.facility_id,
    specialtyId: data.specialty_id,
    nmcRegistrationNo: data.nmc_registration_no,
    credentialFileName: data.credential_file_name,
    verificationStatus: data.verification_status,
  } as StaffUser
}

export async function getPendingStaff(facilityId: string): Promise<StaffUser[]> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('facility_id', facilityId)
    .eq('verification_status', 'Pending')

  if (error) throw error

  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: s.email,
    role: s.role,
    facilityId: s.facility_id,
    specialtyId: s.specialty_id,
    nmcRegistrationNo: s.nmc_registration_no,
    credentialFileName: s.credential_file_name,
    verificationStatus: s.verification_status,
  })) as StaffUser[]
}

export async function approveStaff(staffId: string) {
  const { data, error } = await supabase
    .from('staff')
    .update({ verification_status: 'Verified' })
    .eq('id', staffId)
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email,
    role: data.role,
    facilityId: data.facility_id,
    specialtyId: data.specialty_id,
    nmcRegistrationNo: data.nmc_registration_no,
    credentialFileName: data.credential_file_name,
    verificationStatus: data.verification_status,
  } as StaffUser
}

export async function rejectStaff(staffId: string, reason: string) {
  const { data, error } = await supabase
    .from('staff')
    .update({ verification_status: 'Rejected' })
    .eq('id', staffId)
    .select()
    .single()

  if (error) throw error
  return data
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
