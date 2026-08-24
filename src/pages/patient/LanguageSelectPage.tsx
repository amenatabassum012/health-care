import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Check, Languages } from "lucide-react"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { SUPPORTED_LANGUAGES } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function LanguageSelectPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh flex-col items-center bg-background px-5 py-10 sm:px-8">
      <BrandMark className="mb-8" />
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-mint text-teal-dark">
        <Languages className="size-7" />
      </span>
      <h1 className="text-2xl font-bold text-foreground">{t("lang.selectLanguage")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("lang.selectLanguageSubtitle")}</p>

      <div className="mt-8 grid w-full max-w-sm gap-3">
        {SUPPORTED_LANGUAGES.map((l) => {
          const active = i18n.language === l.code
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => i18n.changeLanguage(l.code)}
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-lg font-semibold transition-colors",
                active
                  ? "border-teal bg-mint text-teal-dark"
                  : "border-border bg-card text-foreground hover:border-teal-mid"
              )}
            >
              {l.nativeLabel}
              {active && <Check className="size-5 text-teal" />}
            </button>
          )
        })}
      </div>

      <Button
        size="xl"
        className="mt-10 w-full max-w-sm bg-teal text-white hover:bg-teal-dark"
        onClick={() => navigate("/patient/login")}
      >
        {t("lang.continueIn")}
      </Button>
    </div>
  )
}
