import { useEffect, useMemo, useState } from "react";

import {
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
  getSpecialties,
  getStaff,
} from "@/lib/api/shared";

interface ReferralFacilitiesProps {
  facilityId?: string;
}

interface RankedFacility
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

   Doctor-facing version of NearbyHealthcare: instead of the
   doctor's live GPS, distances are measured from the doctor's
   own registered facility, and results can be filtered to
   facilities that have a staff member in a given specialty —
   the two things a doctor actually needs when deciding where
   to refer a patient.
========================================================= */

export default function ReferralFacilities({
  facilityId,
}: ReferralFacilitiesProps) {

  /* =======================================================
     ALL FACILITIES
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

  const origin = useMemo(
    () =>
      facilities.find(
        (f) => f.id === facilityId
      ) ?? null,
    [facilities, facilityId]
  );

  /* =======================================================
     SPECIALTY FILTER

     A facility "has" a specialty if at least one Doctor/
     Specialist on staff there is registered under it.
  ======================================================= */

  const [specialties, setSpecialties] =
    useState<{ id: string; label: string }[]>([]);

  const [staff, setStaff] = useState<
    { facilityId: string; specialtyId?: string }[]
  >([]);

  const [
    specialtyFilter,
    setSpecialtyFilter,
  ] = useState<string>("all");

  useEffect(() => {
    getSpecialties()
      .then(setSpecialties)
      .catch(() => setSpecialties([]));

    getStaff()
      .then(setStaff)
      .catch(() => setStaff([]));
  }, []);

  const facilityIdsWithSpecialty =
    useMemo(() => {
      if (specialtyFilter === "all") {
        return null;
      }

      return new Set(
        staff
          .filter(
            (s) =>
              s.specialtyId ===
              specialtyFilter
          )
          .map((s) => s.facilityId)
      );
    }, [staff, specialtyFilter]);

  /* =======================================================
     RANK BY DISTANCE FROM MY FACILITY
  ======================================================= */

  const rankedFacilities =
    useMemo<RankedFacility[]>(() => {

      if (!origin) {
        return [];
      }

      return facilities
        .filter(
          (facility) =>
            facility.id !== origin.id
        )
        .filter(
          (facility) =>
            !facilityIdsWithSpecialty ||
            facilityIdsWithSpecialty.has(
              facility.id
            )
        )
        .map((facility) => ({
          ...facility,

          distance:
            calculateDistance(
              origin.latitude,
              origin.longitude,
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
      origin,
      facilities,
      facilityIdsWithSpecialty,
    ]);

  /* =======================================================
     GOOGLE MAPS DIRECTIONS
  ======================================================= */

  function openDirections(
    facility: RankedFacility
  ) {
    if (!origin) {
      return;
    }

    const destinationLabel = [
      facility.name,
      facility.address,
    ]
      .filter(Boolean)
      .join(", ");

    const destinationQuery = encodeURIComponent(
      destinationLabel ||
        `${facility.latitude},${facility.longitude}`
    );

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${origin.latitude},${origin.longitude}` +
      `&destination=${destinationQuery}`;

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
            Referral Facilities
          </h2>

          <p className="text-sm text-muted-foreground">
            {origin
              ? `Nearest facilities from ${origin.name}`
              : "Facilities near your health center"}
          </p>

        </div>

      </div>


      {/* ---------------------------------------------------
          SPECIALTY FILTER
      --------------------------------------------------- */}

      {specialties.length > 0 && (
        <div className="mb-4 flex items-center gap-2">

          <label
            htmlFor="referral-specialty-filter"
            className="text-xs font-semibold text-muted-foreground"
          >
            Needs specialty
          </label>

          <select
            id="referral-specialty-filter"
            value={specialtyFilter}
            onChange={(e) =>
              setSpecialtyFilter(
                e.target.value
              )
            }
            className="h-9 flex-1 rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="all">
              Any specialty
            </option>

            {specialties.map((s) => (
              <option
                key={s.id}
                value={s.id}
              >
                {s.label}
              </option>
            ))}
          </select>

        </div>
      )}


      {/* ---------------------------------------------------
          FACILITY LOADING
      --------------------------------------------------- */}

      {facilityLoading && (
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">

          <Loader2 className="size-4 animate-spin" />

          Loading facilities...

        </div>
      )}


      {/* ---------------------------------------------------
          FACILITY ERROR
      --------------------------------------------------- */}

      {facilityError && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">

          {facilityError}

        </div>
      )}


      {!facilityLoading &&
        !facilityError &&
        !origin && (
          <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            Your facility's location isn't set up yet, so nearby facilities can't be ranked.
          </div>
        )}


      {origin && (
        <>

          {/* MAP */}

          <LocationMap
            latitude={origin.latitude}
            longitude={origin.longitude}
            facilities={rankedFacilities}
            height="300px"
          />


          {/* FACILITY LIST */}

          <div className="mt-5">

            {rankedFacilities.length === 0 && (
              <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                No nearby facility matches that specialty.
              </div>
            )}

            <div className="space-y-3">

              {rankedFacilities.map(
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
