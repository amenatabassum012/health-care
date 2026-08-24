import { useTranslation } from "react-i18next"
import { Languages } from "lucide-react"
import { SUPPORTED_LANGUAGES } from "@/lib/i18n"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function LanguageToggle({ className }: { className?: string }) {
  const { i18n } = useTranslation()

  return (
    <Select value={i18n.language} onValueChange={(v) => v && i18n.changeLanguage(v)}>
      <SelectTrigger className={className} aria-label="Select language">
        <Languages className="size-4 text-muted-foreground" />
        <SelectValue>
          {() => SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language)?.nativeLabel ?? i18n.language}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.nativeLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
