import { Link } from "react-router-dom"
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Hospital,
  LogOut,
  MapPin,
  Phone,
  UserPlus,
  Users,
  Clock,
} from "lucide-react"

import "./ASHADashboard.css"

export function ASHADashboard() {
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

          <Link to="/asha" className="active">
            🏠
            <span>Dashboard</span>
          </Link>

          <Link to="/asha/patients">
            👥
            <span>My Patients</span>
          </Link>

          <Link to="/asha/followups">
            📋
            <span>Follow-ups</span>
          </Link>

          <Link to="/asha/referrals">
            🏥
            <span>Referrals</span>
          </Link>

          <Link to="/asha/high-risk">
            🚨
            <span>High-Risk Patients</span>
          </Link>

          <Link to="/asha/register">
            ➕
            <span>Register Patient</span>
          </Link>

          <Link to="/asha/profile">
            👤
            <span>My Profile</span>
          </Link>

        </nav>

        <Link to="/" className="logout-btn">
          <LogOut size={18} />
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
            <h1>
              Good Morning, ASHA Worker 👋
            </h1>

            <p>
              Here is today's healthcare overview.
            </p>
          </div>


          {/* Worker Profile */}

          <div className="worker-profile">

            <div className="profile-circle">
              A
            </div>

            <div>
              <strong>Anitha</strong>
              <span>ASHA Worker</span>
            </div>

          </div>

        </header>


        {/* =====================================================
            LOCATION
        ===================================================== */}

        <div className="location-card">

          <MapPin size={20} />

          <strong>Serving:</strong>

          <span>
            Rampur Village
          </span>

          <span>|</span>

          <strong>PHC:</strong>

          <span>
            Rampur Primary Health Centre
          </span>

        </div>


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section className="stats-grid">


          {/* Assigned Patients */}

          <div className="stat-card">

            <div className="stat-icon">
              <Users size={25} />
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


          {/* Today's Visits */}

          <div className="stat-card">

            <div className="stat-icon">
              <CalendarDays size={25} />
            </div>

            <div>

              <p>
                Today's Visits
              </p>

              <h2>
                8
              </h2>

            </div>

          </div>


          {/* Pending Follow-ups */}

          <div className="stat-card">

            <div className="stat-icon">
              <ClipboardList size={25} />
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


          {/* High Risk */}

          <div className="stat-card">

            <div className="stat-icon">
              <AlertTriangle size={25} />
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

        </section>


        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="section">

          <div className="section-title">

            <h2>
              Quick Actions
            </h2>

          </div>


          <div className="quick-actions">


            <Link
              to="/asha/patients"
              className="quick-action-link"
            >

              <Users size={20} />

              <span>
                My Patients
              </span>

            </Link>


            <Link
              to="/asha/register"
              className="quick-action-link"
            >

              <UserPlus size={20} />

              <span>
                Register Patient
              </span>

            </Link>


            <Link
              to="/asha/followups"
              className="quick-action-link"
            >

              <ClipboardList size={20} />

              <span>
                Follow-ups
              </span>

            </Link>


            <Link
              to="/asha/referrals"
              className="quick-action-link"
            >

              <Hospital size={20} />

              <span>
                Referrals
              </span>

            </Link>

          </div>

        </section>


        {/* =====================================================
            RECENT PATIENTS
        ===================================================== */}

        <section className="section">

          <div className="section-title">

            <h2>
              Recent Patients
            </h2>

            <Link
              to="/asha/patients"
              className="view-all"
            >
              View All
            </Link>

          </div>


          <div className="patient-table">


            {/* Table Header */}

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


            {/* Patient 1 */}

            <div className="patient-row">

              <div>
                <strong>
                  Anita Devi
                </strong>
              </div>

              <div>
                42
              </div>

              <div>
                Rampur Village
              </div>

              <div>
                <span className="status followup">
                  Follow-up
                </span>
              </div>

              <div>
                <Link
                  to="/asha/patients"
                  className="patient-view-button"
                >
                  View
                </Link>
              </div>

            </div>


            {/* Patient 2 */}

            <div className="patient-row">

              <div>
                <strong>
                  Ramesh Kumar
                </strong>
              </div>

              <div>
                55
              </div>

              <div>
                Rampur Village
              </div>

              <div>
                <span className="status">
                  Stable
                </span>
              </div>

              <div>
                <Link
                  to="/asha/patients"
                  className="patient-view-button"
                >
                  View
                </Link>
              </div>

            </div>


            {/* Patient 3 */}

            <div className="patient-row">

              <div>
                <strong>
                  Sita Devi
                </strong>
              </div>

              <div>
                29
              </div>

              <div>
                Lakshmipur
              </div>

              <div>
                <span className="status urgent">
                  Urgent
                </span>
              </div>

              <div>
                <Link
                  to="/asha/patients"
                  className="patient-view-button"
                >
                  View
                </Link>
              </div>

            </div>


            {/* Patient 4 */}

            <div className="patient-row">

              <div>
                <strong>
                  Mohammed Rahim
                </strong>
              </div>

              <div>
                63
              </div>

              <div>
                Rampur Village
              </div>

              <div>
                <span className="status followup">
                  Follow-up
                </span>
              </div>

              <div>
                <Link
                  to="/asha/patients"
                  className="patient-view-button"
                >
                  View
                </Link>
              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            TODAY'S FOLLOW-UPS
        ===================================================== */}

        <section className="section">

          <div className="section-title">

            <h2>
              Today's Follow-ups
            </h2>

            <Link
              to="/asha/followups"
              className="view-all"
            >
              View All
            </Link>

          </div>


          <div className="followup-list">


            {/* Follow-up 1 */}

            <div className="followup-card">

              <div className="time">

                <Clock size={17} />

                10:00 AM

              </div>


              <div>

                <strong>
                  Anita Devi
                </strong>

                <p>
                  Blood pressure follow-up
                </p>

              </div>


              <Link
                to="/asha/followups"
                className="followup-button"
              >
                Open
              </Link>

            </div>


            {/* Follow-up 2 */}

            <div className="followup-card">

              <div className="time">

                <Clock size={17} />

                12:30 PM

              </div>


              <div>

                <strong>
                  Mohammed Rahim
                </strong>

                <p>
                  Medication follow-up
                </p>

              </div>


              <Link
                to="/asha/followups"
                className="followup-button"
              >
                Open
              </Link>

            </div>


            {/* Follow-up 3 */}

            <div className="followup-card">

              <div className="time">

                <Clock size={17} />

                03:00 PM

              </div>


              <div>

                <strong>
                  Sita Devi
                </strong>

                <p>
                  High-risk patient review
                </p>

              </div>


              <Link
                to="/asha/high-risk"
                className="followup-button"
              >
                Open
              </Link>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer
          style={{
            marginTop: "35px",
            padding: "20px 0",
            borderTop: "1px solid #e5eaea",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            color: "#647474",
            fontSize: "13px",
          }}
        >

          <div>
            <strong>ASHA Worker:</strong>{" "}
            Anitha
          </div>

          <div>
            <Phone size={15} style={{ verticalAlign: "middle" }} />{" "}
            <strong>PHC Contact:</strong>{" "}
            040-12345678
          </div>

        </footer>

      </main>

    </div>
  )
}

export default ASHADashboard