import { Link } from "react-router-dom"
import { Siren } from "lucide-react"
import { useTranslation } from "react-i18next"

/**
 * Emergency SOS is the one element allowed to break normal layout flow, by
 * design — see docs/03_Design_Specification.docx §4 and .cursorrules §3.
 * Fixed, persistent, reachable from every patient screen.
 */
export function SosFab() {
  const { t } = useTranslation()
  return (
    <Link
      to="/patient/sos"
      aria-label={t("patient.home.emergencySos")}
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-coral px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-coral/30 transition-transform hover:scale-105 active:scale-95 sm:right-6 sm:bottom-6"
    >
      <Siren className="size-5" />
      <span className="hidden sm:inline">{t("patient.home.emergencySos")}</span>
    </Link>
  )
}
