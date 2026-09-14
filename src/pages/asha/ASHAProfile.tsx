import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BriefcaseMedical,
  Building2,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useSession } from "@/state/session";
import { supabase } from "@/lib/supabaseClient";
import { getFacilities } from "@/lib/api/shared";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-mint text-teal-dark">
        <Icon className="size-4" />
      </span>
      <div>
        <span className="block text-xs text-muted-foreground">{label}</span>
        <strong className="text-sm font-semibold text-foreground">{value}</strong>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-mint text-teal-dark">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export default function ASHAProfile() {
  const { staff } = useSession();
  const [facilityName, setFacilityName] = useState("—");
  const [summary, setSummary] = useState({
    assignedPatients: 0,
    patientsServed: 0,
    referralsCompleted: 0,
    followUpRate: 0,
  });

  const load = useCallback(async () => {
    const [
      { count: assignedPatients },
      { count: patientsServed },
      { count: referralsCompleted },
      { data: followUps },
    ] = await Promise.all([
      supabase.from("patients").select("*", { count: "exact", head: true }),
      supabase.from("patients").select("*", { count: "exact", head: true }).in("status", ["Stable", "Follow-up"]),
      supabase.from("referrals").select("*", { count: "exact", head: true }).eq("status", "Completed"),
      supabase.from("follow_ups").select("status"),
    ]);

    const reached = (followUps ?? []).filter((f) => f.status === "Reached").length;
    const followUpRate = followUps?.length ? Math.round((reached / followUps.length) * 100) : 0;

    setSummary({
      assignedPatients: assignedPatients ?? 0,
      patientsServed: patientsServed ?? 0,
      referralsCompleted: referralsCompleted ?? 0,
      followUpRate,
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh("patients", load);
  useRealtimeRefresh("referrals", load);
  useRealtimeRefresh("follow_ups", load);

  useEffect(() => {
    if (!staff?.facilityId) return;
    getFacilities().then((facilities) => {
      const facility = facilities.find((f) => f.id === staff.facilityId);
      if (facility) setFacilityName(facility.name);
    });
  }, [staff?.facilityId]);

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your ASHA worker information and details.
        </p>
      </div>

      <Link
        to="/asha"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      {/* PROFILE HERO CARD */}

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-mint text-2xl font-bold text-teal-dark">
            {staff?.name?.charAt(0).toUpperCase() ?? "A"}
          </span>

          <div>
            <h2 className="text-xl font-bold text-foreground">{staff?.name ?? "ASHA Worker"}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <BriefcaseMedical className="size-4 text-teal" />
              ASHA Worker
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 text-teal" />
              {facilityName}
            </p>
          </div>
        </div>
      </section>

      {/* PERSONAL INFORMATION */}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <SectionHeading
          icon={UserRound}
          title="Personal Information"
          subtitle="Your basic contact information."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={User} label="Full Name" value={staff?.name ?? "—"} />
          <InfoItem icon={BriefcaseMedical} label="Role" value="ASHA Worker" />
          <InfoItem icon={Phone} label="Phone Number" value={staff?.phone ?? "—"} />
          <InfoItem icon={Mail} label="Email Address" value={staff?.email ?? "—"} />
        </div>
      </section>

      {/* WORK INFORMATION */}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <SectionHeading
          icon={Building2}
          title="Work Information"
          subtitle="Details about your healthcare service area."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={Building2} label="Assigned PHC" value={facilityName} />
          <InfoItem icon={CalendarDays} label="Verification Status" value={staff?.verificationStatus ?? "—"} />
        </div>
      </section>

      {/* WORK SUMMARY */}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <SectionHeading
          icon={Activity}
          title="My Work Summary"
          subtitle="Overview of your healthcare activities."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, value: String(summary.assignedPatients), label: "Assigned Patients" },
            { icon: UserRound, value: String(summary.patientsServed), label: "Patients Served" },
            { icon: CheckCircle2, value: String(summary.referralsCompleted), label: "Referrals Completed" },
            { icon: Activity, value: `${summary.followUpRate}%`, label: "Follow-up Rate" },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-muted/40 p-4 transition-transform hover:-translate-y-0.5"
            >
              <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-mint text-teal-dark">
                <Icon className="size-5" />
              </span>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
