export type FacilityTier = "SubCentre" | "PHC" | "RuralHospital" | "DistrictHospital"

export interface Facility {
  id: string
  name: string
  tier: FacilityTier
  district: string
  state: string
  distanceKm?: number
}

export type StaffRole = "Doctor" | "Specialist" | "CHO" | "FacilityAdmin"

export type VerificationStatus = "Pending" | "Verified" | "Rejected"

export interface Specialty {
  id: string
  label: string
}

export interface Qualification {
  id: string
  degree: string
  institution: string
  year: string
  fileName?: string
}

/**
 * A certificate/credential file actually uploaded during this session, stored
 * locally (Dexie/IndexedDB) so it can be reopened for verification. Keyed by
 * the id of whatever it documents — a StaffUser.id for the primary NMC/SMC
 * credential, or a Qualification.id for an individual degree certificate.
 */
export interface StoredCertificate {
  id: string
  fileName: string
  mimeType: string
  dataUrl: string
}

export interface StaffUser {
  id: string
  name: string
  phone: string
  email: string
  role: StaffRole
  specialtyId?: string
  facilityId: string
  nmcRegistrationNo: string
  credentialFileName?: string
  qualifications?: Qualification[]
  verificationStatus: VerificationStatus
  rejectionReason?: string
  consultationFeeInr?: number
  availability?: string
  rating?: number
  ratingCount?: number
}

export interface Patient {
  id: string
  name: string
  phone: string
  dob?: string
  gender?: "Male" | "Female" | "Other"
  preferredLanguage: string
  isGuardianManaged: boolean
  abhaId?: string
}

export type TriageUrgency = "SelfCare" | "Teleconsult" | "InPerson" | "Emergency"

export interface TriageAnswer {
  questionId: string
  value: string
}

export interface TriageSession {
  id: string
  patientId: string
  answers: TriageAnswer[]
  urgency: TriageUrgency
  reason: string
  createdAt: string
}

export type AppointmentType = "Teleconsult" | "InPerson"
export type AppointmentStatus = "Booked" | "InQueue" | "InProgress" | "Completed" | "Cancelled"

export type DependentRelation = "Child" | "Elder" | "Other"

export interface Appointment {
  id: string
  patientId: string
  facilityId: string
  doctorId?: string
  type: AppointmentType
  slotTime: string
  queuePosition?: number
  estimatedWaitMinutes?: number
  status: AppointmentStatus
  bookedForName?: string
  bookedForRelation?: DependentRelation
}

export type ConsultationMode = "Video" | "Audio" | "Callback"

export interface Consultation {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  mode: ConsultationMode
  structuredDiagnosis: string[]
  prescription: PrescriptionItem[]
  notes: string
  startedAt: string
  endedAt?: string
}

export interface PrescriptionItem {
  medicine: string
  dosage: string
  durationDays: number
}

export type ReferralStatus = "Pending" | "Confirmed" | "Completed"
export type ReferralUrgency = "Routine" | "Urgent" | "Critical"

export interface Referral {
  id: string
  patientId: string
  patientName: string
  fromFacilityId: string
  fromDoctorId?: string
  toFacilityId: string
  toDoctorId?: string
  specialtyId: string
  urgency: ReferralUrgency
  structuredSummary: string
  status: ReferralStatus
  createdAt: string
  updatedAt: string
}

export interface HealthRecordEntry {
  id: string
  patientId: string
  facilityId: string
  facilityName: string
  type: "Consultation" | "Referral" | "Triage"
  title: string
  summary: string
  date: string
}

export interface StockItem {
  id: string
  facilityId: string
  name: string
  category: "Medicine" | "Diagnostic"
  status: "Available" | "LowStock" | "Unavailable"
  updatedAt: string
}

export type RiskCategory = "Maternal" | "Child" | "Chronic"

export interface FollowUpTask {
  id: string
  patientId: string
  patientName: string
  riskCategory: RiskCategory
  dueAt: string
  channel: "App" | "SMS" | "Call"
  status: "Pending" | "Reached" | "Missed"
}

export interface DoctorFeedback {
  id: string
  appointmentId: string
  doctorId: string
  patientId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface FacilityQualityMetrics {
  facilityId: string
  patientLoadToday: number
  referralCompletionRate: number
  stockAvailabilityRate: number
  avgWaitMinutes: number
}
