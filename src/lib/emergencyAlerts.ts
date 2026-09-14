export interface EmergencyAlert {
  id: string
  patientId: string
  patientName: string
  facilityName: string
  createdAt: string
  status: "Active" | "Acknowledged"
}

const STORAGE_KEY = "rhc_emergency_alerts"
const EVENT_NAME = "rhc-emergency-alert"

function readAlerts(): EmergencyAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as EmergencyAlert[]) : []
  } catch {
    return []
  }
}

function writeAlerts(alerts: EmergencyAlert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

export function getEmergencyAlerts(): EmergencyAlert[] {
  return readAlerts()
}

export function pushEmergencyAlert(input: {
  patientId: string
  patientName: string
  facilityName: string
}): EmergencyAlert {
  const alert: EmergencyAlert = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "Active",
    ...input,
  }
  writeAlerts([alert, ...readAlerts()])
  return alert
}

export function acknowledgeEmergencyAlert(id: string) {
  writeAlerts(
    readAlerts().map((a) => (a.id === id ? { ...a, status: "Acknowledged" } : a))
  )
}

/** Fires `onChange` whenever alerts change, in this tab or another tab. Returns an unsubscribe function. */
export function subscribeEmergencyAlerts(onChange: () => void) {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange()
  }
  window.addEventListener("storage", handleStorage)
  window.addEventListener(EVENT_NAME, onChange)
  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(EVENT_NAME, onChange)
  }
}

/** Plays a short siren-like tone using the Web Audio API — no audio asset needed. */
export function playEmergencyAlertSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    const playTone = (startAt: number, freq: number, duration: number) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(freq, startAt)
      gain.gain.setValueAtTime(0, startAt)
      gain.gain.linearRampToValueAtTime(0.25, startAt + 0.02)
      gain.gain.linearRampToValueAtTime(0, startAt + duration)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(startAt)
      oscillator.stop(startAt + duration)
    }

    // Two-tone alternating siren, repeated twice.
    for (let i = 0; i < 2; i++) {
      const base = now + i * 0.6
      playTone(base, 880, 0.28)
      playTone(base + 0.3, 660, 0.28)
    }

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Audio isn't available (autoplay restrictions, unsupported browser) — fail silently.
  }
}
