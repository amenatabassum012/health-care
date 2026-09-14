import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

type RiskLevel = "Critical" | "High";

interface HighRiskPatient {
  id: string;
  name: string;
  age: number;
  village: string;
  condition: string;
  symptoms: string;
  risk: RiskLevel;
  lastVisit: string;
  nextAction: string;
  phone: string;
}

export default function ASHAHighRisk() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<HighRiskPatient[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("priority", "High")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading high-risk patients:", error);
      return;
    }

    setPatients(
      (data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        age: p.age ?? 0,
        village: p.village ?? "—",
        condition: p.condition ?? "Not specified",
        symptoms: p.symptoms ?? "Not provided",
        risk: (p.risk === "Critical" ? "Critical" : "High") as RiskLevel,
        lastVisit: p.last_visit ?? "Not recorded",
        nextAction: p.next_action ?? "Schedule follow-up",
        phone: p.phone ?? "",
      }))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh("patients", load);

  const filteredPatients = patients.filter((patient) => {
    const text = `${patient.name} ${patient.condition} ${patient.village}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  const criticalCount = patients.filter((patient) => patient.risk === "Critical").length;
  const highCount = patients.filter((patient) => patient.risk === "High").length;

  const callPatient = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const openPatient = (patient: HighRiskPatient) => {
    alert(
      `Patient: ${patient.name}\nCondition: ${patient.condition}\nRisk: ${patient.risk}\nNext Action: ${patient.nextAction}`
    );
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-foreground">High-Risk Patients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor patients who require urgent attention and follow-up.
        </p>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "High-Risk Patients", value: patients.length, icon: AlertTriangle, tone: "bg-coral/10 text-coral" },
          { label: "Critical", value: criticalCount, icon: Bell, tone: "bg-coral/10 text-coral" },
          { label: "High Risk", value: highCount, icon: Clock, tone: "bg-warning/10 text-warning" },
          { label: "Needs Attention Today", value: 3, icon: Calendar, tone: "bg-mint text-teal-dark" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", tone)}>
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH */}

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Patients Requiring Attention
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Prioritize these patients based on their current health risk.
          </p>
        </div>

        <div className="mb-4 flex max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 focus-within:border-teal-mid focus-within:ring-2 focus-within:ring-teal-mid/20">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patient, condition or village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* PATIENT CARDS */}

        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:grid-cols-[1.5fr_1fr_auto] lg:items-center"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-mint text-teal-dark">
                  <UserRound className="size-5" />
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{patient.name}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold",
                        patient.risk === "Critical"
                          ? "bg-coral/10 text-coral"
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {patient.risk}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {patient.age} years · {patient.village}
                  </p>

                  <strong className="mt-1.5 block text-sm font-semibold text-foreground">
                    {patient.condition}
                  </strong>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-coral">
                    <AlertTriangle className="size-3.5" />
                    {patient.symptoms}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 lg:flex-col lg:gap-2.5">
                <div>
                  <span className="block text-xs text-muted-foreground">Last Visit</span>
                  <strong className="text-sm font-semibold text-foreground">{patient.lastVisit}</strong>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Next Action</span>
                  <strong className="text-sm font-semibold text-foreground">{patient.nextAction}</strong>
                </div>
              </div>

              <div className="flex gap-2 lg:flex-col">
                <button
                  type="button"
                  onClick={() => callPatient(patient.phone)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-teal hover:bg-muted lg:flex-none"
                >
                  <Phone className="size-4" />
                  Call
                </button>

                <button
                  type="button"
                  onClick={() => openPatient(patient)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-teal px-3 py-2 text-sm font-semibold text-white hover:bg-teal-dark lg:flex-none"
                >
                  View Patient
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
              <Search className="mx-auto mb-2 size-8" />
              <h3 className="font-semibold text-foreground">No patients found</h3>
              <p className="mt-1 text-sm">Try searching with another name or condition.</p>
            </div>
          )}
        </div>
      </section>

      {/* EMERGENCY NOTICE */}

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-warning/30 bg-warning/10 p-5">
        <AlertTriangle className="size-6 shrink-0 text-warning" />

        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground">Emergency Reminder</h3>
          <p className="mt-1 text-sm text-foreground/80">
            If a patient has severe symptoms or their condition suddenly worsens, contact the PHC
            immediately or use the emergency referral process.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("PHC Rampur Emergency Contact: 040-12345678")}
          className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          Contact PHC
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
