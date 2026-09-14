import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  Hospital,
  Loader2,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";

import LocationMap from "./LocationMap";

import {
  getHealthcareFacilities,
} from "@/lib/location";

import type {
  HealthcareFacility,
} from "@/lib/location";

import {
  useUserLocation,
} from "@/hooks/useUserLocation";

interface NearbyHealthcareProps {
  role: "patient" | "doctor" | "asha";
  userId?: string | null;
}

interface NearbyFacility
  extends HealthcareFacility {
  distance: number;
}

/* =========================================================
   CALCULATE DISTANCE BETWEEN TWO GPS LOCATIONS
========================================================= */

function calculateDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadius = 6371;

  const latDifference =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const longitudeDifference =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(latDifference / 2) *
      Math.sin(latDifference / 2) +
    Math.cos(
      (latitude1 * Math.PI) / 180
    ) *
      Math.cos(
        (latitude2 * Math.PI) / 180
      ) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function NearbyHealthcare({
  role,
  userId = null,
}: NearbyHealthcareProps) {

  /* =======================================================
     USER LOCATION
  ======================================================= */

  const {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    startLocationSharing,
  } = useUserLocation(
    userId,
    role
  );

  /* =======================================================
     HEALTHCARE FACILITIES
  ======================================================= */

  const [facilities, setFacilities] =
    useState<HealthcareFacility[]>([]);

  const [
    facilityLoading,
    setFacilityLoading,
  ] = useState(true);

  const [
    facilityError,
    setFacilityError,
  ] = useState<string | null>(null);

  /* =======================================================
     LOAD FACILITIES
  ======================================================= */

  useEffect(() => {
    async function loadFacilities() {
      try {
        setFacilityLoading(true);
        setFacilityError(null);

        const data =
          await getHealthcareFacilities();

        setFacilities(data);
      } catch (error) {
        console.error(
          "Error loading healthcare facilities:",
          error
        );

        setFacilityError(
          "Unable to load healthcare facilities."
        );
      } finally {
        setFacilityLoading(false);
      }
    }

    loadFacilities();
  }, []);

  /* =======================================================
     CALCULATE NEAREST FACILITIES
  ======================================================= */

  const nearbyFacilities =
    useMemo<NearbyFacility[]>(() => {

      if (
        latitude === null ||
        longitude === null
      ) {
        return [];
      }

      return facilities
        .map((facility) => ({
          ...facility,

          distance:
            calculateDistance(
              latitude,
              longitude,
              facility.latitude,
              facility.longitude
            ),
        }))
        .sort(
          (a, b) =>
            a.distance - b.distance
        )
        .slice(0, 5);

    }, [
      latitude,
      longitude,
      facilities,
    ]);

  /* =======================================================
     GOOGLE MAPS DIRECTIONS
  ======================================================= */

  function openDirections(
    facility: NearbyFacility
  ) {
    if (
      latitude === null ||
      longitude === null
    ) {
      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${latitude},${longitude}` +
      `&destination=${facility.latitude},${facility.longitude}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">

      {/* ---------------------------------------------------
          HEADER
      --------------------------------------------------- */}

      <div className="mb-4 flex items-center gap-3">

        <div className="flex size-11 items-center justify-center rounded-xl bg-teal/10 text-teal">

          <MapPin className="size-5" />

        </div>

        <div>

          <h2 className="text-lg font-bold text-foreground">
            Nearby Healthcare
          </h2>

          <p className="text-sm text-muted-foreground">
            Healthcare facilities near your current location
          </p>

        </div>

      </div>


      {/* ---------------------------------------------------
          LOCATION LOADING
      --------------------------------------------------- */}

      {loading && (
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">

          <Loader2 className="size-4 animate-spin" />

          Detecting your current location...

        </div>
      )}


      {/* ---------------------------------------------------
          LOCATION ERROR
      --------------------------------------------------- */}

      {error && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <AlertCircle className="size-5 shrink-0" />

          <div className="flex-1">

            <p className="font-semibold">
              Location unavailable
            </p>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() => startLocationSharing()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              Allow location access
            </button>

            <p className="mt-2 text-xs text-red-700/80">
              If nothing happens, click the location icon in your browser's address bar, choose "Allow", then try again.
            </p>

          </div>

        </div>
      )}


      {/* ---------------------------------------------------
          LOCATION FOUND
      --------------------------------------------------- */}

      {latitude !== null &&
        longitude !== null && (
          <>

            {/* CURRENT LOCATION */}

            <div className="mb-4 rounded-xl bg-teal/5 p-3">

              <div className="flex items-center gap-2">

                <MapPin className="size-4 text-teal" />

                <span className="text-sm font-semibold">

                  Your current location detected

                </span>

              </div>

              {accuracy !== null && (
                <p className="mt-1 text-xs text-muted-foreground">

                  Accuracy:{" "}
                  {Math.round(accuracy)}
                  {" "}
                  meters

                </p>
              )}

            </div>


            {/* MAP */}

            <LocationMap
              latitude={latitude}
              longitude={longitude}
              facilities={nearbyFacilities}
              height="300px"
            />


            {/* NEAREST FACILITIES */}

            <div className="mt-5">

              <h3 className="mb-3 text-base font-bold text-foreground">

                Nearest Healthcare Facilities

              </h3>


              {/* FACILITY LOADING */}

              {facilityLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">

                  <Loader2 className="size-4 animate-spin" />

                  Loading facilities...

                </div>
              )}


              {/* FACILITY ERROR */}

              {facilityError && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">

                  {facilityError}

                </div>
              )}


              {/* NO FACILITIES */}

              {!facilityLoading &&
                !facilityError &&
                nearbyFacilities.length === 0 && (
                  <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">

                    No healthcare facilities found nearby.

                  </div>
                )}


              {/* FACILITY LIST */}

              <div className="space-y-3">

                {nearbyFacilities.map(
                  (facility) => (

                    <div
                      key={facility.id}
                      className="rounded-xl border border-border p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 gap-3">

                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">

                            <Hospital className="size-5" />

                          </div>

                          <div>

                            <h4 className="font-semibold">

                              {facility.name}

                            </h4>

                            <p className="text-xs text-muted-foreground">

                              {facility.facility_type}

                              {facility.village &&
                                ` • ${facility.village}`}

                            </p>

                            {facility.address && (
                              <p className="mt-1 text-xs text-muted-foreground">

                                {facility.address}

                              </p>
                            )}

                          </div>

                        </div>


                        {/* DISTANCE */}

                        <span className="shrink-0 rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">

                          {facility.distance < 1
                            ? `${Math.round(
                                facility.distance *
                                  1000
                              )} m`
                            : `${facility.distance.toFixed(
                                1
                              )} km`}

                        </span>

                      </div>


                      {/* BUTTONS */}

                      <div className="mt-3 flex gap-2">

                        {facility.phone && (
                          <a
                            href={`tel:${facility.phone}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                          >

                            <Phone className="size-4" />

                            Call

                          </a>
                        )}


                        <button
                          type="button"
                          onClick={() =>
                            openDirections(
                              facility
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-dark"
                        >

                          <Navigation className="size-4" />

                          Directions

                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </>
        )}

    </section>
  );
}