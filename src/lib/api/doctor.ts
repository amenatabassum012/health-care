import { MOCK_APPOINTMENT, MOCK_REFERRALS } from "@/mocks/patients"
import { MOCK_STAFF } from "@/mocks/staff"
import type { StaffRole, StaffUser } from "@/types"
import { networkDelay } from "./delay"

export interface StaffRegistrationInput {
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
  const staff: StaffUser = {
    id: `staff-${Date.now()}`,
    verificationStatus: "Pending",
    ...input,
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

export async function getReferralInbox(facilityId: string) {
  await networkDelay(400)
  return MOCK_REFERRALS.filter((r) => r.toFacilityId === facilityId)
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
