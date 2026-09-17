import { supabase } from "./supabaseClient"

export type UserRole = "patient" | "doctor" | "asha"

export interface HealthcareFacility {
  id: string
  name: string
  facility_type: "PHC" | "CHC" | "Hospital"
  village: string | null
  address: string | null
  phone: string | null
  latitude: number
  longitude: number
  created_at?: string
}

/* =========================================================
   FACILITY TIER -> DISPLAY TYPE MAPPING
   public.facilities uses FacilityTier ("SubCentre" | "PHC" |
   "RuralHospital" | "DistrictHospital"); the nearby-healthcare
   UI displays the simpler "PHC" | "CHC" | "Hospital".
========================================================= */

function mapTierToFacilityType(
  tier: string
): HealthcareFacility["facility_type"] {
  switch (tier) {
    case "PHC":
      return "PHC"
    case "SubCentre":
      return "CHC"
    default:
      return "Hospital"
  }
}

/* =========================================================
   SAVE USER LOCATION
========================================================= */

export async function saveUserLocation(
  userId: string,
  role: UserRole,
  latitude: number,
  longitude: number,
  accuracy: number | null
) {
  const { data, error } = await supabase
    .from("user_locations")
    .upsert(
      {
        user_id: userId,
        user_role: role,
        latitude,
        longitude,
        accuracy,
        is_sharing: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select()
    .single()

  if (error) {
    console.error(
      "Error saving user location:",
      error
    )

    throw error
  }

  return data
}

/* =========================================================
   STOP LOCATION SHARING
========================================================= */

export async function stopLocationSharing(
  userId: string
) {
  const { error } = await supabase
    .from("user_locations")
    .update({
      is_sharing: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (error) {
    console.error(
      "Error stopping location sharing:",
      error
    )

    throw error
  }
}

/* =========================================================
   GET HEALTHCARE FACILITIES
========================================================= */

export async function getHealthcareFacilities(): Promise<
  HealthcareFacility[]
> {
  const { data, error } = await supabase
    .from("facilities")
    .select("id, name, tier, district, address, phone, latitude, longitude")
    .not("latitude", "is", null)
    .not("longitude", "is", null)

  if (error) {
    console.error(
      "Error loading healthcare facilities:",
      error
    )

    throw error
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    facility_type: mapTierToFacilityType(row.tier),
    village: row.district ?? null,
    address: row.address ?? null,
    phone: row.phone ?? null,
    latitude: row.latitude,
    longitude: row.longitude,
  }))
}