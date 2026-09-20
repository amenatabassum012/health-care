import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { UserRound, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { supabase } from "@/lib/supabaseClient"
import { useSession } from "@/state/session"
import type { Patient } from "@/types"

/* =========================================================
   PROFILE TYPE

   This is separate from the global Patient type because
   Patient does not contain age or symptoms.
========================================================= */

type PatientProfile = {
  id: string
  name?: string | null
  age?: number | null
  gender?: Patient["gender"] | null
  phone?: string | null
  symptoms?: string | null
}

/* =========================================================
   PATIENT PROFILE PAGE
========================================================= */

export function PatientProfilePage() {
  const { t } = useTranslation()

  const {
    patient: sessionPatient,
    setPatient,
  } = useSession()

  const queryClient = useQueryClient()

  /* =======================================================
     LOAD PATIENT PROFILE
  ======================================================= */

  const {
    data: profile,
    isLoading,
    error: profileError,
  } = useQuery<PatientProfile | null>({
    queryKey: [
      "patient-profile",
      sessionPatient?.id,
    ],

    queryFn: async () => {
      if (!sessionPatient?.id) {
        return null
      }

      const {
        data,
        error,
      } = await supabase
        .from("patients")
        .select(
          "id, name, age, gender, phone, symptoms",
        )
        .eq("id", sessionPatient.id)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!data) {
        return null
      }

      return {
        id: data.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        symptoms: data.symptoms,
      }
    },

    enabled: !!sessionPatient?.id,

    initialData: sessionPatient
      ? {
          id: sessionPatient.id,
          name: sessionPatient.name,
          gender: sessionPatient.gender,
          phone: sessionPatient.phone,
          age: null,
          symptoms: null,
        }
      : undefined,
  })

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] =
    useState<Patient["gender"] | undefined>(
      undefined,
    )
  const [phone, setPhone] = useState("")
  const [symptoms, setSymptoms] = useState("")

  /* =======================================================
     LOAD PROFILE INTO FORM
  ======================================================= */

  useEffect(() => {
    if (!profile) {
      return
    }

    setName(profile.name ?? "")

    setAge(
      profile.age !== null &&
        profile.age !== undefined
        ? String(profile.age)
        : "",
    )

    setGender(
      profile.gender ?? undefined,
    )

    setPhone(
      profile.phone ?? "",
    )

    setSymptoms(
      profile.symptoms ?? "",
    )
  }, [profile])

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sessionPatient?.id) {
        throw new Error(
          "Patient session not found",
        )
      }

      /* -----------------------------------------------
         Validate age
      ------------------------------------------------ */

      const numericAge =
        age.trim() !== ""
          ? Number(age)
          : null

      if (
        numericAge !== null &&
        (!Number.isFinite(numericAge) ||
          numericAge < 0 ||
          numericAge > 120)
      ) {
        throw new Error(
          "Please enter a valid age",
        )
      }

      /* -----------------------------------------------
         Update Supabase
      ------------------------------------------------ */

      const {
        data,
        error,
      } = await supabase
        .from("patients")
        .update({
          name: name.trim(),
          age: numericAge,
          gender: gender ?? null,
          phone: phone.trim(),
          symptoms:
            symptoms.trim() || null,
        })
        .eq("id", sessionPatient.id)
        .select(
          "id, name, age, gender, phone, symptoms",
        )
        .single()

      if (error) {
        throw error
      }

      return data as PatientProfile
    },

    /* =====================================================
       SUCCESS
    ===================================================== */

    onSuccess: async (
      updatedProfile,
    ) => {
      toast.success(
        t(
          "patient.profile.saved",
          {
            defaultValue:
              "Profile saved successfully",
          },
        ),
      )

      /*
       * IMPORTANT:
       *
       * Do NOT put age or symptoms into Patient.
       *
       * The global Patient type does not have those fields.
       */

      if (sessionPatient) {
        const updatedPatient: Patient = {
          ...sessionPatient,

          id: updatedProfile.id,

          name:
            updatedProfile.name ??
            sessionPatient.name,

          phone:
            updatedProfile.phone ??
            sessionPatient.phone,

          gender:
            updatedProfile.gender ??
            sessionPatient.gender,
        }

        setPatient(updatedPatient)
      }

      await queryClient.invalidateQueries({
        queryKey: [
          "patient-profile",
          sessionPatient?.id,
        ],
      })
    },

    /* =====================================================
       ERROR
    ===================================================== */

    onError: (error) => {
      console.error(
        "Failed to save patient profile:",
        error,
      )

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save profile",
      )
    },
  })

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    )
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (profileError) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            Unable to load your profile.
          </p>

          <p className="mt-1 text-xs text-red-600">
            {profileError instanceof Error
              ? profileError.message
              : "Please try again."}
          </p>
        </div>
      </div>
    )
  }

  /* =======================================================
     NO SESSION
  ======================================================= */

  if (!sessionPatient) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Patient information is not available.
        </p>
      </div>
    )
  }

  /* =======================================================
     PAGE UI
  ======================================================= */

  return (
    <div className="space-y-6 pb-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
          <UserRound className="size-6" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Patient Profile
          </h1>

          <p className="text-sm text-muted-foreground">
            Update your personal information
          </p>
        </div>
      </div>

      {/* =================================================
          PROFILE FORM
      ================================================= */}

      <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">

        {/* NAME */}

        <div className="space-y-2">
          <Label htmlFor="patient-name">
            Name
          </Label>

          <Input
            id="patient-name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter your name"
          />
        </div>

        {/* AGE */}

        <div className="space-y-2">
          <Label htmlFor="patient-age">
            Age
          </Label>

          <Input
            id="patient-age"
            type="number"
            min={0}
            max={120}
            value={age}
            onChange={(event) =>
              setAge(event.target.value)
            }
            placeholder="Enter your age"
          />
        </div>

        {/* GENDER */}

        <div className="space-y-2">
          <Label>
            Gender
          </Label>

          <Select
            value={gender ?? ""}
            onValueChange={(value) =>
              setGender(
                value as Patient["gender"],
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Male">
                Male
              </SelectItem>

              <SelectItem value="Female">
                Female
              </SelectItem>

              <SelectItem value="Other">
                Other
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PHONE */}

        <div className="space-y-2">
          <Label htmlFor="patient-phone">
            Phone
          </Label>

          <Input
            id="patient-phone"
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            placeholder="Enter phone number"
          />
        </div>

        {/* SYMPTOMS */}

        <div className="space-y-2">
          <Label htmlFor="patient-symptoms">
            Symptoms / Health Information
          </Label>

          <Textarea
            id="patient-symptoms"
            value={symptoms}
            onChange={(event) =>
              setSymptoms(event.target.value)
            }
            placeholder="Describe any current symptoms or health information"
            rows={5}
          />
        </div>

        {/* SAVE */}

        <Button
          type="button"
          className="w-full bg-teal text-white hover:bg-teal-dark"
          disabled={
            saveMutation.isPending
          }
          onClick={() =>
            saveMutation.mutate()
          }
        >
          <Save className="mr-2 size-4" />

          {saveMutation.isPending
            ? "Saving..."
            : "Save Profile"}
        </Button>
      </div>
    </div>
  )
}