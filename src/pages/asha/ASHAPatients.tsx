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

export default function ASHAPatients() {
  const [patients, setPatients] = useState<ASHAPatient[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error loading patients:", fetchError);
        setError("Unable to load patients.");
        setPatients([]);
        setLoading(false);
        return;
      }

      const formattedPatients: ASHAPatient[] = (data ?? []).map(
        (patient) => ({
          id: patient.id,
          name: patient.name ?? "",
          age: Number(patient.age ?? 0),
          phone: patient.phone ?? "",
          gender: patient.gender ?? "",
          village: patient.village ?? "Not provided",
          address: patient.address ?? "",
          condition: patient.condition ?? "Not specified",
          symptoms: patient.symptoms ?? "Not provided",
          emergencyContact:
            patient.emergency_contact ?? "",
          status: "New",
          priority: "Normal",
        }),
      );

      setPatients(formattedPatients);
      setLoading(false);
    };

    loadPatients();
  }, []);

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

          <div className="stat-card">

            <div className="stat-icon">
              <Users size={22} />
            </div>

            <div>
              <span>Total Patients</span>
              <strong>{patients.length}</strong>
            </div>

          </div>

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

                <div className="table-header">

                  <span>Patient</span>
                  <span>Age / Gender</span>
                  <span>Village</span>
                  <span>Condition</span>
                  <span>Status</span>
                  <span>Action</span>

                </div>

                {filteredPatients.map(
                  (patient) => (

                    <div
                      className="patient-row"
                      key={patient.id}
                    >

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

                      <div>
                        {patient.age} /{" "}
                        {patient.gender}
                      </div>

                      <div>
                        {patient.village}
                      </div>

                      <div>
                        {patient.condition}
                      </div>

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

                      <div>

                        <button
                          type="button"
                          className="asha-view-button"
                          title={`View ${patient.name}`}
                          onClick={() =>
                            alert(
                              `${patient.name}\n\nAge: ${patient.age}\nGender: ${patient.gender}\nVillage: ${patient.village}\nAddress: ${patient.address}\nCondition: ${patient.condition}\nSymptoms: ${patient.symptoms}\nPhone: ${patient.phone}\nEmergency Contact: ${patient.emergencyContact}`,
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

        {/* FOOTER */}

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