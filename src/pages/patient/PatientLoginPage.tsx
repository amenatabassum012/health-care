import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { ArrowLeft, ShieldCheck, Users } from "lucide-react"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestOtp, verifyOtp } from "@/lib/api/patient"
import { useSession } from "@/state/session"

export function PatientLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setPatient } = useSession()

  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [guardianMode, setGuardianMode] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSendOtp() {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error(t("patient.login.phonePlaceholder"))
      return
    }
    setBusy(true)
    await requestOtp(phone)
    setBusy(false)
    setStep("otp")
  }

  async function handleVerify() {
    setBusy(true)
    const patient = await verifyOtp(phone, otp)
    setBusy(false)
    setPatient({ ...patient, isGuardianManaged: guardianMode })
    navigate("/patient/home")
  }

  return (
    <div
      className="relative flex min-h-svh flex-col items-center justify-center bg-cover bg-center px-5 py-10 sm:px-8"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background/70" />
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-sm">
        <BrandMark className="mb-6" />

        {step === "phone" ? (
          <>
            <h1 className="text-xl font-bold text-foreground">{t("patient.login.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("patient.login.subtitle")}</p>

            <div className="mt-6 space-y-2">
              <Label htmlFor="phone">{t("patient.login.phoneLabel")}</Label>
              <Input
                id="phone"
                inputMode="numeric"
                placeholder={t("patient.login.phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <button
              type="button"
              onClick={() => setGuardianMode((v) => !v)}
              className={`mt-4 flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors ${
                guardianMode ? "border-teal bg-mint" : "border-border bg-background"
              }`}
            >
              <Users className="size-4 shrink-0 text-teal-dark" />
              <span>
                <span className="block font-medium text-foreground">
                  {t("patient.login.guardianToggle")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("patient.login.guardianHint")}
                </span>
              </span>
            </button>

            <Button
              size="xl"
              className="mt-6 w-full bg-teal text-white hover:bg-teal-dark"
              disabled={busy}
              onClick={handleSendOtp}
            >
              {busy ? t("common.loading") : t("patient.login.sendOtp")}
            </Button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {t("patient.login.changeNumber")}
            </button>

            <span className="flex size-12 items-center justify-center rounded-xl bg-mint text-teal-dark">
              <ShieldCheck className="size-6" />
            </span>
            <h1 className="mt-3 text-xl font-bold text-foreground">{t("patient.login.otpLabel")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("patient.login.otpSentTo")} +91 {phone}
            </p>

            <Input
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-6 h-12 text-center text-2xl tracking-[0.5em]"
            />

            <Button
              size="xl"
              className="mt-6 w-full bg-teal text-white hover:bg-teal-dark"
              disabled={busy || otp.length < 4}
              onClick={handleVerify}
            >
              {busy ? t("common.loading") : t("patient.login.verifyOtp")}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
