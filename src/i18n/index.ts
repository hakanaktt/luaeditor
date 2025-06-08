import { createI18n } from 'vue-i18n'
import en from './locales/en'
import tr from './locales/tr'

// Get the default language from localStorage or use 'en' as fallback
const getDefaultLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('app-language')
    if (saved && ['en', 'tr'].includes(saved)) {
      return saved
    }
    
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0]
    if (['en', 'tr'].includes(browserLang)) {
      return browserLang
    }
  }
  
  return 'en'
}

const messages = {
  en,
  tr
}

export const i18n = createI18n({
  legacy: false,
  locale: getDefaultLanguage(),
  fallbackLocale: 'en',
  messages,
  globalInjection: true
})

export const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Türkçe' }
]

export default i18n
