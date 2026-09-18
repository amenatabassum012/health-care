import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  GitBranch,
  Hospital,
  MapPin,
  Stethoscope,
} from "lucide-react"

import { supabase } from "@/lib/supabaseClient"

type Referral = {
  id: string
  patient_id?: string
  from_facility_id?: string
  to_facility_id?: string
  from_facility_name?: string
  to_facility_name?: string
  type?: string
  reason?: string
  status?: string
  created_at?: string
  updated_at?: string
}

const TYPE_ICON = {
  Hospital: Hospital,
  Doctor: Stethoscope,
  Specialist: Stethoscope,
  Facility: Hospital,
  default: GitBranch,
} as const

function getReferralType(referral: Referral) {
  const type = String(referral.type ?? "").trim()

  if (type in TYPE_ICON) {
    return type as keyof typeof TYPE_ICON
  }

  return "default"
}

function getStatusIcon(status?: string) {
  const value = String(status ?? "").toLowerCase()

  if (
    value === "completed" ||
    value === "confirmed" ||
    value === "accepted"
  ) {
    return CheckCircle2
  }

  return Clock3
}

function getStatusClass(status?: string) {
  const value = String(status ?? "").toLowerCase()

  if (
    value === "completed" ||
    value === "confirmed" ||
    value === "accepted"
  ) {
    return "bg-green-100 text-green-700"
  }

  if (
    value === "rejected" ||
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "bg-red-100 text-red-700"
  }

  return "bg-yellow-100 text-yellow-700"
}

export function ReferralPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadReferrals() {
    try {
      setError("")

      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .limit(1)
        .maybeSingle()

      if (!patient) {
        setReferrals([])
        return
      }

      const { data, error: referralError } =
        await supabase
          .from("referrals")
          .select("*")
          .eq("patient_id", patient.id)
          .order("created_at", {
            ascending: false,
          })

      if (referralError) {
        throw referralError
      }

      setReferrals(data ?? [])
    } catch (err) {
      console.error(
        "Failed to load referrals:",
        err,
      )

      setError(
        "Unable to load referral information.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReferrals()

    const channel = supabase
      .channel("patient-referrals-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "referrals",
        },
        async (payload) => {
          console.log(
            "🔥 LIVE REFERRAL UPDATE:",
            payload,
          )

          await loadReferrals()
        },
      )
      .subscribe((status) => {
        console.log(
          "📡 Referral Realtime:",
          status,
        )
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        {/* Header */}

        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/patient"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition hover:bg-muted"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Referrals
            </h1>

            <p className="text-sm text-muted-foreground">
              Track your healthcare referrals
            </p>
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Loading referrals...
            </p>
          </div>
        )}

        {/* Empty */}

        {!loading && referrals.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <GitBranch className="mx-auto mb-3 size-10 text-muted-foreground" />

            <h2 className="mb-1 text-lg font-semibold text-foreground">
              No referrals yet
            </h2>

            <p className="text-sm text-muted-foreground">
              Your referrals will appear here when
              they are created.
            </p>
          </div>
        )}

        {/* Referrals */}

        {!loading && referrals.length > 0 && (
          <div className="space-y-4">
            {referrals.map((r) => {
              const type =
                getReferralType(r)

              const Icon =
                TYPE_ICON[type]

              const StatusIcon =
                getStatusIcon(r.status)

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  {/* Top */}

                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-teal/10 text-teal">
                        <Icon className="size-5" />
                      </div>

                      <div>
                        <h2 className="font-semibold text-foreground">
                          {r.type ||
                            "Healthcare Referral"}
                        </h2>

                        {r.created_at && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              r.created_at,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        r.status,
                      )}`}
                    >
                      <StatusIcon className="size-3.5" />

                      {r.status ||
                        "Pending"}
                    </div>
                  </div>

                  {/* Reason */}

                  {r.reason && (
                    <div className="mb-4 rounded-xl bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Reason
                      </p>

                      <p className="mt-1 text-sm text-foreground">
                        {r.reason}
                      </p>
                    </div>
                  )}

                  {/* From / To */}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border p-3">
                      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        Referred from
                      </div>

                      <p className="text-sm font-medium text-foreground">
                        {r.from_facility_name ||
                          r.from_facility_id ||
                          "Primary facility"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border p-3">
                      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Hospital className="size-3.5" />
                        Referred to
                      </div>

                      <p className="text-sm font-medium text-foreground">
                        {r.to_facility_name ||
                          r.to_facility_id ||
                          "Specialist facility"}
                      </p>
                    </div>
                  </div>

                  {/* Updated */}

                  {r.updated_at && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" />

                      Last updated{" "}
                      {new Date(
                        r.updated_at,
                      ).toLocaleString()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}