import {
  ArrowLeft,
  BriefcaseMedical,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  UserRound,
  Building2,
  Activity,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./ASHADashboard.css";

export default function ASHAProfile() {
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

          <Link to="/asha/patients">
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

          <Link
            to="/asha/profile"
            className="active"
          >
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
          MAIN CONTENT
      ===================================================== */}

      <main className="asha-main">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="asha-header">
          <div>
            <h1>My Profile</h1>

            <p>
              Manage your ASHA worker information and details.
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

        {/* =================================================
            LOCATION
        ================================================= */}

        <div className="asha-location">
          <MapPin size={18} />

          <span>
            Rampur Village | Rampur Primary Health Centre
          </span>
        </div>

        {/* =================================================
            BACK TO DASHBOARD
        ================================================= */}

        <div className="asha-page-actions">
          <Link
            to="/asha"
            className="back-dashboard"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>

        {/* =================================================
            PROFILE HERO CARD
        ================================================= */}

        <section className="profile-hero-card">
          <div className="profile-hero-left">
            <div className="profile-large-avatar">
              A
            </div>

            <div className="profile-hero-info">
              <h2>Anitha</h2>

              <p>
                <BriefcaseMedical size={17} />
                ASHA Worker
              </p>

              <p>
                <MapPin size={17} />
                Rampur Village
              </p>
            </div>
          </div>

          <button
            type="button"
            className="asha-primary-button profile-edit-button"
            onClick={() =>
              alert("Edit Profile feature coming soon.")
            }
          >
            <Edit3 size={18} />
            Edit Profile
          </button>
        </section>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <section className="profile-section">
          <div className="profile-section-heading">
            <div className="profile-section-icon">
              <UserRound size={22} />
            </div>

            <div>
              <h2>Personal Information</h2>

              <p>
                Your basic contact information.
              </p>
            </div>
          </div>

          <div className="profile-info-grid">
            {/* FULL NAME */}

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <User size={19} />
              </div>

              <div>
                <span>Full Name</span>
                <strong>Anitha</strong>
              </div>
            </div>

            {/* ROLE */}

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <BriefcaseMedical size={19} />
              </div>

              <div>
                <span>Role</span>
                <strong>ASHA Worker</strong>
              </div>
            </div>

            {/* PHONE */}

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Phone size={19} />
              </div>

              <div>
                <span>Phone Number</span>
                <strong>+91 9876543210</strong>
              </div>
            </div>

            {/* EMAIL */}

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Mail size={19} />
              </div>

              <div>
                <span>Email Address</span>
                <strong>
                  anitha@swasthyaSetu.org
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            WORK INFORMATION
        ================================================= */}

        <section className="profile-section">
          <div className="profile-section-heading">
            <div className="profile-section-icon">
              <Building2 size={22} />
            </div>

            <div>
              <h2>Work Information</h2>

              <p>
                Details about your healthcare service area.
              </p>
            </div>
          </div>

          <div className="profile-info-grid">
            {/* PRIMARY VILLAGE */}

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <MapPin size={19} />
              </div>

              <div>
                <span>Primary Village</span>
                <strong>Rampur Village</strong>
              </div>
            </div>

            {/* ASSIGNED PHC */}

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Building2 size={19} />
              </div>

              <div>
                <span>Assigned PHC</span>
                <strong>
                  Rampur Primary Health Centre
                </strong>
              </div>
            </div>

            {/* SERVICE AREA */}

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <MapPin size={19} />
              </div>

              <div>
                <span>Service Area</span>
                <strong>
                  Rampur Village / Lakshmipur
                </strong>
              </div>
            </div>

            {/* EXPERIENCE */}

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Activity size={19} />
              </div>

              <div>
                <span>Experience</span>
                <strong>4 Years</strong>
              </div>
            </div>

            {/* JOINING DATE */}

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <CalendarDays size={19} />
              </div>

              <div>
                <span>Joining Date</span>
                <strong>12 June 2022</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            WORK SUMMARY
        ================================================= */}

        <section className="profile-section">
          <div className="profile-section-heading">
            <div className="profile-section-icon">
              <Activity size={22} />
            </div>

            <div>
              <h2>My Work Summary</h2>

              <p>
                Overview of your healthcare activities.
              </p>
            </div>
          </div>

          <div className="profile-summary-grid">
            {/* ASSIGNED PATIENTS */}

            <div className="profile-summary-card">
              <div className="profile-summary-icon">
                <Users size={23} />
              </div>

              <div>
                <strong>42</strong>
                <span>Assigned Patients</span>
              </div>
            </div>

            {/* PATIENTS SERVED */}

            <div className="profile-summary-card">
              <div className="profile-summary-icon">
                <UserRound size={23} />
              </div>

              <div>
                <strong>186</strong>
                <span>Patients Served</span>
              </div>
            </div>

            {/* REFERRALS */}

            <div className="profile-summary-card">
              <div className="profile-summary-icon">
                <CheckCircle2 size={23} />
              </div>

              <div>
                <strong>27</strong>
                <span>Referrals Completed</span>
              </div>
            </div>

            {/* FOLLOW-UP RATE */}

            <div className="profile-summary-card">
              <div className="profile-summary-icon">
                <Activity size={23} />
              </div>

              <div>
                <strong>94%</strong>
                <span>Follow-up Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

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