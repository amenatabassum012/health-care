import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { UsersRound } from "lucide-react"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginStaff } from "@/lib/api/doctor"
import { useSession } from "@/state/session"

export default function ASHALoginPage() {
  const navigate = useNavigate()
  const { setStaff } = useSession()

  const [staffId, setStaffId] = useState("")
  const [facilityCode, setFacilityCode] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleLogin() {
    setBusy(true)
    try {
      const staff = await loginStaff(staffId, facilityCode)
      if (staff.role !== "ASHA") {
        toast.error("This account is not registered as an ASHA worker.")
        return
      }
      if (staff.verificationStatus !== "Verified") {
        toast.error("Your account is still pending verification.")
        return
      }
      setStaff(staff)
      toast.success(`Welcome, ${staff.name}`)
      navigate("/asha")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to log in. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="relative flex min-h-svh flex-col items-center justify-center bg-cover bg-center px-5 py-10"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/9574519/pexels-photo-9574519.jpeg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-mint/40 via-background/40 to-background/65" />
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-sm">
        <BrandMark className="mb-6" />
        <span className="flex size-12 items-center justify-center rounded-xl bg-mint text-teal-dark">
          <UsersRound className="size-6" />
        </span>
        <h1 className="mt-3 text-xl font-bold text-foreground">ASHA Worker Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to manage your patients, follow-ups and referrals.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staffId">Worker ID / Mobile Number</Label>
            <Input
              id="staffId"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="e.g. asha-001 or mobile number"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facilityCode">Facility Code</Label>
            <Input
              id="facilityCode"
              value={facilityCode}
              onChange={(e) => setFacilityCode(e.target.value)}
              placeholder="Provided by your PHC"
              className="h-11"
            />
          </div>
        </div>

        {/* Demo login — see TEST_FACILITY_CODE in src/lib/api/doctor.ts (asha-001 / 9876543210) */}
        <p className="mt-3 text-xs text-muted-foreground">
          Demo: Worker ID <code>asha-001</code>, facility code <code>000000</code>
        </p>

        <Button
          size="xl"
          className="mt-6 w-full"
          disabled={busy}
          onClick={handleLogin}
        >
          {busy ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </div>
  )
}
