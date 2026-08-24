import { MOCK_FACILITIES, MOCK_SPECIALTIES } from "@/mocks/facilities"
import { networkDelay } from "./delay"

export async function getFacilities() {
  await networkDelay(300)
  return MOCK_FACILITIES
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
