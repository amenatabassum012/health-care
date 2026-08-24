import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Mic, PhoneOff, SignalLow, Video, VideoOff, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CallState = "connecting" | "video" | "audio" | "callback"

export function TeleconsultPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [state, setState] = useState<CallState>("connecting")
  const [weakNetwork, setWeakNetwork] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setState("video"), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (weakNetwork && state === "video") {
      const t = setTimeout(() => setState("audio"), 1500)
      return () => clearTimeout(t)
    }
  }, [weakNetwork, state])

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center rounded-3xl bg-teal-dark px-6 py-10 text-center text-white">
      <div className="mb-6 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">
        {weakNetwork ? (
          <>
            <SignalLow className="size-3.5 text-warning" />
            {t("patient.teleconsult.connectionPoor")}
          </>
        ) : (
          <>
            <Wifi className="size-3.5 text-success" />
            {t("patient.teleconsult.connectionGood")}
          </>
        )}
      </div>

      <span
        className={cn(
          "flex size-24 items-center justify-center rounded-full border-4 border-white/20",
          state === "connecting" && "animate-pulse bg-white/10"
        )}
      >
        {state === "audio" || state === "callback" ? (
          <Mic className="size-10" />
        ) : (
          <Video className="size-10" />
        )}
      </span>

      <p className="mt-6 text-lg font-semibold">
        {state === "connecting" && t("patient.teleconsult.connecting")}
        {state === "video" && t("patient.teleconsult.title")}
        {state === "audio" && t("patient.teleconsult.audioOnly")}
        {state === "callback" && t("patient.teleconsult.requestCallback")}
      </p>

      {state !== "callback" && (
        <div className="mt-10 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon-xl"
            aria-label="Simulate weak network"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setWeakNetwork((v) => !v)}
            title="Simulate weak network"
          >
            <VideoOff className="size-5" />
          </Button>
          <Button
            size="icon-xl"
            aria-label={t("patient.teleconsult.endCall")}
            className="bg-coral text-white hover:bg-coral/90"
            onClick={() => navigate("/patient/home")}
          >
            <PhoneOff className="size-5" />
          </Button>
        </div>
      )}

      {state === "audio" && (
        <Button
          variant="outline"
          size="xl"
          className="mt-6 border-white/30 bg-white/10 text-white hover:bg-white/20"
          onClick={() => setState("callback")}
        >
          {t("patient.teleconsult.requestCallbackButton")}
        </Button>
      )}

      {state === "callback" && (
        <Button size="xl" className="mt-8 bg-white text-teal-dark hover:bg-white/90" onClick={() => navigate("/patient/home")}>
          {t("common.continue")}
        </Button>
      )}
    </div>
  )
}
