import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Hospital,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

type Referral = {
  id: string;
  patient: string;
  age: number;
  village: string;
  condition: string;
  referredTo: string;
  date: string;
  status: "Pending" | "Confirmed" | "Completed";
  priority: "Normal" | "High";
};

const STATUS_TONE: Record<Referral["status"], StatusTone> = {
  Pending: "pending",
  Confirmed: "confirmed",
  Completed: "completed",
};

export default function ASHAReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("referrals")
      .select("*, patients(age, village), facilities:to_facility_id(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading referrals:", error);
      return;
    }

    setReferrals(
      (data ?? []).map((r: any) => ({
        id: r.id,
        patient: r.patient_name ?? r.patient_id,
        age: r.patients?.age ?? 0,
        village: r.patients?.village ?? "—",
        condition: r.structured_summary ?? "Not specified",
        referredTo: r.facilities?.name ?? r.to_facility_id,
        date: r.created_at ? new Date(r.created_at).toLocaleString() : "—",
        status: r.status,
        priority: r.urgency === "Critical" || r.urgency === "Urgent" ? "High" : "Normal",
      }))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh("referrals", load);

  const pendingCount = referrals.filter((referral) => referral.status === "Pending").length;
  const urgentCount = referrals.filter((referral) => referral.priority === "High").length;
  const completedCount = referrals.filter((referral) => referral.status === "Completed").length;

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Referrals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track patient referrals and their healthcare journey.
        </p>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Referrals", value: referrals.length, icon: ArrowRight },
          { label: "Pending", value: pendingCount, icon: Clock },
          { label: "Urgent", value: urgentCount, icon: AlertTriangle },
          { label: "Completed", value: completedCount, icon: CheckCircle2 },
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

      {/* REFERRAL LIST */}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Patient Referrals
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Monitor referrals from your assigned villages.
            </p>
          </div>

          <Link to="/asha/register" className="text-xs font-semibold text-teal hover:underline">
            Register Patient →
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Referred To</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => (
                <tr key={referral.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-teal-dark">
                        <UserRound className="size-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{referral.patient}</p>
                        <p className="text-xs text-muted-foreground">
                          {referral.age} years · {referral.village}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{referral.condition}</p>
                    {referral.priority === "High" && (
                      <span className="mt-1 block text-[11px] font-bold text-coral">High Priority</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Hospital className="size-4 shrink-0 text-teal" />
                      {referral.referredTo}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">{referral.date}</td>

                  <td className="px-4 py-3">
                    <StatusBadge tone={STATUS_TONE[referral.status]} label={referral.status} />
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => alert(`Referral details for ${referral.patient}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-teal hover:bg-muted"
                    >
                      View
                      <ArrowRight className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FACILITY CONTACT */}

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mint text-teal-dark">
          <Building2 className="size-6" />
        </span>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">Rampur Primary Health Centre</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            For urgent referrals, contact the PHC before sending the patient.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-teal" />
              040-12345678
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-teal" />
              Rampur Village
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert("Calling Rampur Primary Health Centre...")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          <Phone className="size-4" />
          Call PHC
        </button>
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
  );
}
