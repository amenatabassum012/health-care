import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  AlertTriangle,
  CalendarDays,
  Clock,
  Phone,
  UserRound,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh"

type FollowUp = {
  id: string
  time: string
  patient: string
  age: number
  purpose: string
  village: string
  priority: "Normal" | "High"
  phone: string
  status: string
}

export default function ASHAFollowups() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [completedCount, setCompletedCount] = useState(0)

  const load = useCallback(async () => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from("follow_ups")
      .select("*, patients(age, village, phone, priority)")
      .gte("due_at", startOfDay.toISOString())
      .lte("due_at", endOfDay.toISOString())
      .order("due_at", { ascending: true })

    if (error) {
      console.error("Error loading follow-ups:", error)
      return
    }

    setCompletedCount((data ?? []).filter((f) => f.status === "Reached").length)

    setFollowUps(
      (data ?? []).map((f) => ({
        id: f.id,
        time: f.due_at
          ? new Date(f.due_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "—",
        patient: f.patient_name ?? f.patient_id,
        age: f.patients?.age ?? 0,
        purpose: f.risk_category ? `${f.risk_category} follow-up` : "Follow-up",
        village: f.patients?.village ?? "—",
        priority: f.patients?.priority === "High" ? "High" : "Normal",
        phone: f.patients?.phone ?? "",
        status: f.status,
      }))
    )
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtimeRefresh("follow_ups", load)

  const markReached = async (id: string) => {
    const { error } = await supabase.from("follow_ups").update({ status: "Reached" }).eq("id", id)
    if (error) console.error("Error updating follow-up:", error)
    else load()
  }

  const nextVisit = followUps.find((f) => f.status !== "Reached")?.time ?? "—"
  const highPriorityCount = followUps.filter((f) => f.priority === "High").length

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Today's Follow-ups</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage scheduled patient visits and follow-up care.
        </p>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Today's Follow-ups", value: String(followUps.length), icon: CalendarDays },
          { label: "Next Visit", value: nextVisit, icon: Clock },
          { label: "High Priority", value: String(highPriorityCount), icon: AlertTriangle },
          { label: "Completed", value: String(completedCount), icon: UserRound },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mint text-teal-dark">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FOLLOW-UP LIST */}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Scheduled Visits
          </h2>
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        <div className="space-y-3">
          {followUps.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
              <CalendarDays className="mx-auto mb-2 size-8" />
              <h3 className="font-semibold text-foreground">No follow-ups scheduled today</h3>
            </div>
          )}
          {followUps.map((followUp) => (
            <div
              key={followUp.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex min-w-20 items-center gap-1.5 text-sm font-bold text-teal">
                <Clock className="size-4" />
                {followUp.time}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{followUp.patient}</p>
                <p className="text-xs text-muted-foreground">
                  Age {followUp.age} · {followUp.village}
                </p>
                <p className="text-xs text-muted-foreground">{followUp.purpose}</p>
                {followUp.priority === "High" && (
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-coral/10 px-2.5 py-1 text-[11px] font-bold text-coral">
                    High Priority
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => markReached(followUp.id)}
                  disabled={followUp.status === "Reached"}
                  className="rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-teal-dark hover:bg-teal-mid/20 disabled:opacity-50"
                >
                  {followUp.status === "Reached" ? "Completed" : "Mark Done"}
                </button>

                <a
                  href={followUp.phone ? `tel:${followUp.phone}` : undefined}
                  title="Call patient"
                  className="flex size-9 items-center justify-center rounded-lg bg-mint text-teal-dark hover:bg-teal-mid/20"
                >
                  <Phone className="size-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CARE REMINDER */}

      <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-teal" />
        <div>
          <strong className="text-sm font-semibold text-success">Care Reminder</strong>
          <p className="mt-1 text-sm text-foreground/80">
            Complete today's follow-ups and update the patient's status after each visit.
            High-priority patients should be reviewed first.
          </p>
        </div>
      </div>

      {/* BACK */}

      <Link
        to="/asha"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}
