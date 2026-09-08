import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  ClipboardList,
  Home,
  LogOut,
  MapPin,
  Menu,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

import "./ASHADashboard.css";

interface PatientForm {
  name: string;
  age: string;
  gender: string;
  phone: string;
  village: string;
  address: string;
  condition: string;
  symptoms: string;
  emergencyContact: string;
}

const initialForm: PatientForm = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  village: "",
  address: "",
  condition: "",
  symptoms: "",
  emergencyContact: "",
};

export default function ASHARegisterPatient() {
  const navigate = useNavigate();

  const [form, setForm] = useState<PatientForm>(initialForm);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleChange = (
    field: keyof PatientForm,
    value: string,
  ): void => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const validateForm = (): string | null => {
    const name = form.name.trim();
    const age = Number(form.age);
    const phone = form.phone.trim();
    const emergencyContact = form.emergencyContact.trim();

    if (!name) {
      return "Please enter the patient's name.";
    }

    if (!form.age.trim()) {
      return "Please enter the patient's age.";
    }

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return "Please enter a valid age between 1 and 120.";
    }

    if (!form.gender) {
      return "Please select the patient's gender.";
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (
      emergencyContact &&
      !/^[6-9]\d{9}$/.test(emergencyContact)
    ) {
      return "Please enter a valid 10-digit emergency contact number.";
    }

    return null;
  };

  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === "object") {
      const supabaseError = err as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };

      if (supabaseError.code === "23505") {
        return "A patient with this information already exists.";
      }

      if (supabaseError.code === "42501") {
        return (
          "You do not have permission to register patients. " +
          "Please check your Supabase Row Level Security policy."
        );
      }

      if (supabaseError.code === "42P01") {
        return (
          "The patients table was not found in Supabase. " +
          "Please check your database table name."
        );
      }

      if (supabaseError.code === "42703") {
        return (
          "One of the patient fields does not match the Supabase " +
          "patients table schema."
        );
      }

      if (supabaseError.message) {
        return supabaseError.message;
      }

      if (supabaseError.details) {
        return supabaseError.details;
      }

      if (supabaseError.hint) {
        return supabaseError.hint;
      }
    }

    if (err instanceof Error && err.message) {
      return err.message;
    }

    return "Unable to register the patient. Please try again.";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setSuccess("");
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const { error: insertError } = await supabase
        .from("patients")
        .insert({
          name: form.name.trim(),
          age: Number(form.age),
          phone: form.phone.trim(),
          gender: form.gender,
          village: form.village.trim() || null,
          address: form.address.trim() || null,
          condition: form.condition.trim() || null,
          symptoms: form.symptoms.trim() || null,
          emergency_contact:
            form.emergencyContact.trim() || null,
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess(
        "Patient registered successfully. Redirecting to My Patients...",
      );

      setForm(initialForm);

      window.setTimeout(() => {
        navigate("/asha/patients");
      }, 1200);
    } catch (err: unknown) {
      console.error("Patient registration error:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const closeSidebar = (): void => {
    setSidebarOpen(false);
  };

  return (
    <div className="asha-app">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="asha-mobile-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`asha-sidebar ${
          sidebarOpen ? "asha-sidebar-open" : ""
        }`}
      >
        <div className="asha-brand">
          <Activity size={28} />

          <div>
            <h2>SwasthyaSetu</h2>
            <span>ASHA Worker</span>
          </div>

          <button
            type="button"
            className="asha-mobile-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={22} />
          </button>
        </div>

        <nav>
          <a href="/asha" onClick={closeSidebar}>
            <Home size={19} />
            <span>Dashboard</span>
          </a>

          <a href="/asha/patients" onClick={closeSidebar}>
            <Users size={19} />
            <span>My Patients</span>
          </a>

          <a href="/asha/followups" onClick={closeSidebar}>
            <Calendar size={19} />
            <span>Follow-ups</span>
          </a>

          <a href="/asha/referrals" onClick={closeSidebar}>
            <ClipboardList size={19} />
            <span>Referrals</span>
          </a>

          <a href="/asha/high-risk" onClick={closeSidebar}>
            <ShieldAlert size={19} />
            <span>High-Risk Patients</span>
          </a>

          <a
            href="/asha/register"
            className="active"
            onClick={closeSidebar}
          >
            <UserPlus size={19} />
            <span>Register Patient</span>
          </a>

          <a href="/asha/profile" onClick={closeSidebar}>
            <User size={19} />
            <span>My Profile</span>
          </a>

          <a href="/">
            <LogOut size={19} />
            <span>Logout</span>
          </a>
        </nav>

        <div className="asha-sidebar-footer">
          <strong>Anitha</strong>
          <span>ASHA Worker</span>
          <small>Rampur Village</small>
        </div>
      </aside>

      {/* MAIN */}
      <main className="asha-main">
        {/* HEADER */}
        <header className="asha-header">
          <div className="asha-header-left">
            <button
              type="button"
              className="asha-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={24} />
            </button>

            <div>
              <h1>Register Patient</h1>
              <p>
                Add a new patient to the SwasthyaSetu system
              </p>
            </div>
          </div>

          <div className="asha-header-actions">
            <button
              type="button"
              className="asha-icon-button"
              title="Search"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button
              type="button"
              className="asha-icon-button"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <section className="asha-content">
          {/* BREADCRUMB */}
          <div className="asha-breadcrumb">
            <button
              type="button"
              onClick={() => navigate("/asha")}
            >
              Dashboard
            </button>

            <ChevronRight size={16} />

            <span>Register Patient</span>
          </div>

          {/* FORM CARD */}
          <div className="asha-form-container">
            <div className="asha-form-header">
              <div className="asha-form-icon">
                <UserPlus size={28} />
              </div>

              <div>
                <h2>New Patient Registration</h2>
                <p>
                  Enter the patient's basic information and
                  health details.
                </p>
              </div>
            </div>

            {/* SUCCESS MESSAGE */}
            {success && (
              <div
                className="asha-alert asha-alert-success"
                role="status"
                aria-live="polite"
              >
                <span>✓</span>

                <div>
                  <strong>Success</strong>
                  <p>{success}</p>
                </div>
              </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <div
                className="asha-alert asha-alert-error"
                role="alert"
                aria-live="assertive"
              >
                <span>!</span>

                <div>
                  <strong>Registration failed</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* PERSONAL INFORMATION */}
              <div className="asha-form-section">
                <div className="asha-section-title">
                  <User size={20} />
                  <h3>Personal Information</h3>
                </div>

                <div className="asha-form-grid">
                  {/* NAME */}
                  <div className="asha-form-group">
                    <label htmlFor="name">
                      Patient Name <span>*</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        handleChange(
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Enter patient name"
                      autoComplete="name"
                      required
                      disabled={saving}
                    />
                  </div>

                  {/* AGE */}
                  <div className="asha-form-group">
                    <label htmlFor="age">
                      Age <span>*</span>
                    </label>

                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="1"
                      max="120"
                      value={form.age}
                      onChange={(event) =>
                        handleChange(
                          "age",
                          event.target.value,
                        )
                      }
                      placeholder="Enter age"
                      required
                      disabled={saving}
                    />
                  </div>

                  {/* GENDER */}
                  <div className="asha-form-group">
                    <label htmlFor="gender">
                      Gender <span>*</span>
                    </label>

                    <select
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={(event) =>
                        handleChange(
                          "gender",
                          event.target.value,
                        )
                      }
                      required
                      disabled={saving}
                    >
                      <option value="">
                        Select gender
                      </option>
                      <option value="Female">
                        Female
                      </option>
                      <option value="Male">
                        Male
                      </option>
                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  {/* PHONE */}
                  <div className="asha-form-group">
                    <label htmlFor="phone">
                      Phone Number <span>*</span>
                    </label>

                    <div className="asha-input-with-icon">
                      <Phone size={18} />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phone}
                        onChange={(event) =>
                          handleChange(
                            "phone",
                            event.target.value.replace(
                              /\D/g,
                              "",
                            ),
                          )
                        }
                        placeholder="10-digit phone number"
                        autoComplete="tel"
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* LOCATION */}
              <div className="asha-form-section">
                <div className="asha-section-title">
                  <MapPin size={20} />
                  <h3>Location Information</h3>
                </div>

                <div className="asha-form-grid">
                  {/* VILLAGE */}
                  <div className="asha-form-group">
                    <label htmlFor="village">
                      Village
                    </label>

                    <input
                      id="village"
                      name="village"
                      type="text"
                      value={form.village}
                      onChange={(event) =>
                        handleChange(
                          "village",
                          event.target.value,
                        )
                      }
                      placeholder="Enter village name"
                      disabled={saving}
                    />
                  </div>

                  {/* ADDRESS */}
                  <div className="asha-form-group">
                    <label htmlFor="address">
                      Address
                    </label>

                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={form.address}
                      onChange={(event) =>
                        handleChange(
                          "address",
                          event.target.value,
                        )
                      }
                      placeholder="Enter complete address"
                      autoComplete="street-address"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* HEALTH INFORMATION */}
              <div className="asha-form-section">
                <div className="asha-section-title">
                  <Activity size={20} />
                  <h3>Health Information</h3>
                </div>

                <div className="asha-form-grid">
                  {/* EXISTING CONDITION */}
                  <div className="asha-form-group">
                    <label htmlFor="condition">
                      Existing Condition
                    </label>

                    <input
                      id="condition"
                      name="condition"
                      type="text"
                      value={form.condition}
                      onChange={(event) =>
                        handleChange(
                          "condition",
                          event.target.value,
                        )
                      }
                      placeholder="Example: Hypertension, Diabetes"
                      disabled={saving}
                    />
                  </div>

                  {/* SYMPTOMS */}
                  <div className="asha-form-group asha-full-width">
                    <label htmlFor="symptoms">
                      Current Symptoms
                    </label>

                    <textarea
                      id="symptoms"
                      name="symptoms"
                      rows={4}
                      value={form.symptoms}
                      onChange={(event) =>
                        handleChange(
                          "symptoms",
                          event.target.value,
                        )
                      }
                      placeholder="Describe current symptoms"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* EMERGENCY CONTACT */}
              <div className="asha-form-section">
                <div className="asha-section-title">
                  <Phone size={20} />
                  <h3>Emergency Contact</h3>
                </div>

                <div className="asha-form-grid">
                  <div className="asha-form-group">
                    <label htmlFor="emergencyContact">
                      Emergency Contact Number
                    </label>

                    <input
                      id="emergencyContact"
                      name="emergencyContact"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.emergencyContact}
                      onChange={(event) =>
                        handleChange(
                          "emergencyContact",
                          event.target.value.replace(
                            /\D/g,
                            "",
                          ),
                        )
                      }
                      placeholder="10-digit emergency number"
                      autoComplete="tel"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="asha-form-actions">
                <button
                  type="button"
                  className="asha-secondary-button"
                  onClick={() =>
                    navigate("/asha/patients")
                  }
                  disabled={saving}
                >
                  <ArrowLeft size={18} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="asha-primary-button"
                  disabled={saving}
                >
                  <Plus size={18} />

                  {saving
                    ? "Registering..."
                    : "Register Patient"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="asha-footer">
          <div>
            <strong>ASHA Worker:</strong> Anitha
          </div>

          <div>
            <strong>PHC Contact:</strong> 040-12345678
          </div>
        </footer>
      </main>
    </div>
  );
}
