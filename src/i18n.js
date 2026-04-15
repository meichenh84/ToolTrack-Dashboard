import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import zhTW from "./locales/zh-TW.json";
import zhCN from "./locales/zh-CN.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en:     { translation: en },
      "zh-TW": { translation: zhTW },
      "zh-CN": { translation: zhCN },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "zh-TW", "zh-CN"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "lang",
      caches: ["localStorage"],
      convertDetectedLanguage(lng) {
        if (/^zh[-_]TW$/i.test(lng)) return "zh-TW";
        if (/^zh/i.test(lng)) return "zh-CN";
        return "en";
      },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
