import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import en from "@/locales/en/common.json"
import hi from "@/locales/hi/common.json"

export const SUPPORTED_LANGUAGES = [
  { code: "en", nativeLabel: "English" },
  { code: "hi", nativeLabel: "हिंदी" },
] as const

const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map((l) => l.code) as string[]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      hi: { common: hi },
    },
    fallbackLng: "en",
    defaultNS: "common",
    supportedLngs: SUPPORTED_CODES,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "rhc_language",
    },
  })
  .then(() => {
    // Belt-and-suspenders: some browser locales (e.g. "en-GB") can slip
    // through detection un-normalized. Force back to a language we ship.
    if (!SUPPORTED_CODES.includes(i18n.language)) {
      i18n.changeLanguage("en")
    }
  })

export default i18n
