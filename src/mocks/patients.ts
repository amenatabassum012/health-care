import type { Appointment, FollowUpTask, HealthRecordEntry, Patient, Referral, StockItem } from "@/types"

export const MOCK_PATIENT: Patient = {
  id: "pat-001",
  name: "Suman Devi",
  phone: "9123456780",
  dob: "1988-04-12",
  gender: "Female",
  preferredLanguage: "hi",
  isGuardianManaged: false,
}

/**
 * Stand-in for a patient directory lookup, so doctor-side screens (which only
 * ever see patientId on an appointment/referral) can resolve a display name
 * without a full patient record service existing yet.
 */
export const MOCK_PATIENT_DIRECTORY: Record<string, string> = {
  "pat-001": "Suman Devi",
  "pat-002": "Deepak Kumar",
  "pat-003": "Baby of Kavita",
}

export const MOCK_APPOINTMENT: Appointment = {
  id: "appt-001",
  patientId: "pat-001",
  facilityId: "fac-phc-001",
  doctorId: "staff-006",
  type: "InPerson",
  slotTime: "2026-08-25T11:30:00+05:30",
  queuePosition: 4,
  estimatedWaitMinutes: 35,
  status: "InQueue",
}

/**
 * Full appointment history for the logged-in patient — past visits, today's
 * queue entry, and upcoming bookings — so the "My appointments" dashboard can
 * show who they visited and who they're going to visit, across time.
 */
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "appt-past-001",
    patientId: "pat-001",
    facilityId: "fac-sc-001",
    doctorId: "staff-003",
    type: "InPerson",
    slotTime: "2026-07-30T10:00:00+05:30",
    status: "Completed",
  },
  {
    id: "appt-past-002",
    patientId: "pat-001",
    facilityId: "fac-phc-001",
    doctorId: "staff-002",
    type: "InPerson",
    slotTime: "2026-08-22T09:30:00+05:30",
    status: "Completed",
  },
  {
    id: "appt-past-003",
    patientId: "pat-001",
    facilityId: "fac-dh-001",
    doctorId: "staff-001",
    type: "InPerson",
    slotTime: "2026-08-22T15:00:00+05:30",
    status: "Completed",
  },
  MOCK_APPOINTMENT,
  {
    id: "appt-future-001",
    patientId: "pat-001",
    facilityId: "fac-dh-001",
    doctorId: "staff-004",
    type: "InPerson",
    slotTime: "2026-08-28T10:00:00+05:30",
    status: "Booked",
  },
  {
    id: "appt-future-002",
    patientId: "pat-001",
    facilityId: "fac-phc-001",
    doctorId: "staff-002",
    type: "Teleconsult",
    slotTime: "2026-09-02T16:00:00+05:30",
    status: "Booked",
  },
  {
    id: "appt-future-005",
    patientId: "pat-001",
    facilityId: "fac-phc-001",
    doctorId: "staff-006",
    type: "InPerson",
    slotTime: "2026-08-29T09:30:00+05:30",
    status: "Booked",
    bookedForName: "Aarav",
    bookedForRelation: "Child",
  },
  {
    id: "appt-past-004",
    patientId: "pat-002",
    facilityId: "fac-phc-001",
    doctorId: "staff-002",
    type: "InPerson",
    slotTime: "2026-08-20T11:00:00+05:30",
    status: "Completed",
  },
  {
    id: "appt-today-002",
    patientId: "pat-002",
    facilityId: "fac-phc-001",
    doctorId: "staff-002",
    type: "InPerson",
    slotTime: "2026-08-25T14:00:00+05:30",
    queuePosition: 2,
    estimatedWaitMinutes: 20,
    status: "InQueue",
  },
  {
    id: "appt-future-003",
    patientId: "pat-003",
    facilityId: "fac-phc-001",
    doctorId: "staff-002",
    type: "InPerson",
    slotTime: "2026-08-27T09:00:00+05:30",
    status: "Booked",
  },
  {
    id: "appt-past-005",
    patientId: "pat-003",
    facilityId: "fac-phc-001",
    doctorId: "staff-006",
    type: "InPerson",
    slotTime: "2026-08-18T10:30:00+05:30",
    status: "Completed",
  },
  {
    id: "appt-future-004",
    patientId: "pat-002",
    facilityId: "fac-phc-001",
    doctorId: "staff-006",
    type: "InPerson",
    slotTime: "2026-08-30T11:00:00+05:30",
    status: "Booked",
  },
]

export const MOCK_REFERRALS: Referral[] = [
  {
    id: "ref-001",
    patientId: "pat-001",
    patientName: "Suman Devi",
    fromFacilityId: "fac-phc-001",
    fromDoctorId: "staff-002",
    toFacilityId: "fac-dh-001",
    toDoctorId: "staff-001",
    specialtyId: "spec-gynae",
    urgency: "Urgent",
    structuredSummary: "28-week ANC visit, elevated BP (142/94), referred for specialist review.",
    status: "Confirmed",
    createdAt: "2026-08-22T09:15:00+05:30",
    updatedAt: "2026-08-23T14:02:00+05:30",
  },
  {
    id: "ref-002",
    patientId: "pat-001",
    patientName: "Suman Devi",
    fromFacilityId: "fac-sc-001",
    fromDoctorId: "staff-003",
    toFacilityId: "fac-phc-001",
    toDoctorId: "staff-002",
    specialtyId: "spec-general",
    urgency: "Routine",
    structuredSummary: "Persistent cough > 3 weeks, referred for chest X-ray and evaluation.",
    status: "Completed",
    createdAt: "2026-07-30T10:00:00+05:30",
    updatedAt: "2026-08-02T12:00:00+05:30",
  },
]

export const MOCK_HEALTH_RECORDS: HealthRecordEntry[] = [
  {
    id: "rec-001",
    patientId: "pat-001",
    facilityId: "fac-dh-001",
    facilityName: "District Hospital Haridwar",
    type: "Referral",
    title: "Gynaecology referral — ANC review",
    summary: "Referred from PHC Bahadrabad for elevated BP at 28-week ANC visit.",
    date: "2026-08-22",
  },
  {
    id: "rec-002",
    patientId: "pat-001",
    facilityId: "fac-phc-001",
    facilityName: "PHC Bahadrabad",
    type: "Consultation",
    title: "Antenatal check-up",
    summary: "Routine ANC visit. BP 142/94 — flagged high-risk, referral created.",
    date: "2026-08-22",
  },
  {
    id: "rec-003",
    patientId: "pat-001",
    facilityId: "fac-sc-001",
    facilityName: "Sub-Centre Bhagwanpur",
    type: "Triage",
    title: "Digital triage — persistent cough",
    summary: "Symptom triage recommended in-person visit. Routed to PHC Bahadrabad.",
    date: "2026-07-30",
  },
]

export const MOCK_STOCK: StockItem[] = [
  { id: "stk-001", facilityId: "fac-phc-001", name: "Paracetamol 500mg", category: "Medicine", status: "Available", updatedAt: "2026-08-24T08:00:00+05:30" },
  { id: "stk-002", facilityId: "fac-phc-001", name: "Iron & Folic Acid tablets", category: "Medicine", status: "LowStock", updatedAt: "2026-08-24T08:00:00+05:30" },
  { id: "stk-003", facilityId: "fac-phc-001", name: "ORS Sachets", category: "Medicine", status: "Available", updatedAt: "2026-08-24T08:00:00+05:30" },
  { id: "stk-004", facilityId: "fac-phc-001", name: "Chest X-ray", category: "Diagnostic", status: "Unavailable", updatedAt: "2026-08-23T18:00:00+05:30" },
  { id: "stk-005", facilityId: "fac-dh-001", name: "Chest X-ray", category: "Diagnostic", status: "Available", updatedAt: "2026-08-24T08:00:00+05:30" },
  { id: "stk-006", facilityId: "fac-dh-001", name: "Amoxicillin 500mg", category: "Medicine", status: "Available", updatedAt: "2026-08-24T08:00:00+05:30" },
]

export const MOCK_FOLLOW_UPS: FollowUpTask[] = [
  { id: "fu-001", patientId: "pat-001", patientName: "Suman Devi", riskCategory: "Maternal", dueAt: "2026-08-26T10:00:00+05:30", channel: "SMS", status: "Pending" },
  { id: "fu-002", patientId: "pat-002", patientName: "Deepak Kumar", riskCategory: "Chronic", dueAt: "2026-08-25T09:00:00+05:30", channel: "Call", status: "Pending" },
  { id: "fu-003", patientId: "pat-003", patientName: "Baby of Kavita", riskCategory: "Child", dueAt: "2026-08-24T15:00:00+05:30", channel: "App", status: "Reached" },
]
