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
