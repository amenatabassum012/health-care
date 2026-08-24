import type { ComponentType } from "react"
import { cn } from "@/lib/utils"

export function EmptyState({
  illustration: Illustration,
  title,
  description,
  className,
}: {
  illustration: ComponentType<{ className?: string }>
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-2xl bg-muted p-8 text-center", className)}>
      <Illustration className="h-28 w-auto text-teal-mid" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}
