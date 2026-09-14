import type { Facility } from "@/types"

const TIER_LABELS: Record<Facility["tier"], string> = {
  SubCentre: "Sub-Centre",
  PHC: "PHC",
  RuralHospital: "Rural Hospital",
  DistrictHospital: "District Hospital",
}

export function facilityLabel(f: Facility) {
  return `${f.name} — ${TIER_LABELS[f.tier]}`
}
