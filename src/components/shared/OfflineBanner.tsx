import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { WifiOff } from "lucide-react"

/**
 * Non-blocking, neutral-tone offline indicator — never a blocking modal.
 * See docs/03_Design_Specification.docx §4 (Component System) and .cursorrules §6.
 */
export function OfflineBanner() {
  const { t } = useTranslation()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOnline = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="flex items-center gap-2 bg-muted px-4 py-2 text-sm text-muted-foreground">
      <WifiOff className="size-4 shrink-0" />
      <span>{t("common.offline")}</span>
    </div>
  )
}
