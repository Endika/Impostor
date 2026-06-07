import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ca from './locales/ca.json'
import en from './locales/en.json'
import es from './locales/es.json'
import eu from './locales/eu.json'
import gl from './locales/gl.json'
import va from './locales/va.json'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ca: { translation: ca },
      en: { translation: en },
      es: { translation: es },
      eu: { translation: eu },
      gl: { translation: gl },
      va: { translation: va },
    },
    fallbackLng: 'en',
    supportedLngs: ['ca', 'en', 'es', 'eu', 'gl', 'va'],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  })

export default i18n
