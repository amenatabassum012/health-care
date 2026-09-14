import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  HeartPulse,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react"
import { BrandMark } from "@/components/shared/BrandMark"
import { LanguageToggle } from "@/components/shared/LanguageToggle"

export function RoleSelectPage() {
  const { t } = useTranslation()

  return (
    <div
      className="relative flex min-h-svh flex-col bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/9574519/pexels-photo-9574519.jpeg')",
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-mint/40 via-background/30 to-background/60" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <BrandMark />

        <LanguageToggle className="h-10 w-[130px] border-border bg-card" />
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 py-8 text-center sm:px-8">

        {/* Heart Icon */}
        <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-teal-dark text-white shadow-lg shadow-teal-dark/20">
          <HeartPulse className="size-8" />
        </span>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold tracking-tight text-teal-dark sm:text-4xl">
          {t("role.chooseRole")}
        </h1>

        <p className="mt-2 max-w-md text-muted-foreground">
          {t("role.chooseRoleSubtitle")}
        </p>

        {/* Role Cards */}
        <div className="mt-10 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* ================= PATIENT ================= */}
          <Link
            to="/patient/language"
            className="group flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-teal hover:shadow-xl"
          >
            <span className="flex size-16 items-center justify-center rounded-2xl bg-mint text-teal-dark transition-colors group-hover:bg-teal group-hover:text-white">
              <UserRound className="size-8" />
            </span>

            <div>
              <p className="text-xl font-bold text-foreground">
                {t("role.patientGuardian")}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("role.patientGuardianDesc")}
              </p>
            </div>
          </Link>

          {/* ================= DOCTOR ================= */}
          <Link
            to="/doctor/login"
            className="group flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-brand-blue hover:shadow-xl"
          >
            <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
              <Stethoscope className="size-8" />
            </span>

            <div>
              <p className="text-xl font-bold text-foreground">
                {t("role.doctorHealthWorker")}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("role.doctorHealthWorkerDesc")}
              </p>
            </div>
          </Link>

          {/* ================= ASHA WORKER ================= */}
          <Link
            to="/asha/login"
            className="group flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-teal hover:shadow-xl"
          >
            <span className="flex size-16 items-center justify-center rounded-2xl bg-mint text-teal-dark transition-colors group-hover:bg-teal group-hover:text-white">
              <UsersRound className="size-8" />
            </span>

            <div>
              <p className="text-xl font-bold text-foreground">
                ASHA Worker
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage patients, follow-ups and referrals
              </p>
            </div>
          </Link>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-5 py-6 text-center text-xs text-muted-foreground">
        {t("app.name")} — {t("role.chooseRoleSubtitle")}
      </footer>
    </div>
  )
}
