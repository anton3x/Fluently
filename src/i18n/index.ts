import { getLocales } from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import { languages, type Language } from "@/db/schema";

import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import pt from "./locales/pt.json";
import { DEFAULT_LANGUAGE } from "@/constants";

const deviceLanguage = getLocales()[0]?.languageCode;
const initialLanguage =
  deviceLanguage && languages.includes(deviceLanguage as Language)
    ? deviceLanguage
    : DEFAULT_LANGUAGE;
const i18n = createInstance();

i18n.use(initReactI18next).init({
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  lng: initialLanguage,
  resources: {
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    it: { translation: it },
    pt: { translation: pt },
  },
  supportedLngs: languages,
});

export default i18n;
