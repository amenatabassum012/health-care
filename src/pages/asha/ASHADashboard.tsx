import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Clock,
  Hospital,
  UserPlus,
  Users,
} from "lucide-react"

import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import NearbyHealthcare from "@/components/location/NearbyHealthcare"
import { supabase } from "@/lib/supabaseClient"
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh"

const STATUS_TONE: Record<string, StatusTone> = {
  "Follow-up": "pending",
  Stable: "completed",
  Urgent: "emergency",
  New: "info",
}

interface RecentPatient {
  id: string
  name: string
  age: number
  village: string
  status: string
}

interface TodayFollowUp {
  id: string
  time: string
  name: string
  reason: string
  to: string
}

export function ASHADashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaysVisits: 0,
    pendingFollowUps: 0,
    highRisk: 0,
  })
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([])
  const [todaysFollowUps, setTodaysFollowUps] = useState<TodayFollowUp[]>([])

  const load = useCallback(async () => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const [
      { count: totalPatients },
      { count: pendingFollowUps },
      { count: highRisk },
      { data: recent },
      { data: dueToday },
    ] = await Promise.all([
      supabase.from("patients").select("*", { count: "exact", head: true }),
      supabase.from("follow_ups").select("*", { count: "exact", head: true }).eq("status", "Pending"),
      supabase.from("patients").select("*", { count: "exact", head: true }).eq("priority", "High"),
      supabase.from("patients").select("*").order("created_at", { ascending: false }).limit(4),
      supabase
        .from("follow_ups")
        .select("*")
        .gte("due_at", startOfDay.toISOString())
        .lte("due_at", endOfDay.toISOString())
        .order("due_at", { ascending: true })
        .limit(3),
    ])

    setStats({
      totalPatients: totalPatients ?? 0,
      todaysVisits: dueToday?.length ?? 0,
      pendingFollowUps: pendingFollowUps ?? 0,
      highRisk: highRisk ?? 0,
    })

    setRecentPatients(
      (recent ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        age: p.age ?? 0,
        village: p.village ?? "—",
        status: p.status ?? "New",
      }))
    )

    setTodaysFollowUps(
      (dueToday ?? []).map((f) => ({
        id: f.id,
        time: f.due_at
          ? new Date(f.due_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "—",
        name: f.patient_name ?? f.patient_id,
        reason: f.risk_category ? `${f.risk_category} follow-up` : "Follow-up",
        to: f.risk_category === "Chronic" || f.risk_category === "Maternal" ? "/asha/high-risk" : "/asha/followups",
      }))
    )
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtimeRefresh("patients", load)
  useRealtimeRefresh("follow_ups", load)

  return (
    <div className="space-y-8">

      {/* ===================================================
          PAGE TITLE
      =================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good Morning, ASHA Worker 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is today's healthcare overview.
        </p>
      </div>


      {/* ===================================================
          LOCATION & NEARBY HEALTHCARE
      =================================================== */}

      <NearbyHealthcare role="asha" userId={null} />


      {/* ===================================================
          STATISTICS
      =================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {[
          { label: "Assigned Patients", value: stats.totalPatients, icon: Users },
          { label: "Today's Visits", value: stats.todaysVisits, icon: CalendarDays },
          { label: "Pending Follow-ups", value: stats.pendingFollowUps, icon: ClipboardList },
          { label: "High-Risk Patients", value: stats.highRisk, icon: AlertTriangle },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5"
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

      </section>


      {/* ===================================================
          QUICK ACTIONS
      =================================================== */}

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Quick Actions
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: "/asha/patients", icon: Users, label: "My Patients" },
            { to: "/asha/register", icon: UserPlus, label: "Register Patient" },
            { to: "/asha/followups", icon: ClipboardList, label: "Follow-ups" },
            { to: "/asha/referrals", icon: Hospital, label: "Referrals" },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm font-semibold text-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:border-teal-mid/40"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-mint text-teal-dark">
                <Icon className="size-4" />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </section>


      {/* ===================================================
          RECENT PATIENTS
      =================================================== */}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Recent Patients
          </h2>
          <Link to="/asha/patients" className="text-xs font-semibold text-teal hover:underline">
            View All
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {recentPatients.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No patients registered yet.
            </p>
          )}
          {recentPatients.map((patient, i) => (
            <div
              key={patient.id}
              className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                i !== 0 ? "border-t border-border" : ""
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{patient.name}</p>
                <p className="text-xs text-muted-foreground">
                  {patient.age} yrs · {patient.village}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge tone={STATUS_TONE[patient.status] ?? "info"} label={patient.status} />
                <Link
                  to="/asha/patients"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-teal hover:bg-muted"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ===================================================
          TODAY'S FOLLOW-UPS
      =================================================== */}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Today's Follow-ups
          </h2>
          <Link to="/asha/followups" className="text-xs font-semibold text-teal hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {todaysFollowUps.length === 0 && (
            <p className="rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
              No follow-ups scheduled for today.
            </p>
          )}
          {todaysFollowUps.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex min-w-20 items-center gap-1.5 text-sm font-bold text-teal">
                <Clock className="size-4" />
                {item.time}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.reason}</p>
              </div>

              <Link
                to={item.to}
                className="rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-teal-dark hover:bg-teal-mid/20"
              >
                Open
              </Link>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

export default ASHADashboard
