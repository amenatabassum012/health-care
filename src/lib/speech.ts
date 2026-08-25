/**
 * Thin wrapper around the browser's built-in Web Speech API (SpeechSynthesis)
 * so illiterate/low-literacy patients can have key screens read aloud —
 * no network call, works with the app's offline-first design.
 *
 * Voice availability (especially Hindi/Telugu) is entirely device-dependent —
 * many desktop browsers ship no Indian-language voice at all. We explicitly
 * look up a matching installed voice rather than trusting the browser to
 * auto-select one from `utterance.lang`, since an unmatched lang tag is
 * often silently swapped for a wrong-sounding default voice instead of
 * failing loudly.
 */
const SPEECH_LANG_MAP: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
}

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

export function speechLangFor(i18nLanguage: string) {
  return SPEECH_LANG_MAP[i18nLanguage] ?? "en-IN"
}

/**
 * Bumped on every stopSpeaking() call so an in-flight speakText() whose
 * voice lookup is still pending can tell it's been superseded — by a page
 * navigation, a different Listen tap, or a manual stop — and skip actually
 * starting. Without this, a slow voice lookup can still call
 * speechSynthesis.speak() after the page that requested it has already
 * been left.
 */
let speechToken = 0

const STOP_EVENT = "rhc:speech-stopped"

/**
 * Stops any playback and tells every mounted Listen button to reset its own
 * icon back to idle — not just the one that triggered the stop. Needed
 * because the stop can come from outside any button entirely (navigation,
 * backgrounding the app, closing it), and because relying on the browser to
 * fire the cancelled utterance's onend/onerror isn't reliable enough across
 * browsers to be the only path back to idle.
 */
export function stopSpeaking() {
  speechToken++
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel()
    window.dispatchEvent(new Event(STOP_EVENT))
  }
}

/** Subscribes to stopSpeaking(); returns an unsubscribe function. */
export function onSpeechStopped(handler: () => void) {
  if (!isSpeechSupported()) return () => {}
  window.addEventListener(STOP_EVENT, handler)
  return () => window.removeEventListener(STOP_EVENT, handler)
}

/**
 * speechSynthesis is a page-wide singleton, not tied to any one component's
 * lifecycle, so it needs to be silenced the moment the patient leaves the
 * app entirely — backgrounding the browser/tab, switching apps on the
 * phone, or closing it outright — not just on in-app navigation. Registered
 * once at module load.
 */
if (isSpeechSupported()) {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopSpeaking()
  })
  window.addEventListener("pagehide", stopSpeaking)
}

let cachedVoicesPromise: Promise<SpeechSynthesisVoice[]> | null = null

/**
 * Voices load asynchronously in most browsers — an immediate getVoices()
 * call right after page load very often returns an empty list. This waits
 * for the real list (via the voiceschanged event) with a timeout fallback
 * for browsers that never fire it.
 */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) return Promise.resolve([])
  const existing = window.speechSynthesis.getVoices()
  if (existing.length) return Promise.resolve(existing)
  if (cachedVoicesPromise) return cachedVoicesPromise

  cachedVoicesPromise = new Promise((resolve) => {
    const handle = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length) {
        window.speechSynthesis.removeEventListener("voiceschanged", handle)
        resolve(voices)
      }
    }
    window.speechSynthesis.addEventListener("voiceschanged", handle)
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", handle)
      resolve(window.speechSynthesis.getVoices())
    }, 1500)
  })
  return cachedVoicesPromise
}

function findVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const exact = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase())
  if (exact) return exact
  const langPrefix = lang.split("-")[0].toLowerCase()
  return voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix))
}

/**
 * Speaks `text` in `lang`. Stops whatever was playing first (broadcasting
 * the stop so other buttons reset), then starts — `onStart` fires right
 * before playback actually begins, after that broadcast, so the caller can
 * safely mark itself as the one now speaking without the broadcast
 * immediately undoing it. `onEnd` receives whether a real matching voice
 * was found and used, so the caller can warn the user when it wasn't
 * rather than let a wrong-language voice mangle the text silently.
 */
export async function speakText(
  text: string,
  lang: string,
  callbacks?: { onStart?: () => void; onEnd?: (voiceFound: boolean) => void }
) {
  if (!isSpeechSupported() || !text.trim()) return
  stopSpeaking()
  const token = speechToken

  const voices = await loadVoices()
  if (token !== speechToken) return // superseded while voices were loading — don't start late
  const voice = findVoice(voices, lang)

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  if (voice) utterance.voice = voice
  utterance.rate = 0.9
  utterance.onend = () => callbacks?.onEnd?.(!!voice)
  utterance.onerror = () => callbacks?.onEnd?.(!!voice)
  callbacks?.onStart?.()
  window.speechSynthesis.speak(utterance)
}
