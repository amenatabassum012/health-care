import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  BriefcaseMedical,
  Eye,
  Phone,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import { supabase } from "@/lib/supabaseClient";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

interface ASHAPatient {
  id: string;
  name: string;
  age: number;
  phone: string;
  gender: string;
  village: string;
  address: string;
  condition: string;
  symptoms: string;
  emergencyContact: string;
  status: string;
  priority: string;
}

const STATUS_TONE: Record<string, StatusTone> = {
  New: "info",
  Stable: "completed",
  "Follow-up": "pending",
  Urgent: "emergency",
};

/* =====================================================
   DEMO PATIENT DATA
   Same patients used in the ASHA Referral page
===================================================== */

const demoPatients: ASHAPatient[] = [
  {
    id: "patient-1",
    name: "Sita Devi",
    age: 29,
    phone: "9876543210",
    gender: "Female",
    village: "Lakshmipur",
    address: "Lakshmipur Village",
    condition: "High blood pressure",
    symptoms: "High blood pressure symptoms",
    emergencyContact: "9876543211",
    status: "Urgent",
    priority: "High",
  },

  {
    id: "patient-2",
    name: "Anita Devi",
    age: 42,
    phone: "9876543220",
    gender: "Female",
    village: "Rampur Village",
    address: "Rampur Village",
    condition: "Hypertension follow-up",
    symptoms: "Needs regular blood pressure monitoring",
    emergencyContact: "9876543221",
    status: "Follow-up",
    priority: "Normal",
  },

  {
    id: "patient-3",
    name: "Mohammed Rahim",
    age: 63,
    phone: "9876543230",
    gender: "Male",
    village: "Rampur Village",
    address: "Rampur Village",
    condition: "Diabetes management",
    symptoms: "Requires diabetes monitoring",
    emergencyContact: "9876543231",
    status: "New",
    priority: "High",
  },

  {
    id: "patient-4",
    name: "Ramesh Kumar",
    age: 55,
    phone: "9876543240",
    gender: "Male",
    village: "Rampur Village",
    address: "Rampur Village",
    condition: "Diabetes monitoring",
    symptoms: "Regular diabetes monitoring required",
    emergencyContact: "9876543241",
    status: "Stable",
    priority: "Normal",
  },

  {
    id: "patient-5",
    name: "Lakshmi Rao",
    age: 51,
    phone: "9876543250",
    gender: "Female",
    village: "Lakshmipur",
    address: "Lakshmipur Village",
    condition: "General health assessment",
    symptoms: "General health assessment required",
    emergencyContact: "9876543251",
    status: "New",
    priority: "Normal",
  },
];

export default function ASHAPatients() {
  const [patients, setPatients] = useState<ASHAPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD PATIENTS
  ===================================================== */

  const loadPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error loading patients:", fetchError);
        setPatients(demoPatients);
        setError("");
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const formattedPatients: ASHAPatient[] = data.map((patient) => ({
          id: patient.id,
          name: patient.name ?? "",
          age: Number(patient.age ?? 0),
          phone: patient.phone ?? "",
          gender: patient.gender ?? "",
          village: patient.village ?? "Not provided",
          address: patient.address ?? "",
          condition: patient.condition ?? "Not specified",
          symptoms: patient.symptoms ?? "Not provided",
          emergencyContact: patient.emergency_contact ?? "",
          status: patient.status ?? "New",
          priority: patient.priority ?? "Normal",
        }));

        setPatients(formattedPatients);
      } else {
        setPatients(demoPatients);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setPatients(demoPatients);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-refresh whenever any ASHA worker registers/updates a patient elsewhere.
  useRealtimeRefresh("patients", loadPatients);

  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        patient.name.toLowerCase().includes(search) ||
        patient.village.toLowerCase().includes(search) ||
        patient.condition.toLowerCase().includes(search) ||
        patient.phone.includes(search);

      const matchesFilter =
        filter === "All" || patient.status === filter || patient.priority === filter;

      return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, filter]);

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Patients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage patients assigned to you.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/asha"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-teal hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
          <Link
            to="/asha/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-2 text-sm font-semibold text-white hover:bg-teal-dark"
          >
            <UserPlus className="size-4" />
            Register Patient
          </Link>
        </div>
      </div>

      {/* STAT CARDS */}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Patients", value: patients.length, icon: Users },
          {
            label: "High Priority",
            value: patients.filter((p) => p.priority === "High").length,
            icon: BriefcaseMedical,
          },
          {
            label: "Follow-ups",
            value: patients.filter((p) => p.status === "Follow-up").length,
            icon: Phone,
          },
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

      {/* PATIENT RECORDS */}

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Patient Records
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* SEARCH */}

        <div className="mb-3 flex max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 focus-within:border-teal-mid focus-within:ring-2 focus-within:ring-teal-mid/20">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, village, condition or phone..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* FILTERS */}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {["All", "New", "Stable", "Follow-up", "Urgent", "High"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === item
                  ? "border-teal bg-teal text-white"
                  : "border-border bg-card text-muted-foreground hover:border-teal-mid hover:text-teal"
              )}
            >
              {item}
            </button>
          ))}
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            <h3 className="font-semibold text-foreground">{error}</h3>
            <p className="mt-1 text-sm">Please check your Supabase connection and try again.</p>
          </div>
        )}

        {/* LOADING */}

        {loading && !error && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            <Users className="mx-auto mb-2 size-8" />
            <h3 className="font-semibold text-foreground">Loading patients...</h3>
            <p className="mt-1 text-sm">Please wait while we fetch patient records.</p>
          </div>
        )}

        {/* PATIENT TABLE */}

        {!loading && !error && filteredPatients.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Age / Gender</th>
                  <th className="px-4 py-3">Village</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-sm font-bold text-teal-dark">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">{patient.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {patient.age} / {patient.gender}
                    </td>
                    <td className="px-4 py-3 text-foreground">{patient.village}</td>
                    <td className="px-4 py-3 text-foreground">{patient.condition}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        tone={STATUS_TONE[patient.status] ?? "info"}
                        label={patient.status}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        title={`View ${patient.name}`}
                        onClick={() =>
                          alert(
                            `${patient.name}\n\nAge: ${patient.age}\nGender: ${patient.gender}\nVillage: ${patient.village}\nAddress: ${patient.address}\nCondition: ${patient.condition}\nSymptoms: ${patient.symptoms}\nPhone: ${patient.phone}\nEmergency Contact: ${patient.emergencyContact}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-teal hover:bg-muted"
                      >
                        <Eye className="size-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* NO PATIENTS */}

        {!loading && !error && filteredPatients.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            <Users className="mx-auto mb-2 size-8" />
            <h3 className="font-semibold text-foreground">No patients found</h3>
            <p className="mt-1 text-sm">Try changing your search or filter.</p>
            <Link
              to="/asha/register"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-2 text-sm font-semibold text-white hover:bg-teal-dark"
            >
              <UserPlus className="size-4" />
              Register New Patient
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
