import { useState } from "react";
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
import "./ASHADashboard.css";

type RiskLevel = "Critical" | "High";

interface HighRiskPatient {
  id: number;
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

const patients: HighRiskPatient[] = [
  {
    id: 1,
    name: "Sita Devi",
    age: 29,
    village: "Lakshmipur",
    condition: "High Blood Pressure",
    symptoms: "Severe headache, dizziness",
    risk: "Critical",
    lastVisit: "Today, 09:00 AM",
    nextAction: "Immediate PHC review",
    phone: "9876543210",
  },
  {
    id: 2,
    name: "Mohammed Rahim",
    age: 63,
    village: "Rampur Village",
    condition: "Diabetes",
    symptoms: "High sugar, weakness",
    risk: "High",
    lastVisit: "Yesterday, 03:00 PM",
    nextAction: "Doctor consultation",
    phone: "9876543211",
  },
  {
    id: 3,
    name: "Lakshmi Rao",
    age: 51,
    village: "Lakshmipur",
    condition: "Hypertension",
    symptoms: "Chest discomfort, fatigue",
    risk: "High",
    lastVisit: "05 Sep 2026",
    nextAction: "BP monitoring",
    phone: "9876543212",
  },
  {
    id: 4,
    name: "Ramesh Kumar",
    age: 55,
    village: "Rampur Village",
    condition: "Diabetes",
    symptoms: "Increased thirst, weakness",
    risk: "High",
    lastVisit: "04 Sep 2026",
    nextAction: "Blood sugar test",
    phone: "9876543213",
  },
  {
    id: 5,
    name: "Anita Devi",
    age: 42,
    village: "Rampur Village",
    condition: "Hypertension",
    symptoms: "High BP reading",
    risk: "High",
    lastVisit: "03 Sep 2026",
    nextAction: "Follow-up visit",
    phone: "9876543214",
  },
];

export default function ASHAHighRisk() {
  const [search, setSearch] = useState("");

  const filteredPatients = patients.filter((patient) => {
    const text = `${patient.name} ${patient.condition} ${patient.village}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  const criticalCount = patients.filter(
    (patient) => patient.risk === "Critical",
  ).length;

  const highCount = patients.filter(
    (patient) => patient.risk === "High",
  ).length;

  const callPatient = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const openPatient = (patient: HighRiskPatient) => {
    alert(
      `Patient: ${patient.name}\nCondition: ${patient.condition}\nRisk: ${patient.risk}\nNext Action: ${patient.nextAction}`,
    );
  };

  return (
    <div className="asha-page">
      {/* SIDEBAR */}
      <aside className="asha-sidebar">
        <div className="asha-logo">
          💗 <span>SwasthyaSetu</span>
        </div>

        <nav className="asha-nav">
          <a href="/asha">🏠 Dashboard</a>

          <a href="/asha/patients">👥 My Patients</a>

          <a href="/asha/followups">📋 Follow-ups</a>

          <a href="/asha/referrals">🚨 Referrals</a>

          <a
            href="/asha/high-risk"
            className="active"
          >
            ⚠️ High-Risk Patients
          </a>

          <a href="/asha/register">➕ Register Patient</a>

          <a href="/asha/profile">👤 My Profile</a>

          <a href="/">🚪 Logout</a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="asha-main">
        {/* HEADER */}
        <header className="asha-header">
          <div>
            <h1>High-Risk Patients</h1>
            <p>
              Monitor patients who require urgent attention and follow-up.
            </p>
          </div>

          <div className="asha-profile">
            <div className="profile-avatar">A</div>

            <div>
              <strong>Anitha</strong>
              <span>ASHA Worker</span>
            </div>
          </div>
        </header>

        {/* LOCATION */}
        <div className="asha-location">
          📍 <strong>Serving:</strong> Rampur Village
          <span> | </span>
          <strong>PHC:</strong> Rampur Primary Health Centre
        </div>

        {/* SUMMARY CARDS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon danger">
              <AlertTriangle size={24} />
            </div>

            <div>
              <span>High-Risk Patients</span>
              <strong>{patients.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon critical">
              <Bell size={24} />
            </div>

            <div>
              <span>Critical</span>
              <strong>{criticalCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <Clock size={24} />
            </div>

            <div>
              <span>High Risk</span>
              <strong>{highCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>

            <div>
              <span>Needs Attention Today</span>
              <strong>3</strong>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="asha-section">
          <div className="section-title">
            <div>
              <h2>Patients Requiring Attention</h2>
              <p>
                Prioritize these patients based on their current health risk.
              </p>
            </div>
          </div>

          <div className="asha-search">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search patient, condition or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        {/* PATIENT CARDS */}
        <section className="high-risk-list">
          {filteredPatients.map((patient) => (
            <div
              className="high-risk-card"
              key={patient.id}
            >
              <div className="high-risk-main">
                <div className="patient-avatar">
                  <UserRound size={25} />
                </div>

                <div className="patient-details">
                  <div className="patient-name-row">
                    <h3>{patient.name}</h3>

                    <span
                      className={
                        patient.risk === "Critical"
                          ? "risk-badge critical-risk"
                          : "risk-badge high-risk"
                      }
                    >
                      {patient.risk}
                    </span>
                  </div>

                  <p>
                    {patient.age} years • {patient.village}
                  </p>

                  <strong>{patient.condition}</strong>

                  <p className="symptoms">
                    <AlertTriangle size={15} />
                    {patient.symptoms}
                  </p>
                </div>
              </div>

              <div className="high-risk-info">
                <div>
                  <span>Last Visit</span>
                  <strong>{patient.lastVisit}</strong>
                </div>

                <div>
                  <span>Next Action</span>
                  <strong>{patient.nextAction}</strong>
                </div>
              </div>

              <div className="high-risk-actions">
                <button
                  className="asha-secondary-button"
                  onClick={() => callPatient(patient.phone)}
                >
                  <Phone size={17} />
                  Call
                </button>

                <button
                  className="asha-primary-button"
                  onClick={() => openPatient(patient)}
                >
                  View Patient
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="asha-empty">
              <Search size={35} />
              <h3>No patients found</h3>
              <p>Try searching with another name or condition.</p>
            </div>
          )}
        </section>

        {/* EMERGENCY NOTICE */}
        <section className="high-risk-notice">
          <AlertTriangle size={25} />

          <div>
            <h3>Emergency Reminder</h3>

            <p>
              If a patient has severe symptoms or their condition suddenly
              worsens, contact the PHC immediately or use the emergency
              referral process.
            </p>
          </div>

          <button
            onClick={() =>
              alert("PHC Rampur Emergency Contact: 040-12345678")
            }
          >
            Contact PHC
          </button>
        </section>

        {/* BACK */}
        <button
          className="back-dashboard"
          onClick={() => {
            window.location.href = "/asha";
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <footer className="asha-footer">
          <span>ASHA Worker: Anitha</span>
          <span>PHC Contact: 040-12345678</span>
        </footer>
      </main>
    </div>
  );
}