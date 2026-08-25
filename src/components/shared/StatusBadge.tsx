import { cn } from "@/lib/utils"
import { AlertTriangle, BadgeCheck, CheckCircle2, Clock3, Info } from "lucide-react"

export type StatusTone = "emergency" | "pending" | "confirmed" | "completed" | "info"

const TONE_STYLES: Record<StatusTone, string> = {
  emergency: "bg-coral/10 text-coral border-coral/30",
  pending: "bg-warning/10 text-warning border-warning/30",
  confirmed: "bg-brand-blue/10 text-brand-blue border-brand-blue/30",
  completed: "bg-success/10 text-success border-success/30",
  info: "bg-teal-mid/10 text-teal-dark border-teal-mid/30",
}

const TONE_ICON: Record<StatusTone, React.ComponentType<{ className?: string }>> = {
  emergency: AlertTriangle,
  pending: Clock3,
  confirmed: BadgeCheck,
  completed: CheckCircle2,
  info: Info,
}

export function StatusBadge({
  tone,
  label,
  className,
}: {
  tone: StatusTone
  label: string
  className?: string
}) {
  const Icon = TONE_ICON[tone]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        TONE_STYLES[tone],
        className
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}
