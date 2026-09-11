import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  EMPTY_WIDGET_DATA,
  type VitaStreakWidgetData,
  type VitaStreakWidgetDay,
  type VitaStreakWidgetDayStatus,
} from './vita-streak-widget-types'

const WIDGET_DATA_KEY = 'vitastreakWidgetData'
const VALID_STATUSES: VitaStreakWidgetDayStatus[] = [
  'completed',
  'pending',
  'missed',
  'frozen',
  'empty',
]

export async function saveVitaStreakWidgetData(
  data: VitaStreakWidgetData
): Promise<void> {
  await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data))
}

function parseWeekDays(value: unknown): VitaStreakWidgetDay[] {
  if (!Array.isArray(value)) return []

  return value.slice(0, 7).map((day): VitaStreakWidgetDay => {
    const candidate = day as Partial<VitaStreakWidgetDay>
    const status = VALID_STATUSES.includes(
      candidate.status as VitaStreakWidgetDayStatus
    )
      ? (candidate.status as VitaStreakWidgetDayStatus)
      : 'empty'

    return {
      label: typeof candidate.label === 'string' ? candidate.label : '',
      status,
    }
  })
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
      weekDays: parseWeekDays(parsed.weekDays),
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
