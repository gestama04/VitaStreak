import AsyncStorage from '@react-native-async-storage/async-storage'

export type AppLanguage = 'pt' | 'en'
export type LanguagePreference = 'system' | AppLanguage

const LANGUAGE_STORAGE_KEY = 'appLanguagePreference'

export const LANGUAGE_OPTIONS: Array<{
  value: LanguagePreference
  labelKey: string
}> = [
  { value: 'system', labelKey: 'settings.languageAutomatic' },
  { value: 'pt', labelKey: 'settings.languagePortuguese' },
  { value: 'en', labelKey: 'settings.languageEnglish' },
]

export class LanguageService {
  static async savePreference(preference: LanguagePreference): Promise<void> {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, preference)
  }

  static async getPreference(): Promise<LanguagePreference> {
    const value = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)

    return value === 'pt' || value === 'en' || value === 'system'
      ? value
      : 'system'
  }

  static async resetPreference(): Promise<void> {
    await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY)
  }
}
