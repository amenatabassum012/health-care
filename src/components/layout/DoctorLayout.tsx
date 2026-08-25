import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  BadgeCheck,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react"
import { BrandMark } from "@/components/shared/BrandMark"
import { OfflineBanner } from "@/components/shared/OfflineBanner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useSession } from "@/state/session"
import { MOCK_FACILITIES, MOCK_SPECIALTIES } from "@/mocks/facilities"

export function DoctorLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { staff, setStaff } = useSession()

  const facility = MOCK_FACILITIES.find((f) => f.id === staff?.facilityId)
  const specialty = MOCK_SPECIALTIES.find((s) => s.id === staff?.specialtyId)

  const navItems = [
    { to: "/doctor/dashboard", icon: LayoutDashboard, label: t("doctor.dashboard.title") },
    ...(staff?.role === "FacilityAdmin"
      ? [
          { to: "/doctor/verification", icon: ShieldCheck, label: t("doctor.admin.verificationQueue") },
          { to: "/doctor/facility", icon: Gauge, label: t("doctor.admin.facilityDashboard") },
        ]
      : [
          { to: "/doctor/patients", icon: Users, label: t("doctor.patients.title") },
          { to: "/doctor/consultation/appt-001", icon: ClipboardList, label: t("doctor.consultation.title") },
        ]),
    { to: "/doctor/profile", icon: BadgeCheck, label: t("doctor.profile.title") },
  ]

  return (
    <div
      className="relative flex min-h-svh bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZG9jdG9yfGVufDB8fDB8fHww')",
      }}
    >
      <div className="absolute inset-0 bg-background/75" />
      <div className="relative flex min-h-svh flex-1">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
          <div className="border-b border-border px-5 py-4">
            <BrandMark />
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = location.pathname.startsWith(to.split("/").slice(0, 3).join("/"))
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-teal text-white" : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={() => {
                setStaff(null)
                navigate("/")
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <LogOut className="size-4" />
              {t("nav.logout")}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <OfflineBanner />
          <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
            <div className="md:hidden">
              <BrandMark compact />
            </div>
            <div className="hidden text-sm text-muted-foreground md:block">
              {t("doctor.dashboard.scopedTo")}{" "}
              <span className="font-semibold text-foreground">{facility?.name}</span>
              {specialty && (
                <>
                  {" "}
                  · <span className="font-semibold text-foreground">{specialty.label}</span>
                </>
              )}
            </div>
            <Link
              to="/doctor/profile"
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-muted"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight">{staff?.name}</p>
                <p className="text-xs leading-tight text-muted-foreground">{staff?.role}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-brand-blue text-white">
                  {staff?.name?.slice(0, 1) ?? "?"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
