import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { PatientLayout } from "@/components/layout/PatientLayout"
import { DoctorLayout } from "@/components/layout/DoctorLayout"
import { RequireFacilityAdmin, RequirePatient, RequireStaff } from "@/components/layout/RouteGuards"

import { RoleSelectPage } from "@/pages/RoleSelectPage"

import { LanguageSelectPage } from "@/pages/patient/LanguageSelectPage"
import { PatientLoginPage } from "@/pages/patient/PatientLoginPage"
import { PatientHomePage } from "@/pages/patient/PatientHomePage"
import { TriagePage } from "@/pages/patient/TriagePage"
import { BookingPage } from "@/pages/patient/BookingPage"
import { TeleconsultPage } from "@/pages/patient/TeleconsultPage"
import { RecordsPage } from "@/pages/patient/RecordsPage"
import { ReferralPage } from "@/pages/patient/ReferralPage"
import { MedicinePage } from "@/pages/patient/MedicinePage"
import { SosPage } from "@/pages/patient/SosPage"

import { DoctorLoginPage } from "@/pages/doctor/DoctorLoginPage"
import { DoctorRegisterPage } from "@/pages/doctor/DoctorRegisterPage"
import { DoctorDashboardPage } from "@/pages/doctor/DoctorDashboardPage"
import { ConsultationPage } from "@/pages/doctor/ConsultationPage"
import { AdminVerificationPage } from "@/pages/doctor/AdminVerificationPage"
import { FacilityDashboardPage } from "@/pages/doctor/FacilityDashboardPage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelectPage />} />

        <Route path="/patient/language" element={<LanguageSelectPage />} />
        <Route path="/patient/login" element={<PatientLoginPage />} />
        <Route element={<RequirePatient />}>
          <Route element={<PatientLayout />}>
            <Route path="/patient/home" element={<PatientHomePage />} />
            <Route path="/patient/triage" element={<TriagePage />} />
            <Route path="/patient/booking" element={<BookingPage />} />
            <Route path="/patient/teleconsult" element={<TeleconsultPage />} />
            <Route path="/patient/records" element={<RecordsPage />} />
            <Route path="/patient/referral" element={<ReferralPage />} />
            <Route path="/patient/medicine" element={<MedicinePage />} />
            <Route path="/patient/sos" element={<SosPage />} />
          </Route>
        </Route>

        <Route path="/doctor/login" element={<DoctorLoginPage />} />
        <Route path="/doctor/register" element={<DoctorRegisterPage />} />
        <Route element={<RequireStaff />}>
          <Route element={<DoctorLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
            <Route path="/doctor/consultation/:appointmentId" element={<ConsultationPage />} />
            <Route element={<RequireFacilityAdmin />}>
              <Route path="/doctor/verification" element={<AdminVerificationPage />} />
              <Route path="/doctor/facility" element={<FacilityDashboardPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
