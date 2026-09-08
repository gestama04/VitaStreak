import { I18n } from 'i18n-js'
import { getLocales } from 'expo-localization'

import en from './en'
import pt from './pt'

export type AppLanguage = 'pt' | 'en'

const deviceLanguage = getLocales()[0]?.languageCode

export const currentLanguage: AppLanguage =
  deviceLanguage === 'pt' ? 'pt' : 'en'

export const i18n = new I18n({
  pt,
  en,
})

i18n.locale = 'en'
i18n.defaultLocale = 'en'
i18n.enableFallback = true

export function t(
  key: string,
  options?: Record<string, unknown>
): string {
  return i18n.t(key, options)
}
