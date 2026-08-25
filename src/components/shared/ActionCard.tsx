import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"

export function ActionCard({
  to,
  icon: Icon,
  title,
  description,
  tone = "default",
  onClick,
  className,
}: {
  to?: string
  icon: LucideIcon
  title: string
  description?: string
  tone?: "default" | "emergency"
  onClick?: () => void
  className?: string
}) {
  const content = (
    <div
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-sm transition-[transform,box-shadow,background-color]",
        "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        tone === "emergency"
          ? "border-coral/30 bg-coral/5 hover:bg-coral/10"
          : "border-border bg-card hover:bg-mint/40",
        className
      )}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          tone === "emergency" ? "bg-coral text-white" : "bg-mint text-teal-dark"
        )}
      >
        <Icon className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-base font-semibold",
            tone === "emergency" ? "text-coral" : "text-foreground"
          )}
        >
          {title}
        </p>
        {description && (
          <p className="truncate text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className="block w-full">
      {content}
    </button>
  )
}
