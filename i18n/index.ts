import { I18n } from 'i18n-js'
import { getLocales } from 'expo-localization'

import en from './en'
import pt from './pt'
import type { AppLanguage, LanguagePreference } from '../services/language-service'

export type { AppLanguage, LanguagePreference }

export function getSystemLanguage(): AppLanguage {
  return getLocales()[0]?.languageCode === 'pt' ? 'pt' : 'en'
}

export function resolveLanguage(preference: LanguagePreference): AppLanguage {
  return preference === 'system' ? getSystemLanguage() : preference
}

export let currentLanguage: AppLanguage = getSystemLanguage()

export const i18n = new I18n({ pt, en })
i18n.locale = currentLanguage
i18n.defaultLocale = 'en'
i18n.enableFallback = true

export function setI18nLanguage(language: AppLanguage) {
  currentLanguage = language
  i18n.locale = language
}

export function t(
  key: string,
  options?: Record<string, unknown>
): string {
  return i18n.t(key, options)
}
