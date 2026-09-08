import { useState } from "react";
import {
  ArrowLeft,
  BriefcaseMedical,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./ASHADashboard.css";

export default function ASHAProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Anitha",
    role: "ASHA Worker",
    phone: "9876543210",
    email: "anitha@swasthyaSetu.org",
    village: "Rampur Village",
    phc: "Rampur Primary Health Centre",
    serviceArea: "Rampur Village / Lakshmipur",
    experience: "4 Years",
    joiningDate: "12 June 2022",
  });

  const handleChange = (
    field: keyof typeof profile,
    value: string,
  ) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    setIsEditing(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

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

        {/* HEADER */}

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
              <strong>{profile.name}</strong>
              <span>{profile.role}</span>
            </div>

          </div>

        </header>

        {/* LOCATION */}

        <div className="asha-location">

          <MapPin size={18} />

          <span>
            {profile.village} | {profile.phc}
          </span>

        </div>

        {/* SUCCESS MESSAGE */}

        {saved && (
          <div className="profile-success">
            <CheckCircle2 size={20} />

            <span>
              Profile updated successfully.
            </span>
          </div>
        )}

        {/* BACK BUTTON */}

        <Link
          to="/asha"
          className="back-dashboard"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* =====================================================
            PROFILE HERO
        ===================================================== */}

        <section className="profile-hero">

          <div className="large-profile-avatar">
            A
          </div>

          <div className="profile-hero-info">

            <h2>{profile.name}</h2>

            <p className="profile-role">
              {profile.role}
            </p>

            <p className="profile-location">
              <MapPin size={16} />
              {profile.village}
            </p>

          </div>

          <div className="profile-hero-action">

            {!isEditing ? (
              <button
                className="asha-primary-button"
                onClick={() => {
                  setIsEditing(true);
                  setSaved(false);
                }}
              >
                <Edit3 size={17} />
                Edit Profile
              </button>
            ) : (
              <button
                className="asha-primary-button"
                onClick={handleSave}
              >
                <Save size={17} />
                Save Changes
              </button>
            )}

          </div>

        </section>

        {/* =====================================================
            PERSONAL INFORMATION
        ===================================================== */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div className="profile-section-icon">
              <User size={20} />
            </div>

            <div>
              <h2>Personal Information</h2>
              <p>
                Your basic contact information.
              </p>
            </div>

          </div>

          <div className="profile-grid">

            {/* NAME */}

            <div className="profile-field">

              <label>Full Name</label>

              {isEditing ? (
                <div className="input-with-icon">

                  <User size={18} />

                  <input
                    type="text"
                    value={profile.name}
                    onChange={(event) =>
                      handleChange(
                        "name",
                        event.target.value,
                      )
                    }
                  />

                </div>
              ) : (
                <div className="profile-value">
                  <User size={18} />
                  {profile.name}
                </div>
              )}

            </div>

            {/* ROLE */}

            <div className="profile-field">

              <label>Role</label>

              <div className="profile-value">
                <BriefcaseMedical size={18} />
                {profile.role}
              </div>

            </div>

            {/* PHONE */}

            <div className="profile-field">

              <label>Phone Number</label>

              {isEditing ? (
                <div className="input-with-icon">

                  <Phone size={18} />

                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value,
                      )
                    }
                  />

                </div>
              ) : (
                <div className="profile-value">
                  <Phone size={18} />
                  +91 {profile.phone}
                </div>
              )}

            </div>

            {/* EMAIL */}

            <div className="profile-field">

              <label>Email Address</label>

              {isEditing ? (
                <div className="input-with-icon">

                  <Mail size={18} />

                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target.value,
                      )
                    }
                  />

                </div>
              ) : (
                <div className="profile-value">
                  <Mail size={18} />
                  {profile.email}
                </div>
              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            WORK INFORMATION
        ===================================================== */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div className="profile-section-icon">
              <BriefcaseMedical size={20} />
            </div>

            <div>
              <h2>Work Information</h2>
              <p>
                Details about your healthcare service area.
              </p>
            </div>

          </div>

          <div className="profile-grid">

            {/* VILLAGE */}

            <div className="profile-field">

              <label>Primary Village</label>

              {isEditing ? (
                <div className="input-with-icon">

                  <MapPin size={18} />

                  <input
                    type="text"
                    value={profile.village}
                    onChange={(event) =>
                      handleChange(
                        "village",
                        event.target.value,
                      )
                    }
                  />

                </div>
              ) : (
                <div className="profile-value">
                  <MapPin size={18} />
                  {profile.village}
                </div>
              )}

            </div>

            {/* PHC */}

            <div className="profile-field">

              <label>Assigned PHC</label>

              {isEditing ? (
                <div className="input-with-icon">

                  <BriefcaseMedical size={18} />

                  <input
                    type="text"
                    value={profile.phc}
                    onChange={(event) =>
                      handleChange(
                        "phc",
                        event.target.value,
                      )
                    }
                  />

                </div>
              ) : (
                <div className="profile-value">
                  <BriefcaseMedical size={18} />
                  {profile.phc}
                </div>
              )}

            </div>

            {/* SERVICE AREA */}

            <div className="profile-field">

              <label>Service Area</label>

              {isEditing ? (
                <div className="input-with-icon">

                  <MapPin size={18} />

                  <input
                    type="text"
                    value={profile.serviceArea}
                    onChange={(event) =>
                      handleChange(
                        "serviceArea",
                        event.target.value,
                      )
                    }
                  />

                </div>
              ) : (
                <div className="profile-value">
                  <MapPin size={18} />
                  {profile.serviceArea}
                </div>
              )}

            </div>

            {/* EXPERIENCE */}

            <div className="profile-field">

              <label>Experience</label>

              <div className="profile-value">
                <CalendarDays size={18} />
                {profile.experience}
              </div>

            </div>

            {/* JOINING DATE */}

            <div className="profile-field">

              <label>Joining Date</label>

              <div className="profile-value">
                <CalendarDays size={18} />
                {profile.joiningDate}
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            ASHA PERFORMANCE
        ===================================================== */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div className="profile-section-icon">
              <Users size={20} />
            </div>

            <div>
              <h2>My Work Summary</h2>
              <p>
                Overview of your healthcare activities.
              </p>
            </div>

          </div>

          <div className="profile-stat-grid">

            <div className="profile-stat">

              <div className="profile-stat-icon">
                <Users size={22} />
              </div>

              <div>
                <strong>42</strong>
                <span>Assigned Patients</span>
              </div>

            </div>

            <div className="profile-stat">

              <div className="profile-stat-icon">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <strong>186</strong>
                <span>Patients Served</span>
              </div>

            </div>

            <div className="profile-stat">

              <div className="profile-stat-icon">
                <BriefcaseMedical size={22} />
              </div>

              <div>
                <strong>27</strong>
                <span>Referrals Completed</span>
              </div>

            </div>

            <div className="profile-stat">

              <div className="profile-stat-icon">
                <CalendarDays size={22} />
              </div>

              <div>
                <strong>94%</strong>
                <span>Follow-up Rate</span>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        {isEditing && (
          <div className="register-actions">

            <button
              className="asha-secondary-button"
              onClick={() => {
                setIsEditing(false);
                setSaved(false);
              }}
            >
              Cancel
            </button>

            <button
              className="asha-primary-button"
              onClick={handleSave}
            >
              <Save size={17} />
              Save Profile
            </button>

          </div>
        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="asha-footer">

          <span>
            ASHA Worker: {profile.name}
          </span>

          <span>
            PHC Contact: 040-12345678
          </span>

        </footer>

      </main>

    </div>
  );
}