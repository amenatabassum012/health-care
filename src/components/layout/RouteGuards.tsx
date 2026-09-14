import { Navigate, Outlet } from "react-router-dom"
import { useSession } from "@/state/session"

export function RequirePatient() {
  const { patient } = useSession()
  if (!patient) return <Navigate to="/patient/login" replace />
  return <Outlet />
}

export function RequireStaff() {
  const { staff } = useSession()
  if (!staff || staff.verificationStatus !== "Verified") {
    return <Navigate to="/doctor/login" replace />
  }
  return <Outlet />
}

export function RequireFacilityAdmin() {
  const { staff } = useSession()
  if (!staff || staff.verificationStatus !== "Verified") {
    return <Navigate to="/doctor/login" replace />
  }
  if (staff.role !== "FacilityAdmin") {
    return <Navigate to="/doctor/dashboard" replace />
  }
  return <Outlet />
}

export function RequireASHA() {
  const { staff } = useSession()
  if (!staff || staff.verificationStatus !== "Verified" || staff.role !== "ASHA") {
    return <Navigate to="/asha/login" replace />
  }
  return <Outlet />
}
