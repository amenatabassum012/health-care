import { Link } from "react-router-dom"
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Phone,
  UserRound,
  AlertTriangle,
} from "lucide-react"

import "./ASHADashboard.css"

type FollowUp = {
  id: number
  time: string
  patient: string
  age: number
  purpose: string
  village: string
  priority: "Normal" | "High"
}

const followUps: FollowUp[] = [
  {
    id: 1,
    time: "10:00 AM",
    patient: "Anita Devi",
    age: 42,
    purpose: "Blood pressure follow-up",
    village: "Rampur Village",
    priority: "Normal",
  },
  {
    id: 2,
    time: "12:30 PM",
    patient: "Mohammed Rahim",
    age: 63,
    purpose: "Medication follow-up",
    village: "Rampur Village",
    priority: "Normal",
  },
  {
    id: 3,
    time: "03:00 PM",
    patient: "Sita Devi",
    age: 29,
    purpose: "High-risk patient review",
    village: "Lakshmipur",
    priority: "High",
  },
  {
    id: 4,
    time: "04:30 PM",
    patient: "Ramesh Kumar",
    age: 55,
    purpose: "Diabetes monitoring",
    village: "Rampur Village",
    priority: "Normal",
  },
  {
    id: 5,
    time: "05:30 PM",
    patient: "Lakshmi Rao",
    age: 48,
    purpose: "General health check",
    village: "Lakshmipur",
    priority: "Normal",
  },
]

export default function ASHAFollowups() {
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

          <Link to="/asha/patients">
            👥 My Patients
          </Link>

          <Link
            to="/asha/followups"
            className="active"
          >
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
          MAIN
      ===================================================== */}

      <main className="asha-main">

        {/* HEADER */}

        <header className="asha-header">

          <div>

            <h1>
              Today's Follow-ups
            </h1>

            <p>
              Manage scheduled patient visits and follow-up care.
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

          📍

          <strong>
            Serving:
          </strong>

          Rampur Village

          <span>|</span>

          <strong>
            PHC:
          </strong>

          Rampur Primary Health Centre

        </div>


        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <section className="section">

          <div className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon">
                <CalendarDays />
              </div>

              <div>

                <p>
                  Today's Follow-ups
                </p>

                <h2>
                  5
                </h2>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                <Clock />
              </div>

              <div>

                <p>
                  Next Visit
                </p>

                <h2>
                  10 AM
                </h2>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                <AlertTriangle />
              </div>

              <div>

                <p>
                  High Priority
                </p>

                <h2>
                  1
                </h2>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                <UserRound />
              </div>

              <div>

                <p>
                  Completed
                </p>

                <h2>
                  0
                </h2>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOLLOW-UP LIST
        ===================================================== */}

        <section className="section">

          <div className="section-title">

            <h2>
              Scheduled Visits
            </h2>

            <span
              style={{
                color: "#718080",
                fontSize: "14px",
              }}
            >
              8 September 2026
            </span>

          </div>


          <div className="followup-list">

            {followUps.map((followUp) => (

              <div
                className="followup-card"
                key={followUp.id}
              >

                {/* TIME */}

                <div className="time">

                  <Clock size={17} />

                  {followUp.time}

                </div>


                {/* PATIENT */}

                <div>

                  <strong>
                    {followUp.patient}
                  </strong>

                  <p>
                    Age {followUp.age} •{" "}
                    {followUp.village}
                  </p>

                  <p>
                    {followUp.purpose}
                  </p>

                  {followUp.priority === "High" && (

                    <span
                      className="status urgent"
                      style={{
                        marginTop: "7px",
                      }}
                    >
                      High Priority
                    </span>

                  )}

                </div>


                {/* ACTIONS */}

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >

                  <button
                    className="followup-button"
                    type="button"
                    onClick={() =>
                      alert(
                        `Follow-up opened for ${followUp.patient}`
                      )
                    }
                  >
                    Open
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        `Calling ${followUp.patient}`
                      )
                    }
                    style={{
                      border: "none",
                      background: "#e5f5f3",
                      color: "#0f766e",
                      padding: "9px 11px",
                      borderRadius: "7px",
                      cursor: "pointer",
                    }}
                    title="Call patient"
                  >
                    <Phone size={16} />
                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* =====================================================
            CARE REMINDER
        ===================================================== */}

        <section className="section">

          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              padding: "18px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >

            <AlertTriangle
              size={22}
              color="#0f766e"
            />

            <div>

              <strong
                style={{
                  color: "#166534",
                }}
              >
                Care Reminder
              </strong>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#4b6357",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                Complete today's follow-ups and update the
                patient's status after each visit. High-priority
                patients should be reviewed first.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            BACK
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