import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  CalendarClock,
  Clock,
  ExternalLink,
  Hospital,
  MapPin,
  Star,
  Users,
  Video,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SpeakButton } from "@/components/shared/SpeakButton"

import { getDoctorRatingSummary, getSpecialties } from "@/lib/api/shared"
import { createAppointment } from "@/lib/api/patient"
import { supabase } from "@/lib/supabaseClient"

import { useSession } from "@/state/session"

import type {
  AppointmentType,
  DependentRelation,
  Specialty,
  StaffUser,
} from "@/types"

import { cn } from "@/lib/utils"

const RELATIONS: DependentRelation[] = [
  "Child",
  "Elder",
  "Other",
]

/* =========================================================
   FACILITY TYPE
========================================================= */

type Facility = {
  id: string

  name?: string
  facility_name?: string
  facilityName?: string

  distanceKm?: number
  distance_km?: number

  type?: string
  address?: string
  city?: string
}

/* =========================================================
   DOCTOR ROW
   Supports different possible Supabase column names.
========================================================= */

type DoctorRow = {
  id: string

  name?: string
  full_name?: string
  doctor_name?: string

  facility_id?: string
  facilityId?: string

  hospital_id?: string
  hospitalId?: string

  facility_name?: string
  hospital_name?: string

  specialty_id?: string
  specialtyId?: string

  verification_status?: string
  verificationStatus?: string

  role?: string

  qualifications?: unknown

  consultation_fee_inr?: number
  consultationFeeInr?: number

  availability?: string
}

/* =========================================================
   FACILITY NAME
========================================================= */

function getFacilityName(facility: Facility): string {
  return (
    facility.name ||
    facility.facility_name ||
    facility.facilityName ||
    "Healthcare Facility"
  )
}

/* =========================================================
   GET DOCTOR FACILITY ID
========================================================= */

function getDoctorFacilityId(row: DoctorRow): string {
  return String(
    row.facility_id ||
      row.facilityId ||
      row.hospital_id ||
      row.hospitalId ||
      "",
  ).trim()
}

/* =========================================================
   GET DOCTOR NAME
========================================================= */

function getDoctorName(row: DoctorRow): string {
  return (
    row.name ||
    row.full_name ||
    row.doctor_name ||
    "Doctor"
  )
}

/* =========================================================
   MAP SUPABASE DOCTOR TO StaffUser
========================================================= */

function mapDoctor(row: DoctorRow): StaffUser {
  const qualifications = Array.isArray(row.qualifications)
    ? row.qualifications
    : []

  const doctorFacilityId = getDoctorFacilityId(row)

  const verification =
    row.verification_status ||
    row.verificationStatus ||
    "Verified"

  const role =
    row.role ||
    "Doctor"

  return {
    id: row.id,

    name: getDoctorName(row),

    facilityId: doctorFacilityId,

    specialtyId:
      row.specialty_id ||
      row.specialtyId ||
      "",

    verificationStatus: verification,

    role,

    qualifications:
      qualifications as StaffUser["qualifications"],

    consultationFeeInr:
      row.consultation_fee_inr ??
      row.consultationFeeInr,

    availability:
      row.availability || "",
  } as StaffUser
}

/* =========================================================
   DOCTOR CARD
========================================================= */

function DoctorOption({
  doc,
  specialty,
  selected,
  onSelect,
  t,
}: {
  doc: StaffUser
  specialty?: Specialty
  selected: boolean
  onSelect: () => void
  t: (
    key: string,
    opts?: Record<string, unknown>,
  ) => string
}) {
  const { data: ratingSummary } = useQuery({
    queryKey: ["doctor-rating", doc.id],
    queryFn: () =>
      getDoctorRatingSummary(doc.id),
  })

  const topQualification =
    doc.qualifications?.[
      doc.qualifications.length - 1
    ]

  const qualificationText =
    topQualification &&
    typeof topQualification === "object" &&
    "degree" in topQualification
      ? String(
          (
            topQualification as {
              degree?: unknown
            }
          ).degree || "",
        )
      : ""

  const speakText = [
    doc.name,
    specialty?.label,

    doc.consultationFeeInr !== undefined
      ? `₹${doc.consultationFeeInr}`
      : "",

    ratingSummary?.rating !== undefined
      ? `${ratingSummary.rating} ${t(
          "patient.doctorProfile.rating",
        )}`
      : "",

    doc.availability,
  ]
    .filter(Boolean)
    .join(". ")

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSelect()
        }
      }}
      className={cn(
        "w-full cursor-pointer rounded-xl border-2 px-4 py-3 text-left transition",

        selected
          ? "border-teal bg-mint"
          : "border-border bg-card hover:border-teal/50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {doc.name}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {specialty?.label || "Doctor"}

              {qualificationText
                ? ` · ${qualificationText}`
                : ""}
            </p>
          </div>

          <SpeakButton
            text={speakText}
            size="sm"
          />
        </div>

        {doc.consultationFeeInr !==
          undefined && (
          <span className="shrink-0 text-sm font-bold text-teal-dark">
            ₹{doc.consultationFeeInr}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {ratingSummary?.rating !==
          undefined && (
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-warning text-warning" />

            <span className="font-semibold text-foreground">
              {ratingSummary.rating}
            </span>

            {ratingSummary.ratingCount !==
              undefined && (
              <span>
                ({ratingSummary.ratingCount})
              </span>
            )}
          </span>
        )}

        {doc.availability && (
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {doc.availability}
          </span>
        )}
      </div>

      <a
        href={`/patient/doctor/${doc.id}`}
        target="_blank"
        rel="noreferrer"
        onClick={(e) =>
          e.stopPropagation()
        }
        className="mt-2 flex items-center gap-1 text-xs font-medium text-teal hover:underline"
      >
        {t(
          "patient.booking.viewProfile",
        )}

        <ExternalLink className="size-3" />
      </a>
    </div>
  )
}

/* =========================================================
   BOOKING PAGE
========================================================= */

export function BookingPage() {
  const { t } = useTranslation()

  const { patient } = useSession()

  const queryClient = useQueryClient()

  const [type, setType] =
    useState<AppointmentType>("InPerson")

  const [facilityId, setFacilityId] =
    useState<string | null>(null)

  const [doctorId, setDoctorId] =
    useState<string | null>(null)

  const [bookedForName, setBookedForName] =
    useState("")

  const [
    bookedForRelation,
    setBookedForRelation,
  ] =
    useState<DependentRelation>("Child")

  /* =========================================================
     LOAD FACILITIES
  ========================================================= */

  const {
    data: facilities,
    isLoading: facilitiesLoading,
    error: facilitiesError,
  } = useQuery({
    queryKey: ["booking-facilities"],

    queryFn: async (): Promise<Facility[]> => {
      const {
        data,
        error,
      } = await supabase
        .from("facilities")
        .select("*")

      if (error) {
        console.error(
          "❌ FACILITIES ERROR:",
          error,
        )

        throw error
      }

      console.log(
        "🏥 FACILITIES FROM SUPABASE:",
        data,
      )

      return (data || []) as Facility[]
    },
  })

  /* =========================================================
     LOAD SPECIALTIES
  ========================================================= */

  const {
    data: specialties,
  } = useQuery({
    queryKey: ["specialties"],
    queryFn: getSpecialties,
  })

  /* =========================================================
     LOAD DOCTORS
  ========================================================= */

  const {
    data: doctors,
    isLoading: doctorsLoading,
    error: doctorsError,
  } = useQuery({
    queryKey: ["booking-doctors"],

    queryFn: async (): Promise<StaffUser[]> => {
      const {
        data,
        error,
      } = await supabase
        .from("doctors")
        .select("*")

      if (error) {
        console.error(
          "❌ DOCTORS ERROR:",
          error,
        )

        throw error
      }

      console.log(
        "👨‍⚕️ RAW DOCTORS FROM SUPABASE:",
        data,
      )

      const rows =
        (data || []) as DoctorRow[]

      rows.forEach((row) => {
        console.log(
          "👨‍⚕️ DOCTOR:",
          {
            id: row.id,
            name: getDoctorName(row),
            facilityId:
              getDoctorFacilityId(row),
            role: row.role,
            verification:
              row.verification_status ||
              row.verificationStatus,
            specialty:
              row.specialty_id ||
              row.specialtyId,
          },
        )
      })

      const mappedDoctors =
        rows.map(mapDoctor)

      console.log(
        "👨‍⚕️ MAPPED DOCTORS:",
        mappedDoctors,
      )

      return mappedDoctors
    },

    staleTime: 0,
  })

  /* =========================================================
     REALTIME DOCTOR UPDATES
  ========================================================= */

  useEffect(() => {
    const channel = supabase
      .channel(
        "booking-doctors-realtime",
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "doctors",
        },
        (payload) => {
          console.log(
            "🔥 LIVE DOCTOR UPDATE:",
            payload,
          )

          queryClient.invalidateQueries({
            queryKey: [
              "booking-doctors",
            ],
          })
        },
      )
      .subscribe((status) => {
        console.log(
          "📡 Doctor Realtime:",
          status,
        )
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  /* =========================================================
     SELECTED HOSPITAL
  ========================================================= */

  const selectedFacility =
    facilities?.find(
      (facility) =>
        facility.id === facilityId,
    )

  /* =========================================================
     DOCTORS FOR SELECTED HOSPITAL
  ========================================================= */

  const availableDoctors =
    doctors?.filter((doctor) => {
      if (!facilityId) {
        return false
      }

      const selectedHospitalId =
        String(facilityId).trim()

      const doctorHospitalId =
        String(
          doctor.facilityId || "",
        ).trim()

      const sameHospital =
        doctorHospitalId ===
        selectedHospitalId

      if (!sameHospital) {
        return false
      }

      /*
       * IMPORTANT:
       *
       * Do NOT require verification === "Verified".
       * Some Supabase doctor rows may not have a
       * verification_status column/value.
       */

      const role = String(
        doctor.role || "Doctor",
      )
        .trim()
        .toLowerCase()

      /*
       * If role exists, allow Doctor/Specialist.
       * If role is missing, mapDoctor already
       * defaults it to Doctor.
       */

      const isDoctor =
        role === "doctor" ||
        role === "specialist" ||
        role === "physician"

      return isDoctor
    }) || []

  /* =========================================================
     DEBUG INFORMATION
  ========================================================= */

  useEffect(() => {
    console.log(
      "================================",
    )

    console.log(
      "🏥 SELECTED HOSPITAL ID:",
      facilityId,
    )

    console.log(
      "🏥 SELECTED HOSPITAL:",
      selectedFacility,
    )

    console.log(
      "👨‍⚕️ ALL DOCTORS:",
      doctors,
    )

    console.log(
      "👨‍⚕️ DOCTORS FOR SELECTED HOSPITAL:",
      availableDoctors,
    )

    console.log(
      "================================",
    )
  }, [
    facilityId,
    selectedFacility,
    doctors,
    availableDoctors,
  ])

  /* =========================================================
     CREATE APPOINTMENT
  ========================================================= */

  const bookMutation = useMutation({
    mutationFn: () => {
      if (!patient?.id) {
        throw new Error(
          "Patient is not logged in.",
        )
      }

      if (!facilityId) {
        throw new Error(
          "Please select a hospital.",
        )
      }

      return createAppointment(
        patient.id,
        facilityId,
        type,
        doctorId ?? undefined,
        patient?.isGuardianManaged &&
          bookedForName
          ? {
              name: bookedForName,
              relation:
                bookedForRelation,
            }
          : undefined,
      )
    },
  })

  /* =========================================================
     SUCCESS SCREEN
  ========================================================= */

  if (bookMutation.isSuccess) {
    const appt =
      bookMutation.data

    return (
      <div className="flex flex-col items-center px-1 py-10 text-center">
        <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-success/15 text-success">
          <CalendarClock className="size-8" />
        </span>

        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            {t(
              "patient.booking.booked",
            )}
          </h1>

          <SpeakButton
            autoPlay
            text={`${t(
              "patient.booking.booked",
            )}. ${t(
              "patient.booking.queuePosition",
            )} ${
              appt.queuePosition
            }. ${t(
              "patient.booking.estimatedWait",
            )}: ${
              appt.estimatedWaitMinutes
            } ${t(
              "patient.booking.minutes",
            )}`}
          />
        </div>

        {appt.bookedForName && (
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "patient.booking.bookedFor.summary",
              {
                name:
                  appt.bookedForName,

                relation: t(
                  `patient.booking.bookedFor.${appt.bookedForRelation?.toLowerCase()}`,
                ),
              },
            )}
          </p>
        )}

        <div className="mt-6 w-full max-w-xs rounded-2xl border border-teal/30 bg-mint/60 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-dark">
            {t(
              "patient.booking.queuePosition",
            )}
          </p>

          <p className="mt-1 text-5xl font-extrabold text-teal-dark">
            #{appt.queuePosition}
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            {t(
              "patient.booking.estimatedWait",
            )}
            :{" "}
            {
              appt.estimatedWaitMinutes
            }{" "}
            {t(
              "patient.booking.minutes",
            )}
          </p>
        </div>
      </div>
    )
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        {t(
          "patient.booking.title",
        )}
      </h1>

      {/* =====================================================
          APPOINTMENT TYPE
      ===================================================== */}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() =>
            setType("InPerson")
          }
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 p-4",

            type === "InPerson"
              ? "border-teal bg-mint"
              : "border-border bg-card",
          )}
        >
          <Hospital className="size-6 text-teal-dark" />

          <span className="text-sm font-semibold">
            {t(
              "patient.booking.inPerson",
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setType("Teleconsult")
          }
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 p-4",

            type === "Teleconsult"
              ? "border-teal bg-mint"
              : "border-border bg-card",
          )}
        >
          <Video className="size-6 text-teal-dark" />

          <span className="text-sm font-semibold">
            {t(
              "patient.booking.teleconsult",
            )}
          </span>
        </button>
      </div>

      {/* =====================================================
          CHOOSE HOSPITAL
      ===================================================== */}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {t(
              "patient.booking.chooseFacility",
            )}
          </p>

          <SpeakButton
            autoPlay
            text={t(
              "patient.booking.chooseFacility",
            )}
            size="sm"
          />
        </div>

        {facilitiesLoading && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Loading hospitals...
          </div>
        )}

        {facilitiesError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Unable to load hospitals.
            Please check your Supabase
            connection.
          </div>
        )}

        <div className="space-y-2.5">
          {facilities?.map(
            (facility) => {
              const name =
                getFacilityName(
                  facility,
                )

              const distance =
                facility.distanceKm ??
                facility.distance_km

              return (
                <div
                  key={facility.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    console.log(
                      "🏥 HOSPITAL SELECTED:",
                      name,
                      facility.id,
                    )

                    setFacilityId(
                      facility.id,
                    )

                    setDoctorId(null)
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      setFacilityId(
                        facility.id,
                      )

                      setDoctorId(null)
                    }
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3 text-left",

                    facilityId ===
                      facility.id
                      ? "border-teal bg-mint"
                      : "border-border bg-card",
                  )}
                >
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {name}
                    </span>

                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />

                      {distance !==
                      undefined
                        ? `${distance} ${t(
                            "common.km",
                          )}`
                        : facility.city ||
                          facility.address ||
                          "Location available"}
                    </span>
                  </span>

                  <SpeakButton
                    text={`${name}. ${
                      distance !==
                      undefined
                        ? `${distance} ${t(
                            "common.km",
                          )}`
                        : ""
                    }`}
                    size="sm"
                  />
                </div>
              )
            },
          )}
        </div>
      </div>

      {/* =====================================================
          DOCTORS
      ===================================================== */}

      {facilityId && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {t(
                "patient.booking.chooseDoctor",
              )}
            </p>

            <SpeakButton
              autoPlay
              text={t(
                "patient.booking.chooseDoctor",
              )}
              size="sm"
            />
          </div>

          {/* SELECTED HOSPITAL */}

          {selectedFacility && (
            <div className="mb-3 rounded-xl border border-teal/30 bg-mint/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Selected hospital
              </p>

              <p className="text-sm font-semibold text-teal-dark">
                {getFacilityName(
                  selectedFacility,
                )}
              </p>
            </div>
          )}

          <div className="space-y-2.5">
            {/* ANY DOCTOR */}

            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                setDoctorId(null)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setDoctorId(null)
                }
              }}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left",

                doctorId === null
                  ? "border-teal bg-mint"
                  : "border-border bg-card",
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Users className="size-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  {t(
                    "patient.booking.anyDoctor",
                  )}
                </span>

                <span className="block text-xs text-muted-foreground">
                  {t(
                    "patient.booking.anyDoctorDesc",
                  )}
                </span>
              </span>

              <SpeakButton
                text={`${t(
                  "patient.booking.anyDoctor",
                )}. ${t(
                  "patient.booking.anyDoctorDesc",
                )}`}
                size="sm"
              />
            </div>

            {/* LOADING */}

            {doctorsLoading && (
              <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
                Loading doctors...
              </div>
            )}

            {/* ERROR */}

            {doctorsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
                Unable to load doctors.
                Please check your Supabase
                doctors table.
              </div>
            )}

            {/* DOCTOR LIST */}

            {!doctorsLoading &&
              !doctorsError &&
              availableDoctors.map(
                (doc) => (
                  <DoctorOption
                    key={doc.id}
                    doc={doc}
                    specialty={specialties?.find(
                      (specialty) =>
                        specialty.id ===
                        doc.specialtyId,
                    )}
                    selected={
                      doctorId === doc.id
                    }
                    onSelect={() =>
                      setDoctorId(
                        doc.id,
                      )
                    }
                    t={t}
                  />
                ),
              )}

            {/* NO DOCTORS */}

            {!doctorsLoading &&
              !doctorsError &&
              availableDoctors.length ===
                0 && (
                <div className="rounded-xl border border-dashed border-border p-4 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    No doctors available
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    There are currently no
                    doctors linked to this
                    hospital.
                  </p>

                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Check the browser
                    console for the
                    doctor facility IDs.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* =====================================================
          BOOK FOR SOMEONE ELSE
      ===================================================== */}

      {patient?.isGuardianManaged && (
        <div className="space-y-3 rounded-2xl border border-teal/30 bg-mint/40 p-4">
          <p className="text-sm font-semibold text-foreground">
            {t(
              "patient.booking.bookedFor.title",
            )}
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs">
              {t(
                "patient.booking.bookedFor.name",
              )}
            </Label>

            <Input
              value={bookedForName}
              onChange={(e) =>
                setBookedForName(
                  e.target.value,
                )
              }
              placeholder={t(
                "patient.booking.bookedFor.namePlaceholder",
              )}
              className="h-11 bg-background"
            />
          </div>

          <div className="flex gap-2">
            {RELATIONS.map(
              (relation) => (
                <button
                  key={relation}
                  type="button"
                  onClick={() =>
                    setBookedForRelation(
                      relation,
                    )
                  }
                  className={cn(
                    "flex-1 rounded-lg border-2 py-2 text-xs font-medium",

                    bookedForRelation ===
                      relation
                      ? "border-teal bg-teal text-white"
                      : "border-border bg-background text-foreground",
                  )}
                >
                  {t(
                    `patient.booking.bookedFor.${relation.toLowerCase()}`,
                  )}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          BOOKING ERROR
      ===================================================== */}

      {bookMutation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {bookMutation.error instanceof
          Error
            ? bookMutation.error.message
            : "Unable to book appointment. Please try again."}
        </div>
      )}

      {/* =====================================================
          CONFIRM BOOKING
      ===================================================== */}

      <Button
        size="xl"
        className="w-full bg-teal text-white hover:bg-teal-dark"
        disabled={
          !facilityId ||
          (patient?.isGuardianManaged &&
            !bookedForName) ||
          bookMutation.isPending
        }
        onClick={() =>
          bookMutation.mutate()
        }
      >
        {bookMutation.isPending
          ? t("common.loading")
          : t(
              "patient.booking.confirm",
            )}
      </Button>
    </div>
  )
}