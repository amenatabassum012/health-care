import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { Patient, StaffUser } from "@/types"

interface SessionState {
  patient: Patient | null
  setPatient: (p: Patient | null) => void
  staff: StaffUser | null
  setStaff: (s: StaffUser | null) => void
}

const SessionContext = createContext<SessionState | null>(null)

const PATIENT_KEY = "rhc_patient_session"
const STAFF_KEY = "rhc_staff_session"

function readSession<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [patient, setPatientState] = useState<Patient | null>(() => readSession<Patient>(PATIENT_KEY))
  const [staff, setStaffState] = useState<StaffUser | null>(() => readSession<StaffUser>(STAFF_KEY))

  const setPatient = (p: Patient | null) => {
    setPatientState(p)
    if (p) localStorage.setItem(PATIENT_KEY, JSON.stringify(p))
    else localStorage.removeItem(PATIENT_KEY)
  }

  const setStaff = (s: StaffUser | null) => {
    setStaffState(s)
    if (s) localStorage.setItem(STAFF_KEY, JSON.stringify(s))
    else localStorage.removeItem(STAFF_KEY)
  }

  const value = useMemo(
    () => ({ patient, setPatient, staff, setStaff }),
    [patient, staff]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within SessionProvider")
  return ctx
}
