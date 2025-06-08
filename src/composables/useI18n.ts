import { useI18n as useVueI18n } from 'vue-i18n'
import { availableLanguages } from '@/i18n'

export function useI18n() {
  const { t, locale } = useVueI18n()

  const changeLanguage = (lang: string) => {
    if (availableLanguages.some(l => l.code === lang)) {
      locale.value = lang
      localStorage.setItem('app-language', lang)
    }
  }

  const getCurrentLanguage = () => {
    return availableLanguages.find(l => l.code === locale.value) || availableLanguages[0]
  }

  return {
    t,
    locale,
    changeLanguage,
    getCurrentLanguage,
    availableLanguages
  }
}
