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
   DEMO HEALTHCARE FACILITIES
   These are temporary testing locations.
   Replace with real facilities later.
========================================================= */

const DEMO_FACILITIES: HealthcareFacility[] = [
  {
    id: "demo-phc-1",
    name: "Osmania General Hospital",
    facility_type: "Hospital",
    village: "Afzalgunj",
    address: "Begum Bazar Road, Afzalgunj, Hyderabad",
    phone: "040-24600146",
    latitude: 17.3730,
    longitude: 78.4743,
  },

  {
    id: "demo-chc-1",
    name: "Government Maternity Hospital, Petlaburj",
    facility_type: "CHC",
    village: "Petlaburj",
    address: "Petlaburj, Hyderabad",
    phone: "040-12345679",
    latitude: 17.3684,
    longitude: 78.4674,
  },

  {
    id: "demo-hospital-1",
    name: "Princess Durru Shehvar Hospital, Purani Haveli",
    facility_type: "Hospital",
    village: "Purani Haveli",
    address: "Purani Haveli, Hyderabad",
    phone: "040-12345680",
    latitude: 17.3673,
    longitude: 78.4827,
  },
]

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
  /*
    Temporary demo mode.

    We are intentionally not querying
    healthcare_facilities from Supabase right now
    because that table is not available through
    the current Supabase Data API.

    The location system can therefore be tested
    without depending on that table.
  */

  return DEMO_FACILITIES
}