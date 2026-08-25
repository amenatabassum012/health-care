import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { isSpeechSupported, speakText, speechLangFor, stopSpeaking } from "@/lib/speech"

/**
 * A listen control for patients who can't read the local script — reads
 * `text` aloud in the currently selected app language. Renders nothing when
 * the browser has no speech synthesis engine.
 *
 * With `autoPlay`, it reads itself as soon as it mounts and again whenever
 * `text` changes while mounted (e.g. moving to the next triage question) —
 * so screens narrate themselves instead of waiting for a tap. It's still a
 * real toggle button underneath: tapping it always stops (or restarts)
 * playback, exactly like the manual case.
 */
export function SpeakButton({
  text,
  autoPlay = false,
  size = "default",
  className,
}: {
  text: string
  autoPlay?: boolean
  size?: "default" | "sm"
  className?: string
}) {
  const { t, i18n } = useTranslation()
  const [speaking, setSpeaking] = useState(false)

  function play() {
    setSpeaking(true)
    speakText(text, speechLangFor(i18n.language), (voiceFound) => {
      setSpeaking(false)
      if (!voiceFound && i18n.language !== "en") {
        toast.error(t("common.noVoiceForLanguage"))
      }
    })
  }

  useEffect(() => {
    if (autoPlay && isSpeechSupported() && text.trim()) play()
    return stopSpeaking
    // Re-run when the text to read changes (e.g. a new triage question),
    // not on every render — `play`/`t` are recreated each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text])

  if (!isSpeechSupported()) return null

  function toggle() {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    play()
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        toggle()
      }}
      aria-label={speaking ? t("common.stopAudio") : t("common.playAudio")}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full transition-colors",
        speaking ? "bg-teal text-white" : "bg-mint text-teal-dark hover:bg-teal/20",
        size === "sm" ? "size-8" : "size-10",
        className
      )}
    >
      {speaking ? (
        <VolumeX className={size === "sm" ? "size-4" : "size-5"} />
      ) : (
        <Volume2 className={size === "sm" ? "size-4" : "size-5"} />
      )}
    </button>
  )
}
