import { supabase } from "@/lib/supabaseClient"
import type { Facility, Specialty, StaffUser } from "@/types"

function mapFacility(row: any): Facility {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier,
    district: row.district,
    state: row.state,
    distanceKm: row.distance_km ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  }
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
  }
}

export async function getFacilities(): Promise<Facility[]> {
  const { data, error } = await supabase.from("facilities").select("*").order("name")
  if (error) throw error
  return (data ?? []).map(mapFacility)
}

export async function getStaff(): Promise<StaffUser[]> {
  const { data, error } = await supabase.from("staff").select("*")
  if (error) throw error
  return (data ?? []).map(mapStaff)
}

export async function getStaffById(staffId: string): Promise<StaffUser | null> {
  const { data, error } = await supabase.from("staff").select("*").eq("id", staffId).maybeSingle()
  if (error) throw error
  return data ? mapStaff(data) : null
}

export async function getSpecialties(): Promise<Specialty[]> {
  const { data, error } = await supabase.from("specialties").select("*").order("label")
  if (error) throw error
  return data ?? []
}

export async function searchFacilities(query: string): Promise<Facility[]> {
  const q = query.trim()
  let request = supabase.from("facilities").select("*").order("name")
  if (q) {
    request = request.or(`name.ilike.%${q}%,district.ilike.%${q}%`)
  }
  const { data, error } = await request
  if (error) throw error
  return (data ?? []).map(mapFacility)
}

/**
 * Blends the seeded base rating with any feedback patients have actually
 * submitted (stored in the `feedback` table), so a doctor's displayed rating
 * reflects real submissions rather than staying static seed data forever.
 */
export async function getDoctorRatingSummary(doctorId: string) {
  const staff = await getStaffById(doctorId)
  const { data: localFeedback, error } = await supabase
    .from("feedback")
    .select("rating")
    .eq("doctor_id", doctorId)
  if (error) throw error

  if (!localFeedback?.length) {
    return { rating: staff?.rating, ratingCount: staff?.ratingCount }
  }

  const baseCount = staff?.ratingCount ?? 0
  const baseSum = (staff?.rating ?? 0) * baseCount
  const localSum = localFeedback.reduce((sum, f) => sum + f.rating, 0)
  const totalCount = baseCount + localFeedback.length

  return {
    rating: Math.round(((baseSum + localSum) / totalCount) * 10) / 10,
    ratingCount: totalCount,
  }
}
