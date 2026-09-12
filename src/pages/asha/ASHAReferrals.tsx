import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Hospital,
  MapPin,
  Phone,
  UserRound,
  AlertTriangle,
} from "lucide-react";

import "./ASHADashboard.css";

type Referral = {
  id: number;
  patient: string;
  age: number;
  village: string;
  condition: string;
  referredTo: string;
  date: string;
  status: "Pending" | "Accepted" | "Completed" | "Urgent";
  priority: "Normal" | "High";
};

const referrals: Referral[] = [
  {
    id: 1,
    patient: "Sita Devi",
    age: 29,
    village: "Lakshmipur",
    condition: "High blood pressure",
    referredTo: "Rampur Primary Health Centre",
    date: "Today, 09:30 AM",
    status: "Urgent",
    priority: "High",
  },
  {
    id: 2,
    patient: "Anita Devi",
    age: 42,
    village: "Rampur Village",
    condition: "Hypertension follow-up",
    referredTo: "Rampur Primary Health Centre",
    date: "Today, 10:00 AM",
    status: "Accepted",
    priority: "Normal",
  },
  {
    id: 3,
    patient: "Mohammed Rahim",
    age: 63,
    village: "Rampur Village",
    condition: "Diabetes management",
    referredTo: "District Hospital",
    date: "Yesterday, 03:00 PM",
    status: "Pending",
    priority: "High",
  },
  {
    id: 4,
    patient: "Ramesh Kumar",
    age: 55,
    village: "Rampur Village",
    condition: "Diabetes monitoring",
    referredTo: "Rampur Primary Health Centre",
    date: "05 Sep 2026",
    status: "Completed",
    priority: "Normal",
  },
  {
    id: 5,
    patient: "Lakshmi Rao",
    age: 51,
    village: "Lakshmipur",
    condition: "General health assessment",
    referredTo: "Community Health Centre",
    date: "04 Sep 2026",
    status: "Accepted",
    priority: "Normal",
  },
];

function statusClass(status: Referral["status"]) {
  switch (status) {
    case "Urgent":
      return "urgent";

    case "Pending":
      return "followup";

    case "Accepted":
      return "accepted";

    case "Completed":
      return "completed";

    default:
      return "";
  }
}

export default function ASHAReferrals() {
  const pendingCount = referrals.filter(
    (referral) => referral.status === "Pending",
  ).length;

  const urgentCount = referrals.filter(
    (referral) => referral.status === "Urgent",
  ).length;

  const completedCount = referrals.filter(
    (referral) => referral.status === "Completed",
  ).length;

  return (
    <div className="asha-dashboard">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="asha-sidebar">
        <div className="asha-logo">
          <div className="asha-logo-icon">❤</div>

          <div>
            <h2>SwasthyaSetu</h2>
            <span>AI Healthcare</span>
          </div>
        </div>

        <nav className="asha-nav">
          <Link to="/asha">
            <span>🏠</span>
            Dashboard
          </Link>

          <Link to="/asha/patients">
            <span>👥</span>
            My Patients
          </Link>

          <Link to="/asha/followups">
            <span>📋</span>
            Follow-ups
          </Link>

          <Link to="/asha/referrals" className="active">
            <span>🏥</span>
            Referrals
          </Link>

          <Link to="/asha/high-risk">
            <span>🚨</span>
            High-Risk Patients
          </Link>

          <Link to="/asha/register">
            <span>➕</span>
            Register Patient
          </Link>

          <Link to="/asha/profile">
            <span>👤</span>
            My Profile
          </Link>
        </nav>

        <Link to="/" className="asha-logout">
          <span>↪</span>
          Logout
        </Link>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="asha-main">
        {/* HEADER */}

        <header className="asha-header">
          <div>
            <h1>Referrals</h1>

            <p>
              Track patient referrals and their healthcare journey.
            </p>
          </div>

          <div className="asha-profile">
            <div className="asha-avatar">A</div>

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
            Serving: <strong>Rampur Village</strong>
          </span>

          <span className="location-divider">|</span>

          <span>
            PHC: <strong>Rampur Primary Health Centre</strong>
          </span>
        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <ArrowRight size={24} />
            </div>

            <div>
              <span>Total Referrals</span>
              <strong>{referrals.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={24} />
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <AlertTriangle size={24} />
            </div>

            <div>
              <span>Urgent</span>
              <strong>{urgentCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={24} />
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedCount}</strong>
            </div>
          </div>
        </section>

        {/* =================================================
            REFERRAL LIST
        ================================================= */}

        <section className="asha-section">
          <div className="section-title">
            <div>
              <h2>Patient Referrals</h2>

              <p>
                Monitor referrals from your assigned villages.
              </p>
            </div>

            <Link
              to="/asha/register"
              className="view-all"
            >
              Register Patient →
            </Link>
          </div>

          <div className="patient-table">
            {/* TABLE HEADER */}

            <div className="table-header referral-header">
              <span>Patient</span>
              <span>Condition</span>
              <span>Referred To</span>
              <span>Date</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {/* TABLE ROWS */}

            {referrals.map((referral) => (
              <div
                className="patient-row referral-row"
                key={referral.id}
              >
                {/* PATIENT */}

                <div className="patient-name">
                  <div className="patient-avatar">
                    <UserRound size={18} />
                  </div>

                  <div>
                    <strong>{referral.patient}</strong>

                    <span>
                      {referral.age} years • {referral.village}
                    </span>
                  </div>
                </div>

                {/* CONDITION */}

                <div>
                  <strong>{referral.condition}</strong>

                  {referral.priority === "High" && (
                    <span className="priority-label">
                      High Priority
                    </span>
                  )}
                </div>

                {/* HOSPITAL */}

                <div className="referral-hospital">
                  <Hospital size={18} />

                  <span>{referral.referredTo}</span>
                </div>

                {/* DATE */}

                <div className="referral-date">
                  {referral.date}
                </div>

                {/* STATUS */}

                <div>
                  <span
                    className={`patient-status ${statusClass(
                      referral.status,
                    )}`}
                  >
                    {referral.status}
                  </span>
                </div>

                {/* ACTION */}

                <div>
                  <button
                    className="referral-view-button"
                    onClick={() =>
                      alert(
                        `Referral details for ${referral.patient}`,
                      )
                    }
                  >
                    View
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================
            FACILITY CONTACT
        ================================================= */}

        <section className="asha-section">
          <div className="care-reminder">
            <div className="care-reminder-icon">
              <Building2 size={24} />
            </div>

            <div className="care-reminder-content">
              <h3>Rampur Primary Health Centre</h3>

              <p>
                For urgent referrals, contact the PHC
                before sending the patient.
              </p>

              <div className="facility-contact">
                <span>
                  <Phone size={16} />
                  040-12345678
                </span>

                <span>
                  <MapPin size={16} />
                  Rampur Village
                </span>
              </div>
            </div>

            <button
              className="call-button"
              onClick={() =>
                alert("Calling Rampur Primary Health Centre...")
              }
            >
              <Phone size={17} />
              Call PHC
            </button>
          </div>
        </section>

        {/* =================================================
            BACK TO DASHBOARD
        ================================================= */}

        <Link
          to="/asha"
          className="back-dashboard"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* FOOTER */}

        <footer className="asha-footer">
          <span>
            ASHA Worker: <strong>Anitha</strong>
          </span>

          <span>
            PHC Contact: <strong>040-12345678</strong>
          </span>
        </footer>
      </main>
    </div>
  );
}