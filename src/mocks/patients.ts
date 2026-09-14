import type { Patient } from "@/types"

/** Seed identity used by the demo/test OTP login numbers — see api/patient.ts. */
export const MOCK_PATIENT: Patient = {
  id: "pat-001",
  name: "Suman Devi",
  phone: "9123456780",
  dob: "1988-04-12",
  gender: "Female",
  preferredLanguage: "hi",
  isGuardianManaged: false,
}
