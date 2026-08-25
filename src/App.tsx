import { lazy, Suspense, useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"

import { PatientLayout } from "@/components/layout/PatientLayout"
import { DoctorLayout } from "@/components/layout/DoctorLayout"
import { RequireFacilityAdmin, RequirePatient, RequireStaff } from "@/components/layout/RouteGuards"
import { stopSpeaking } from "@/lib/speech"

const RoleSelectPage = lazy(() => import("@/pages/RoleSelectPage").then((m) => ({ default: m.RoleSelectPage })))

const LanguageSelectPage = lazy(() => import("@/pages/patient/LanguageSelectPage").then((m) => ({ default: m.LanguageSelectPage })))
const PatientLoginPage = lazy(() => import("@/pages/patient/PatientLoginPage").then((m) => ({ default: m.PatientLoginPage })))
const PatientHomePage = lazy(() => import("@/pages/patient/PatientHomePage").then((m) => ({ default: m.PatientHomePage })))
const MyAppointmentsPage = lazy(() => import("@/pages/patient/MyAppointmentsPage").then((m) => ({ default: m.MyAppointmentsPage })))
const DoctorProfilePage = lazy(() => import("@/pages/patient/DoctorProfilePage").then((m) => ({ default: m.DoctorProfilePage })))
const TriagePage = lazy(() => import("@/pages/patient/TriagePage").then((m) => ({ default: m.TriagePage })))
const BookingPage = lazy(() => import("@/pages/patient/BookingPage").then((m) => ({ default: m.BookingPage })))
const TeleconsultPage = lazy(() => import("@/pages/patient/TeleconsultPage").then((m) => ({ default: m.TeleconsultPage })))
const RecordsPage = lazy(() => import("@/pages/patient/RecordsPage").then((m) => ({ default: m.RecordsPage })))
const ReferralPage = lazy(() => import("@/pages/patient/ReferralPage").then((m) => ({ default: m.ReferralPage })))
const MedicinePage = lazy(() => import("@/pages/patient/MedicinePage").then((m) => ({ default: m.MedicinePage })))
const SosPage = lazy(() => import("@/pages/patient/SosPage").then((m) => ({ default: m.SosPage })))

const DoctorLoginPage = lazy(() => import("@/pages/doctor/DoctorLoginPage").then((m) => ({ default: m.DoctorLoginPage })))
const DoctorRegisterPage = lazy(() => import("@/pages/doctor/DoctorRegisterPage").then((m) => ({ default: m.DoctorRegisterPage })))
const DoctorDashboardPage = lazy(() => import("@/pages/doctor/DoctorDashboardPage").then((m) => ({ default: m.DoctorDashboardPage })))
const MyPatientsPage = lazy(() => import("@/pages/doctor/MyPatientsPage").then((m) => ({ default: m.MyPatientsPage })))
const ProfilePage = lazy(() => import("@/pages/doctor/ProfilePage").then((m) => ({ default: m.ProfilePage })))
const ConsultationPage = lazy(() => import("@/pages/doctor/ConsultationPage").then((m) => ({ default: m.ConsultationPage })))
const AdminVerificationPage = lazy(() => import("@/pages/doctor/AdminVerificationPage").then((m) => ({ default: m.AdminVerificationPage })))
const FacilityDashboardPage = lazy(() => import("@/pages/doctor/FacilityDashboardPage").then((m) => ({ default: m.FacilityDashboardPage })))

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-svh flex-1 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-teal" />
    </div>
  )
}

/**
 * Any audio a page is reading aloud must stop the moment the patient
 * navigates away — otherwise it keeps talking over whatever screen they
 * land on next. Component unmount cleanup alone isn't reliable here (a
 * slow voice lookup can still start speech after its own page unmounted),
 * so this stops it deterministically on every route change instead.
 */
function StopSpeechOnNavigate() {
  const location = useLocation()
  useEffect(() => {
    stopSpeaking()
  }, [location.pathname])
  return null
}

export function App() {
  return (
    <BrowserRouter>
      <StopSpeechOnNavigate />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<RoleSelectPage />} />

          <Route path="/patient/language" element={<LanguageSelectPage />} />
          <Route path="/patient/login" element={<PatientLoginPage />} />
          <Route element={<RequirePatient />}>
            <Route element={<PatientLayout />}>
              <Route path="/patient/home" element={<PatientHomePage />} />
              <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
              <Route path="/patient/doctor/:doctorId" element={<DoctorProfilePage />} />
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
              <Route path="/doctor/patients" element={<MyPatientsPage />} />
              <Route path="/doctor/profile" element={<ProfilePage />} />
              <Route path="/doctor/consultation/:appointmentId" element={<ConsultationPage />} />
              <Route element={<RequireFacilityAdmin />}>
                <Route path="/doctor/verification" element={<AdminVerificationPage />} />
                <Route path="/doctor/facility" element={<FacilityDashboardPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
