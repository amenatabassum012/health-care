import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CalendarCheck, FileClock, GitBranch, Home, LogOut, UserRound } from "lucide-react"
import { BrandMark } from "@/components/shared/BrandMark"
import { LanguageToggle } from "@/components/shared/LanguageToggle"
import { OfflineBanner } from "@/components/shared/OfflineBanner"
import { SosFab } from "@/components/shared/SosFab"
import { cn } from "@/lib/utils"
import { useSession } from "@/state/session"

const NAV_ITEMS = [
  { to: "/patient/home", icon: Home, key: "nav.home" as const },
  { to: "/patient/appointments", icon: CalendarCheck, key: "nav.appointments" as const },
  { to: "/patient/records", icon: FileClock, key: "nav.records" as const },
  { to: "/patient/referral", icon: GitBranch, key: "nav.referrals" as const },
]

export function PatientLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { setPatient } = useSession()

  return (
    <div
      className="relative flex min-h-svh flex-col bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1758691462743-f9fc9e430d39?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmlydHVhbCUyMGhvc3BpdGFsfGVufDB8fDB8fHww')",
      }}
    >
      <div className="absolute inset-0 bg-background/55" />
      <div className="relative flex min-h-svh flex-1 flex-col">
        <OfflineBanner />
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
          <Link to="/patient/home">
            <BrandMark compact />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle className="h-9 w-[110px] border-none bg-muted text-sm" />
            <Link
              to="/patient/profile"
              aria-label={t("patient.profile.title")}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <UserRound className="size-4" />
            </Link>
            <button
              type="button"
              aria-label={t("nav.logout")}
              onClick={() => {
                setPatient(null)
                navigate("/")
              }}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-24">
          <Outlet />
        </main>

        <SosFab />

        <nav className="sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-stretch justify-around">
            {NAV_ITEMS.map(({ to, icon: Icon, key }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
                    active ? "text-teal" : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("size-5", active && "fill-mint")} />
                  {t(key)}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
