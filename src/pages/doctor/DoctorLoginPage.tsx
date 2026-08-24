import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { ShieldAlert, Stethoscope } from "lucide-react"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginStaff } from "@/lib/api/doctor"
import { useSession } from "@/state/session"

export function DoctorLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setStaff } = useSession()

  const [staffId, setStaffId] = useState("")
  const [facilityCode, setFacilityCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [pendingBlock, setPendingBlock] = useState(false)

  async function handleLogin() {
    setBusy(true)
    const staff = await loginStaff(staffId)
    setBusy(false)

    if (staff.verificationStatus !== "Verified") {
      setPendingBlock(true)
      setStaff(staff)
      return
    }
    setStaff(staff)
    toast.success(`${t("doctor.dashboard.scopedTo")} ${staff.name}`)
    if (staff.role === "FacilityAdmin") navigate("/doctor/verification")
    else navigate("/doctor/dashboard")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-brand-blue/5 via-background to-background px-5 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-sm">
        <BrandMark className="mb-6" />
        <span className="flex size-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
          <Stethoscope className="size-6" />
        </span>
        <h1 className="mt-3 text-xl font-bold text-foreground">{t("doctor.login.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("doctor.login.subtitle")}</p>

        {pendingBlock && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
            {t("doctor.login.pendingBlock")}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staffId">{t("doctor.login.staffId")}</Label>
            <Input
              id="staffId"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="9876500011"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facilityCode">{t("doctor.login.facilityCode")}</Label>
            <Input
              id="facilityCode"
              value={facilityCode}
              onChange={(e) => setFacilityCode(e.target.value)}
              placeholder="FAC-PHC-001"
              className="h-11"
            />
          </div>
        </div>

        <Button
          size="xl"
          className="mt-6 w-full bg-brand-blue text-white hover:bg-brand-blue/90"
          disabled={busy}
          onClick={handleLogin}
        >
          {busy ? t("common.loading") : t("doctor.login.login")}
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {t("doctor.login.noAccount")}{" "}
          <Link to="/doctor/register" className="font-semibold text-brand-blue hover:underline">
            {t("doctor.login.register")}
          </Link>
        </p>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Demo: try any number, or leave blank and log in to see the verified-doctor dashboard.
        </p>
      </div>
    </div>
  )
}
