import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Search,
  UserRound,
  CalendarDays,
  AlertTriangle,
  Eye,
  Plus,
} from "lucide-react"

import "./ASHADashboard.css"

type Patient = {
  id: number
  name: string
  age: number
  village: string
  status: "Stable" | "Follow-up" | "Urgent" | "Referred"
  lastVisit: string
}

const patients: Patient[] = [
  {
    id: 1,
    name: "Anita Devi",
    age: 42,
    village: "Rampur Village",
    status: "Follow-up",
    lastVisit: "05 Sep 2026",
  },
  {
    id: 2,
    name: "Ramesh Kumar",
    age: 55,
    village: "Rampur Village",
    status: "Stable",
    lastVisit: "04 Sep 2026",
  },
  {
    id: 3,
    name: "Sita Devi",
    age: 29,
    village: "Lakshmipur",
    status: "Urgent",
    lastVisit: "06 Sep 2026",
  },
  {
    id: 4,
    name: "Mohammed Rahim",
    age: 63,
    village: "Rampur Village",
    status: "Follow-up",
    lastVisit: "03 Sep 2026",
  },
  {
    id: 5,
    name: "Lakshmi Rao",
    age: 48,
    village: "Lakshmipur",
    status: "Stable",
    lastVisit: "02 Sep 2026",
  },
  {
    id: 6,
    name: "Suresh Yadav",
    age: 67,
    village: "Rampur Village",
    status: "Referred",
    lastVisit: "01 Sep 2026",
  },
]

function getStatusClass(status: Patient["status"]) {
  if (status === "Urgent") {
    return "status urgent"
  }

  if (status === "Follow-up") {
    return "status followup"
  }

  if (status === "Referred") {
    return "status referred"
  }

  return "status"
}

export default function ASHAPatients() {
  return (
    <div className="asha-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="asha-sidebar">

        <div className="asha-logo">
          ❤️ SwasthyaSetu
        </div>

        <nav>

          <Link to="/asha">
            🏠 Dashboard
          </Link>

          <Link
            to="/asha/patients"
            className="active"
          >
            👥 My Patients
          </Link>

          <Link to="/asha/followups">
            📋 Follow-ups
          </Link>

          <Link to="/asha/referrals">
            🏥 Referrals
          </Link>

          <Link to="/asha/high-risk">
            🚨 High-Risk Patients
          </Link>

          <Link to="/asha/register">
            ➕ Register Patient
          </Link>

          <Link to="/asha/profile">
            👤 My Profile
          </Link>

        </nav>

        <Link
          to="/"
          className="logout-btn"
        >
          ↪ Logout
        </Link>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="asha-main">

        {/* HEADER */}

        <header className="asha-header">

          <div>

            <h1>
              My Patients
            </h1>

            <p>
              View and manage patients assigned to you.
            </p>

          </div>


          {/* ASHA PROFILE */}

          <div className="worker-profile">

            <div className="profile-circle">
              A
            </div>

            <div>

              <strong>
                Anitha
              </strong>

              <span>
                ASHA Worker
              </span>

            </div>

          </div>

        </header>


        {/* LOCATION */}

        <div className="location-card">

          <span>📍</span>

          <strong>
            Serving:
          </strong>

          <span>
            Rampur Village
          </span>

          <span>|</span>

          <strong>
            PHC:
          </strong>

          <span>
            Rampur Primary Health Centre
          </span>

        </div>


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section className="section">

          <div className="stats-grid">

            {/* TOTAL PATIENTS */}

            <div className="stat-card">

              <div className="stat-icon">
                <UserRound />
              </div>

              <div>

                <p>
                  Assigned Patients
                </p>

                <h2>
                  42
                </h2>

              </div>

            </div>


            {/* FOLLOW UPS */}

            <div className="stat-card">

              <div className="stat-icon">
                <CalendarDays />
              </div>

              <div>

                <p>
                  Pending Follow-ups
                </p>

                <h2>
                  5
                </h2>

              </div>

            </div>


            {/* HIGH RISK */}

            <div className="stat-card">

              <div className="stat-icon">
                <AlertTriangle />
              </div>

              <div>

                <p>
                  High-Risk Patients
                </p>

                <h2>
                  3
                </h2>

              </div>

            </div>


            {/* NEW PATIENT */}

            <div className="stat-card">

              <div className="stat-icon">
                <Plus />
              </div>

              <div>

                <p>
                  New This Month
                </p>

                <h2>
                  7
                </h2>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            PATIENT SECTION
        ===================================================== */}

        <section className="section">

          <div className="section-title">

            <h2>
              All Assigned Patients
            </h2>

            <Link
              to="/asha/register"
              className="view-all"
            >
              + Register Patient
            </Link>

          </div>


          {/* SEARCH BOX */}

          <div
            style={{
              background: "white",
              padding: "16px 18px",
              borderRadius: "12px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >

            <Search
              size={20}
              color="#0f766e"
            />

            <input
              type="text"
              placeholder="Search patient by name, village or status..."
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: "14px",
                background: "transparent",
              }}
            />

          </div>


          {/* =================================================
              PATIENT TABLE
          ================================================= */}

          <div className="patient-table">

            {/* TABLE HEADER */}

            <div className="table-header">

              <div>
                Patient
              </div>

              <div>
                Age
              </div>

              <div>
                Village
              </div>

              <div>
                Status
              </div>

              <div>
                Action
              </div>

            </div>


            {/* PATIENT ROWS */}

            {patients.map((patient) => (

              <div
                className="patient-row"
                key={patient.id}
              >

                {/* PATIENT */}

                <div>

                  <strong>
                    {patient.name}
                  </strong>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "12px",
                      color: "#718080",
                    }}
                  >
                    Last visit: {patient.lastVisit}
                  </div>

                </div>


                {/* AGE */}

                <div>
                  {patient.age}
                </div>


                {/* VILLAGE */}

                <div>
                  {patient.village}
                </div>


                {/* STATUS */}

                <div>

                  <span
                    className={getStatusClass(
                      patient.status
                    )}
                  >
                    {patient.status}
                  </span>

                </div>


                {/* ACTION */}

                <div>

                  <button
                    className="patient-view-button"
                    type="button"
                    onClick={() =>
                      alert(
                        `Patient: ${patient.name}\nAge: ${patient.age}\nVillage: ${patient.village}\nStatus: ${patient.status}`
                      )
                    }
                  >

                    <Eye
                      size={15}
                      style={{
                        marginRight: "5px",
                        verticalAlign: "middle",
                      }}
                    />

                    View

                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="section">

          <h2>
            Quick Actions
          </h2>

          <div className="quick-actions">

            <Link
              to="/asha/register"
              className="quick-action-link"
            >
              ➕ Register Patient
            </Link>

            <Link
              to="/asha/followups"
              className="quick-action-link"
            >
              📋 Check Follow-ups
            </Link>

            <Link
              to="/asha/high-risk"
              className="quick-action-link"
            >
              🚨 High-Risk Patients
            </Link>

            <Link
              to="/asha/referrals"
              className="quick-action-link"
            >
              🏥 View Referrals
            </Link>

          </div>

        </section>


        {/* =====================================================
            BACK TO DASHBOARD
        ===================================================== */}

        <section className="section">

          <Link
            to="/asha"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#0f766e",
              textDecoration: "none",
              fontWeight: 600,
              marginBottom: "30px",
            }}
          >

            <ArrowLeft size={18} />

            Back to Dashboard

          </Link>

        </section>


      </main>

    </div>
  )
}