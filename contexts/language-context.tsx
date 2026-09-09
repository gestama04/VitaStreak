import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  LanguageService,
  type AppLanguage,
  type LanguagePreference,
} from '../services/language-service'
import { resolveLanguage, setI18nLanguage } from '@/i18n'

type LanguageContextValue = {
  languagePreference: LanguagePreference
  currentLanguage: AppLanguage
  setLanguagePreference: (preference: LanguagePreference) => Promise<void>
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [languagePreference, setLanguagePreferenceState] =
    useState<LanguagePreference>('system')
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>(() =>
    resolveLanguage('system')
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const savedPreference = await LanguageService.getPreference()
        const resolvedLanguage = resolveLanguage(savedPreference)

        setLanguagePreferenceState(savedPreference)
        setCurrentLanguage(resolvedLanguage)
        setI18nLanguage(resolvedLanguage)
      } catch (error) {
        console.error('Erro ao carregar idioma:', error)
        const fallbackLanguage = resolveLanguage('system')
        setCurrentLanguage(fallbackLanguage)
        setI18nLanguage(fallbackLanguage)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreference()
  }, [])

  const setLanguagePreference = async (preference: LanguagePreference) => {
    const resolvedLanguage = resolveLanguage(preference)

    setLanguagePreferenceState(preference)
    setCurrentLanguage(resolvedLanguage)
    setI18nLanguage(resolvedLanguage)
    await LanguageService.savePreference(preference)
  }

  const value = useMemo(
    () => ({
      languagePreference,
      currentLanguage,
      setLanguagePreference,
    }),
    [languagePreference, currentLanguage]
  )

  if (isLoading) return null

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de LanguageProvider')
  }

  return context
}
