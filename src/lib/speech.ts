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
 * Bumped on every stopSpeaking() call (including the one at the start of
 * every speakText()) so an in-flight speakText() whose voice lookup is
 * still pending can tell it's been superseded — by a page navigation, a
 * different Listen tap, or a manual stop — and skip actually starting.
 * Without this, a slow voice lookup can still call speechSynthesis.speak()
 * after the page that requested it has already been left.
 */
let speechToken = 0

export function stopSpeaking() {
  speechToken++
  if (isSpeechSupported()) window.speechSynthesis.cancel()
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
 * Speaks `text` in `lang`. `onEnd` receives whether a real matching voice
 * was found and used — the caller can warn the user when it wasn't, rather
 * than let a wrong-language voice mangle the text silently.
 */
export async function speakText(text: string, lang: string, onEnd?: (voiceFound: boolean) => void) {
  if (!isSpeechSupported() || !text.trim()) return
  const token = ++speechToken
  window.speechSynthesis.cancel()

  const voices = await loadVoices()
  if (token !== speechToken) return // superseded while voices were loading — don't start late
  const voice = findVoice(voices, lang)

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  if (voice) utterance.voice = voice
  utterance.rate = 0.9
  utterance.onend = () => onEnd?.(!!voice)
  utterance.onerror = () => onEnd?.(!!voice)
  window.speechSynthesis.speak(utterance)
}
