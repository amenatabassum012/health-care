import { db } from "@/lib/db"
import { MOCK_FACILITIES, MOCK_SPECIALTIES } from "@/mocks/facilities"
import { MOCK_STAFF } from "@/mocks/staff"
import { networkDelay } from "./delay"

export async function getFacilities() {
  await networkDelay(300)
  return MOCK_FACILITIES
}

export async function getStaff() {
  await networkDelay(300)
  return MOCK_STAFF
}

export async function getStaffById(staffId: string) {
  await networkDelay(300)
  return MOCK_STAFF.find((s) => s.id === staffId) ?? null
}

export async function getSpecialties() {
  await networkDelay(200)
  return MOCK_SPECIALTIES
}

export async function searchFacilities(query: string) {
  await networkDelay(250)
  const q = query.trim().toLowerCase()
  if (!q) return MOCK_FACILITIES
  return MOCK_FACILITIES.filter(
    (f) => f.name.toLowerCase().includes(q) || f.district.toLowerCase().includes(q)
  )
}

/**
 * Blends the seeded base rating with any feedback patients have actually
 * submitted (stored locally in db.feedback), so a doctor's displayed rating
 * reflects real submissions rather than staying static seed data forever.
 */
export async function getDoctorRatingSummary(doctorId: string) {
  const staff = MOCK_STAFF.find((s) => s.id === doctorId)
  const localFeedback = await db.feedback.where("doctorId").equals(doctorId).toArray()

  if (!localFeedback.length) {
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
