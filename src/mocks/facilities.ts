import type { Facility, Specialty } from "@/types"

/**
 * Stand-in for the government facility registry described in the Architecture
 * Specification (§8). Facility affiliation must always be selected from a list
 * like this — never free-typed. See .cursorrules §5.
 */
export const MOCK_FACILITIES: Facility[] = [
  { id: "fac-sc-001", name: "Sub-Centre Bhagwanpur", tier: "SubCentre", district: "Haridwar", state: "Uttarakhand", distanceKm: 2.1, latitude: 29.8639, longitude: 77.7511 },
  { id: "fac-sc-002", name: "Sub-Centre Rampur Kalan", tier: "SubCentre", district: "Haridwar", state: "Uttarakhand", distanceKm: 4.8, latitude: 29.8931, longitude: 78.0715 },
  { id: "fac-phc-001", name: "PHC Bahadrabad", tier: "PHC", district: "Haridwar", state: "Uttarakhand", distanceKm: 7.3, latitude: 29.9264, longitude: 78.0322 },
  { id: "fac-phc-002", name: "PHC Narsan", tier: "PHC", district: "Haridwar", state: "Uttarakhand", distanceKm: 11.6, latitude: 29.8408, longitude: 78.0619 },
  { id: "fac-rh-001", name: "Rural Hospital Roorkee", tier: "RuralHospital", district: "Haridwar", state: "Uttarakhand", distanceKm: 18.2, latitude: 29.8543, longitude: 77.8880 },
  { id: "fac-dh-001", name: "District Hospital Haridwar", tier: "DistrictHospital", district: "Haridwar", state: "Uttarakhand", distanceKm: 26.4, latitude: 29.9457, longitude: 78.1642 },
]

export const MOCK_SPECIALTIES: Specialty[] = [
  { id: "spec-general", label: "General Medicine" },
  { id: "spec-gynae", label: "Gynaecology & Obstetrics" },
  { id: "spec-peds", label: "Paediatrics" },
  { id: "spec-cardio", label: "Cardiology" },
  { id: "spec-ortho", label: "Orthopaedics" },
  { id: "spec-derma", label: "Dermatology" },
  { id: "spec-psych", label: "Psychiatry" },
  { id: "spec-ent", label: "ENT" },
]

const TIER_LABELS: Record<Facility["tier"], string> = {
  SubCentre: "Sub-Centre",
  PHC: "PHC",
  RuralHospital: "Rural Hospital",
  DistrictHospital: "District Hospital",
}

export function facilityLabel(f: Facility) {
  return `${f.name} — ${TIER_LABELS[f.tier]}`
}
