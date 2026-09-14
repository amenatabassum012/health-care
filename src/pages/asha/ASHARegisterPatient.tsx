import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  Plus,
  User,
  UserPlus,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-foreground">
        <Icon className="size-4.5 text-teal" />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function ASHARegisterPatient() {
  const navigate = useNavigate();

  const [form, setForm] = useState<PatientForm>(initialForm);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof PatientForm, value: string): void => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = (): string | null => {
    const name = form.name.trim();
    const age = Number(form.age);
    const phone = form.phone.trim();
    const emergencyContact = form.emergencyContact.trim();

    if (!name) return "Please enter the patient's name.";
    if (!form.age.trim()) return "Please enter the patient's age.";
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return "Please enter a valid age between 1 and 120.";
    }
    if (!form.gender) return "Please select the patient's gender.";
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }
    if (emergencyContact && !/^[6-9]\d{9}$/.test(emergencyContact)) {
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
        return "You do not have permission to register patients. Please check your Supabase Row Level Security policy.";
      }
      if (supabaseError.code === "42P01") {
        return "The patients table was not found in Supabase. Please check your database table name.";
      }
      if (supabaseError.code === "42703") {
        return "One of the patient fields does not match the Supabase patients table schema.";
      }
      if (supabaseError.message) return supabaseError.message;
      if (supabaseError.details) return supabaseError.details;
      if (supabaseError.hint) return supabaseError.hint;
    }

    if (err instanceof Error && err.message) return err.message;

    return "Unable to register the patient. Please try again.";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
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
      const { error: insertError } = await supabase.from("patients").insert({
        name: form.name.trim(),
        age: Number(form.age),
        phone: form.phone.trim(),
        gender: form.gender,
        village: form.village.trim() || null,
        address: form.address.trim() || null,
        condition: form.condition.trim() || null,
        symptoms: form.symptoms.trim() || null,
        emergency_contact: form.emergencyContact.trim() || null,
      });

      if (insertError) throw insertError;

      setSuccess("Patient registered successfully. Redirecting to My Patients...");
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Register Patient</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new patient to the SwasthyaSetu system.
        </p>
      </div>

      {/* FORM CARD HEADER */}

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mint text-teal-dark">
          <UserPlus className="size-6" />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">New Patient Registration</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Enter the patient's basic information and health details.
          </p>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}

      {success && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <strong className="text-sm font-semibold text-success">Success</strong>
            <p className="mt-0.5 text-sm text-foreground/80">{success}</p>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <strong className="text-sm font-semibold text-destructive">Registration failed</strong>
            <p className="mt-0.5 text-sm text-foreground/80">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* PERSONAL INFORMATION */}

        <FormSection icon={User} title="Personal Information">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Patient Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Enter patient name"
              autoComplete="name"
              required
              disabled={saving}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="age">
              Age <span className="text-destructive">*</span>
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={(event) => handleChange("age", event.target.value)}
              placeholder="Enter age"
              required
              disabled={saving}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender">
              Gender <span className="text-destructive">*</span>
            </Label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={(event) => handleChange("gender", event.target.value)}
              required
              disabled={saving}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(event) =>
                  handleChange("phone", event.target.value.replace(/\D/g, ""))
                }
                placeholder="10-digit phone number"
                autoComplete="tel"
                required
                disabled={saving}
                className="h-10 pl-9"
              />
            </div>
          </div>
        </FormSection>

        {/* LOCATION */}

        <FormSection icon={MapPin} title="Location Information">
          <div className="space-y-1.5">
            <Label htmlFor="village">Village</Label>
            <Input
              id="village"
              name="village"
              type="text"
              value={form.village}
              onChange={(event) => handleChange("village", event.target.value)}
              placeholder="Enter village name"
              disabled={saving}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={(event) => handleChange("address", event.target.value)}
              placeholder="Enter complete address"
              autoComplete="street-address"
              disabled={saving}
              className="h-10"
            />
          </div>
        </FormSection>

        {/* HEALTH INFORMATION */}

        <FormSection icon={Activity} title="Health Information">
          <div className="space-y-1.5">
            <Label htmlFor="condition">Existing Condition</Label>
            <Input
              id="condition"
              name="condition"
              type="text"
              value={form.condition}
              onChange={(event) => handleChange("condition", event.target.value)}
              placeholder="Example: Hypertension, Diabetes"
              disabled={saving}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="symptoms">Current Symptoms</Label>
            <Textarea
              id="symptoms"
              name="symptoms"
              rows={4}
              value={form.symptoms}
              onChange={(event) => handleChange("symptoms", event.target.value)}
              placeholder="Describe current symptoms"
              disabled={saving}
            />
          </div>
        </FormSection>

        {/* EMERGENCY CONTACT */}

        <FormSection icon={Phone} title="Emergency Contact">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="emergencyContact">Emergency Contact Number</Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.emergencyContact}
              onChange={(event) =>
                handleChange("emergencyContact", event.target.value.replace(/\D/g, ""))
              }
              placeholder="10-digit emergency number"
              autoComplete="tel"
              disabled={saving}
              className="h-10 sm:max-w-xs"
            />
          </div>
        </FormSection>

        {/* ACTIONS */}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/asha/patients")}
            disabled={saving}
          >
            <ArrowLeft className="size-4" />
            Cancel
          </Button>

          <Button type="submit" size="lg" disabled={saving}>
            <Plus className="size-4" />
            {saving ? "Registering..." : "Register Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
}
