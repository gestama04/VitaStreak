export type VitaStreakWidgetLanguage = 'pt' | 'en'

export type VitaStreakWidgetData = {
  streak: number
  completed: number
  total: number
  language: VitaStreakWidgetLanguage
  updatedAt: string
}

export const EMPTY_WIDGET_DATA: VitaStreakWidgetData = {
  streak: 0,
  completed: 0,
  total: 0,
  language: 'pt',
  updatedAt: new Date(0).toISOString(),
}
