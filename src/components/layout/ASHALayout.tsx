import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  BadgeCheck,
  ClipboardList,
  HeartHandshake,
  Hospital,
  LayoutDashboard,
  LogOut,
  UserPlus,
  Users,
} from "lucide-react"
import { BrandMark } from "@/components/shared/BrandMark"
import { OfflineBanner } from "@/components/shared/OfflineBanner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useSession } from "@/state/session"

const NAV_ITEMS = [
  { to: "/asha", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/asha/patients", icon: Users, label: "My Patients" },
  { to: "/asha/requests", icon: HeartHandshake, label: "Case Requests" },
  { to: "/asha/followups", icon: ClipboardList, label: "Follow-ups" },
  { to: "/asha/referrals", icon: Hospital, label: "Referrals" },
  { to: "/asha/high-risk", icon: AlertTriangle, label: "High-Risk Patients" },
  { to: "/asha/register", icon: UserPlus, label: "Register Patient" },
  { to: "/asha/profile", icon: BadgeCheck, label: "My Profile" },
]

export function ASHALayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { staff, setStaff } = useSession()
  const initial = staff?.name?.charAt(0).toUpperCase() ?? "A"

  return (
    <div className="relative flex min-h-svh bg-background">
      <div className="relative flex min-h-svh flex-1">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
          <div className="border-b border-border px-5 py-4">
            <BrandMark />
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to
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
              Logout
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
              <span className="font-semibold text-foreground">{staff?.name ?? "ASHA Worker"}</span>
            </div>
            <Link
              to="/asha/profile"
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-muted"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight">{staff?.name ?? "ASHA Worker"}</p>
                <p className="text-xs leading-tight text-muted-foreground">ASHA Worker</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-teal text-white">{initial}</AvatarFallback>
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
