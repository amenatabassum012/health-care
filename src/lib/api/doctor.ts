import { MOCK_STAFF } from "@/mocks/staff";
import type {
  Appointment,
  Qualification,
  Referral,
  ReferralUrgency,
  StaffRole,
  StaffUser,
  TriageUrgency,
} from "@/types";
import { supabase } from "@/lib/supabaseClient";

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
  };
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
  };
}

function mapStaff(row: any): StaffUser {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    role: row.role,
    specialtyId: row.specialty_id ?? undefined,
    facilityId: row.facility_id,
    nmcRegistrationNo: row.nmc_registration_no,
    credentialFileName: row.credential_file_name ?? undefined,
    qualifications: row.qualifications ?? undefined,
    verificationStatus: row.verification_status,
    consultationFeeInr: row.consultation_fee_inr ?? undefined,
    availability: row.availability ?? undefined,
    rating: row.rating ?? undefined,
    ratingCount: row.rating_count ?? undefined,
    bio: row.bio ?? undefined,
  } as StaffUser;
}

/* =========================================================
   STAFF REGISTRATION
   ========================================================= */

// DEMO/TEST STAFF LOGIN — for SIH demo & dev only, do NOT ship to production.
// Real staff login requires registering through the multi-step form and
// waiting for a facility admin to verify the account, which is awkward to
// demo live. Entering this fixed facility code bypasses Supabase entirely
// and logs straight in as one of the seeded mock staff accounts below.
// Facility code -> 000000
// Staff ID / mobile -> one of:
//   staff-001 / 9876500011  -> Dr. Durru Shehvar (Verified, Specialist)
//   staff-002 / 9876500022  -> Dr. Rohit Sharma (Verified, Doctor)
//   staff-005 / 9876500055  -> Meena Rawat (Verified, FacilityAdmin)
//   staff-003 / 9876500033  -> Priya Nautiyal (Pending — to demo the verification block)
const TEST_FACILITY_CODE = "000000"

export interface StaffRegistrationInput {
  id?: string;
  name: string;
  phone: string;
  email: string;
  role: StaffRole;
  facilityId: string;
  specialtyId?: string;
  nmcRegistrationNo: string;
  credentialFileName?: string;
}

export async function registerStaff(
  input: StaffRegistrationInput,
): Promise<StaffUser> {
  const { data, error } = await supabase
    .from("staff")
    .insert({
      ...(input.id ? { id: input.id } : {}),
      name: input.name,
      phone: input.phone,
      email: input.email,
      role: input.role,
      facility_id: input.facilityId,
      specialty_id: input.specialtyId ?? null,
      nmc_registration_no: input.nmcRegistrationNo,
      credential_file_name: input.credentialFileName ?? null,
      verification_status: "Pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapStaff(data);
}

/* =========================================================
   ABDM HPR VERIFICATION
   ========================================================= */

export interface HprVerificationResult {
  verificationStatus: "verified" | "failed" | "unavailable";
  hprId: string;
  verifiedName?: string;
  verifiedQualification?: string;
  verifiedSpecialization?: string;
  verifiedFacility?: string;
  errorMessage?: string;
}

function mapHprVerification(row: any): HprVerificationResult {
  return {
    verificationStatus: row.verification_status,
    hprId: row.hpr_id,
    verifiedName: row.verified_name ?? undefined,
    verifiedQualification: row.verified_qualification ?? undefined,
    verifiedSpecialization: row.verified_specialization ?? undefined,
    verifiedFacility: row.verified_facility ?? undefined,
    errorMessage: row.error_message ?? undefined,
  };
}

// Best-effort: verifies a doctor's ABDM HPR ID via the verify-hpr Edge Function.
// Never throws — if ABDM is unreachable or credentials aren't configured yet,
// resolves to { verificationStatus: "unavailable" } so callers can proceed with
// the existing manual admin-verification flow instead of blocking registration.
export async function verifyHpr(staffId: string, hprId: string): Promise<HprVerificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke("verify-hpr", {
      body: { staffId, hprId },
    });
    if (error) throw error;
    return mapHprVerification(data);
  } catch (err) {
    return {
      verificationStatus: "unavailable",
      hprId,
      errorMessage: err instanceof Error ? err.message : "ABDM verification unavailable",
    };
  }
}

export async function getHprVerification(staffId: string): Promise<HprVerificationResult | null> {
  const { data, error } = await supabase
    .from("doctors")
    .select()
    .eq("staff_id", staffId)
    .maybeSingle();
  if (error || !data) return null;
  return mapHprVerification(data);
}

export async function getHprVerifications(
  staffIds: string[],
): Promise<Record<string, HprVerificationResult>> {
  if (staffIds.length === 0) return {};
  const { data, error } = await supabase.from("doctors").select().in("staff_id", staffIds);
  if (error || !data) return {};
  return Object.fromEntries(data.map((row: any) => [row.staff_id, mapHprVerification(row)]));
}

/* =========================================================
   STAFF LOGIN
   ========================================================= */

export async function loginStaff(
  staffIdOrPhone: string,
  facilityCode?: string,
): Promise<StaffUser> {
  if (facilityCode === TEST_FACILITY_CODE) {
    const testStaff = MOCK_STAFF.find(
      (s) => s.id === staffIdOrPhone || s.phone === staffIdOrPhone,
    );
    if (!testStaff) throw new Error("Staff not found. Please register first.");
    return testStaff;
  }

  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .or(`phone.eq.${staffIdOrPhone},id.eq.${staffIdOrPhone}`)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Staff not found. Please register first.");
  }

  return mapStaff(data);
}

/* =========================================================
   GET PENDING STAFF
   ========================================================= */

export async function getPendingStaff(
  facilityId: string,
): Promise<StaffUser[]> {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("facility_id", facilityId)
    .eq("verification_status", "Pending");

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapStaff);
}

/* =========================================================
   APPROVE STAFF
   ========================================================= */

export async function approveStaff(
  staffId: string,
): Promise<StaffUser> {
  const { data, error } = await supabase
    .from("staff")
    .update({
      verification_status: "Verified",
    })
    .eq("id", staffId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapStaff(data);
}

/* =========================================================
   REJECT STAFF
   ========================================================= */

export async function rejectStaff(
  staffId: string,
  _reason: string,
): Promise<StaffUser> {
  const { data, error } = await supabase
    .from("staff")
    .update({
      verification_status: "Rejected",
    })
    .eq("id", staffId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapStaff(data);
}

/* =========================================================
   DOCTOR QUEUE
   ========================================================= */

export async function getDoctorQueue(facilityId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(name)")
    .eq("facility_id", facilityId)
    .in("status", ["InQueue", "InProgress"])
    .order("queue_position", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    ...mapAppointment(row),
    patientName: row.patients?.name ?? row.patient_id,
    urgency: (row.status === "InProgress" ? "Teleconsult" : "InPerson") as TriageUrgency,
  }));
}

/* =========================================================
   COMPLETE CONSULTATION
   ========================================================= */

export async function completeConsultation(
  appointment: Appointment,
): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "Completed" })
    .eq("id", appointment.id)
    .select()
    .single();

  if (error) throw error;
  return mapAppointment(data);
}

/* =========================================================
   REFERRAL INBOX
   ========================================================= */

export async function getReferralInbox(
  facilityId: string,
) {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("to_facility_id", facilityId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapReferral);
}

/* =========================================================
   ADD QUALIFICATION
   ========================================================= */

export interface AddQualificationInput {
  id?: string;
  staffId: string;
  degree: string;
  institution: string;
  year: string;
  fileName?: string;
}

export async function addQualification(
  input: AddQualificationInput,
): Promise<StaffUser> {
  const { data: current, error: fetchError } = await supabase
    .from("staff")
    .select("qualifications")
    .eq("id", input.staffId)
    .single();

  if (fetchError) throw fetchError;

  const qualification: Qualification = {
    id: input.id ?? `qual-${Date.now()}`,
    degree: input.degree,
    institution: input.institution,
    year: input.year,
    fileName: input.fileName,
  };

  const qualifications = [...(current?.qualifications ?? []), qualification];

  const { data, error } = await supabase
    .from("staff")
    .update({ qualifications })
    .eq("id", input.staffId)
    .select()
    .single();

  if (error) throw error;
  return mapStaff(data);
}

export interface StaffProfileUpdate {
  bio?: string;
  consultationFeeInr?: number;
  availability?: string;
}

export async function updateStaffProfile(
  staffId: string,
  update: StaffProfileUpdate,
): Promise<StaffUser> {
  const { data, error } = await supabase
    .from("staff")
    .update({
      ...(update.bio !== undefined ? { bio: update.bio } : {}),
      ...(update.consultationFeeInr !== undefined ? { consultation_fee_inr: update.consultationFeeInr } : {}),
      ...(update.availability !== undefined ? { availability: update.availability } : {}),
    })
    .eq("id", staffId)
    .select()
    .single();

  if (error) throw error;
  return mapStaff(data);
}

/* =========================================================
   DOCTOR APPOINTMENTS
   ========================================================= */

export async function getDoctorAppointments(
  doctorId: string,
) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(name)")
    .eq("doctor_id", doctorId)
    .order("slot_time", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    ...mapAppointment(row),
    patientName: row.patients?.name ?? row.patient_id,
  }));
}

/* =========================================================
   CREATE REFERRAL
   ========================================================= */

export interface CreateReferralInput {
  patientId: string;
  patientName: string;
  fromFacilityId: string;
  fromDoctorId: string;
  toFacilityId: string;
  toDoctorId?: string;
  specialtyId: string;
  urgency: ReferralUrgency;
  structuredSummary: string;
}

export async function createReferral(
  input: CreateReferralInput,
): Promise<Referral> {
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      id: `ref-${Date.now()}`,
      patient_id: input.patientId,
      patient_name: input.patientName,
      from_facility_id: input.fromFacilityId,
      from_doctor_id: input.fromDoctorId,
      to_facility_id: input.toFacilityId,
      to_doctor_id: input.toDoctorId ?? null,
      specialty_id: input.specialtyId,
      urgency: input.urgency,
      structured_summary: input.structuredSummary,
      status: "Pending",
    })
    .select()
    .single();

  if (error) throw error;
  return mapReferral(data);
}

/* =========================================================
   REFERRALS MADE BY DOCTOR
   ========================================================= */

export async function getReferralsMadeByDoctor(
  doctorId: string,
) {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("from_doctor_id", doctorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapReferral);
}

/* =========================================================
   FACILITY METRICS
   ========================================================= */

export async function getFacilityMetrics(
  facilityId: string,
) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [{ data: todayAppointments }, { data: referrals }, { data: stock }] = await Promise.all([
    supabase
      .from("appointments")
      .select("estimated_wait_minutes, status")
      .eq("facility_id", facilityId)
      .gte("slot_time", startOfDay.toISOString()),
    supabase
      .from("referrals")
      .select("status")
      .or(`from_facility_id.eq.${facilityId},to_facility_id.eq.${facilityId}`),
    supabase
      .from("stock_items")
      .select("status")
      .eq("facility_id", facilityId),
  ]);

  const patientLoadToday = todayAppointments?.length ?? 0;
  const waits = (todayAppointments ?? [])
    .map((a) => a.estimated_wait_minutes)
    .filter((n): n is number => typeof n === "number");
  const avgWaitMinutes = waits.length
    ? Math.round(waits.reduce((sum, n) => sum + n, 0) / waits.length)
    : 0;

  const completedReferrals = (referrals ?? []).filter((r) => r.status === "Completed").length;
  const referralCompletionRate = referrals?.length
    ? Math.round((completedReferrals / referrals.length) * 100) / 100
    : 0;

  const availableStock = (stock ?? []).filter((s) => s.status === "Available").length;
  const stockAvailabilityRate = stock?.length
    ? Math.round((availableStock / stock.length) * 100) / 100
    : 0;

  return {
    facilityId,
    patientLoadToday,
    referralCompletionRate,
    stockAvailabilityRate,
    avgWaitMinutes,
  };
}
