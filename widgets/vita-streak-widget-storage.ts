import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  EMPTY_WIDGET_DATA,
  type VitaStreakWidgetData,
} from './vita-streak-widget-types'

const WIDGET_DATA_KEY = 'vitastreakWidgetData'

export async function saveVitaStreakWidgetData(
  data: VitaStreakWidgetData
): Promise<void> {
  await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data))
}

export async function getVitaStreakWidgetData(): Promise<VitaStreakWidgetData> {
  try {
    const stored = await AsyncStorage.getItem(WIDGET_DATA_KEY)
    if (!stored) return EMPTY_WIDGET_DATA

    const parsed = JSON.parse(stored) as Partial<VitaStreakWidgetData>

    return {
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      completed: typeof parsed.completed === 'number' ? parsed.completed : 0,
      total: typeof parsed.total === 'number' ? parsed.total : 0,
      language: parsed.language === 'en' ? 'en' : 'pt',
      updatedAt:
        typeof parsed.updatedAt === 'string'
          ? parsed.updatedAt
          : new Date(0).toISOString(),
    }
  } catch (error) {
    console.warn('[VitaStreakWidget] Erro ao ler dados:', error)
    return EMPTY_WIDGET_DATA
  }
}
