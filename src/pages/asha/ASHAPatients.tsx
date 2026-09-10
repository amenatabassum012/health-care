import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  BriefcaseMedical,
  Eye,
  MapPin,
  Phone,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import { supabase } from "@/lib/supabaseClient";

import "./ASHADashboard.css";

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

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      setError("");

      try {
        const { data, error: fetchError } = await supabase
          .from("patients")
          .select("*")
          .order("created_at", { ascending: false });

        /* =================================================
           IF SUPABASE HAS AN ERROR
        ================================================= */

        if (fetchError) {
          console.error("Error loading patients:", fetchError);

          /*
             Use demo patients so the ASHA portal still
             shows patient information.
          */
          setPatients(demoPatients);

          setError("");

          setLoading(false);

          return;
        }

        /* =================================================
           IF SUPABASE HAS PATIENTS
        ================================================= */

        if (data && data.length > 0) {
          const formattedPatients: ASHAPatient[] = data.map(
            (patient) => ({
              id: patient.id,
              name: patient.name ?? "",
              age: Number(patient.age ?? 0),
              phone: patient.phone ?? "",
              gender: patient.gender ?? "",
              village: patient.village ?? "Not provided",
              address: patient.address ?? "",
              condition:
                patient.condition ?? "Not specified",
              symptoms:
                patient.symptoms ?? "Not provided",
              emergencyContact:
                patient.emergency_contact ?? "",
              status: patient.status ?? "New",
              priority: patient.priority ?? "Normal",
            }),
          );

          setPatients(formattedPatients);
        } else {
          /* ===============================================
             SUPABASE TABLE EMPTY

             Show the same patients used in the referral
             section instead of showing 0 patients.
          =============================================== */

          setPatients(demoPatients);
        }
      } catch (err) {
        console.error("Unexpected error:", err);

        /*
           Fallback to demo patients.
        */
        setPatients(demoPatients);

        setError("");
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

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
        filter === "All" ||
        patient.status === filter ||
        patient.priority === filter;

      return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, filter]);

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="asha-page">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="asha-sidebar">
        <div className="asha-brand">
          <div className="asha-brand-icon">
            <BriefcaseMedical size={24} />
          </div>

          <div>
            <h2>SwasthyaSetu</h2>
            <span>ASHA Portal</span>
          </div>
        </div>

        <nav>
          <Link to="/asha">
            <span>🏠</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/asha/patients"
            className="active"
          >
            <span>👥</span>
            <span>My Patients</span>
          </Link>

          <Link to="/asha/followups">
            <span>📅</span>
            <span>Follow-ups</span>
          </Link>

          <Link to="/asha/referrals">
            <span>↗️</span>
            <span>Referrals</span>
          </Link>

          <Link to="/asha/high-risk">
            <span>⚠️</span>
            <span>High-Risk Patients</span>
          </Link>

          <Link to="/asha/register">
            <span>➕</span>
            <span>Register Patient</span>
          </Link>

          <Link to="/asha/profile">
            <span>👤</span>
            <span>My Profile</span>
          </Link>

          <Link to="/">
            <span>🚪</span>
            <span>Logout</span>
          </Link>
        </nav>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="asha-main">
        {/* HEADER */}

        <header className="asha-header">
          <div>
            <h1>My Patients</h1>

            <p>
              View and manage patients assigned to you.
            </p>
          </div>

          <div className="asha-header-profile">
            <div className="asha-profile-avatar">
              A
            </div>

            <div>
              <strong>Anitha</strong>
              <span>ASHA Worker</span>
            </div>
          </div>
        </header>

        {/* LOCATION */}

        <div className="asha-location">
          <MapPin size={18} />

          <span>
            Rampur Village | Rampur Primary Health Centre
          </span>
        </div>

        {/* =====================================================
            TOP ACTIONS
        ===================================================== */}

        <div className="asha-page-actions">
          <Link
            to="/asha"
            className="back-dashboard"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <Link
            to="/asha/register"
            className="asha-primary-button"
          >
            <UserPlus size={18} />
            Register Patient
          </Link>
        </div>

        {/* =====================================================
            STAT CARDS
        ===================================================== */}

        <div className="stats-grid">
          {/* TOTAL PATIENTS */}

          <div className="stat-card">
            <div className="stat-icon">
              <Users size={22} />
            </div>

            <div>
              <span>Total Patients</span>

              <strong>
                {patients.length}
              </strong>
            </div>
          </div>

          {/* HIGH PRIORITY */}

          <div className="stat-card">
            <div className="stat-icon">
              <BriefcaseMedical size={22} />
            </div>

            <div>
              <span>High Priority</span>

              <strong>
                {
                  patients.filter(
                    (patient) =>
                      patient.priority === "High",
                  ).length
                }
              </strong>
            </div>
          </div>

          {/* FOLLOW-UPS */}

          <div className="stat-card">
            <div className="stat-icon">
              <Phone size={22} />
            </div>

            <div>
              <span>Follow-ups</span>

              <strong>
                {
                  patients.filter(
                    (patient) =>
                      patient.status === "Follow-up",
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            SEARCH / FILTER
        ===================================================== */}

        <section className="patient-table-section">
          <div className="section-title">
            <div>
              <h2>Patient Records</h2>

              <p>
                {filteredPatients.length} patient
                {filteredPatients.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {/* SEARCH */}

          <div className="asha-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search by name, village, condition or phone..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          {/* FILTERS */}

          <div className="asha-filters">
            {[
              "All",
              "New",
              "Stable",
              "Follow-up",
              "Urgent",
              "High",
            ].map((item) => (
              <button
                key={item}
                type="button"
                className={
                  filter === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(item)
                }
              >
                {item}
              </button>
            ))}
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="asha-empty">
              <h3>{error}</h3>

              <p>
                Please check your Supabase connection
                and try again.
              </p>
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && !error && (
            <div className="asha-empty">
              <Users size={44} />

              <h3>Loading patients...</h3>

              <p>
                Please wait while we fetch patient
                records.
              </p>
            </div>
          )}

          {/* =================================================
              PATIENT TABLE
          ================================================= */}

          {!loading &&
            !error &&
            filteredPatients.length > 0 && (
              <div className="patient-table">
                {/* TABLE HEADER */}

                <div className="table-header">
                  <span>Patient</span>
                  <span>Age / Gender</span>
                  <span>Village</span>
                  <span>Condition</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>

                {/* PATIENT ROWS */}

                {filteredPatients.map(
                  (patient) => (
                    <div
                      className="patient-row"
                      key={patient.id}
                    >
                      {/* PATIENT */}

                      <div className="patient-info">
                        <div className="patient-avatar">
                          {patient.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {patient.name}
                          </strong>

                          <span>
                            {patient.phone}
                          </span>
                        </div>
                      </div>

                      {/* AGE / GENDER */}

                      <div>
                        {patient.age} /{" "}
                        {patient.gender}
                      </div>

                      {/* VILLAGE */}

                      <div>
                        {patient.village}
                      </div>

                      {/* CONDITION */}

                      <div>
                        {patient.condition}
                      </div>

                      {/* STATUS */}

                      <div>
                        <span
                          className={`status-badge ${
                            patient.status
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-",
                              )
                          }`}
                        >
                          {patient.status}
                        </span>
                      </div>

                      {/* ACTION */}

                      <div>
                        <button
                          type="button"
                          className="asha-view-button"
                          title={`View ${patient.name}`}
                          onClick={() =>
                            alert(
                              `${patient.name}

Age: ${patient.age}
Gender: ${patient.gender}
Village: ${patient.village}
Address: ${patient.address}
Condition: ${patient.condition}
Symptoms: ${patient.symptoms}
Phone: ${patient.phone}
Emergency Contact: ${patient.emergencyContact}`,
                            )
                          }
                        >
                          <Eye size={17} />
                          View
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

          {/* =================================================
              NO PATIENTS
          ================================================= */}

          {!loading &&
            !error &&
            filteredPatients.length === 0 && (
              <div className="asha-empty">
                <Users size={44} />

                <h3>
                  No patients found
                </h3>

                <p>
                  Try changing your search or
                  filter.
                </p>

                <Link
                  to="/asha/register"
                  className="asha-primary-button"
                >
                  <UserPlus size={18} />
                  Register New Patient
                </Link>
              </div>
            )}
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="asha-footer">
          <span>
            ASHA Worker: Anitha
          </span>

          <span>
            PHC Contact: 040-12345678
          </span>
        </footer>
      </main>
    </div>
  );
}