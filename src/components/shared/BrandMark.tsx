import { HeartPulse } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useTranslation()
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-teal-dark text-white shadow-sm">
        <HeartPulse className="size-5" />
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight text-teal-dark">{t("app.name")}</span>
      )}
    </div>
  )
}
