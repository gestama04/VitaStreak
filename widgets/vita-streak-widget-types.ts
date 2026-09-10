export type VitaStreakWidgetLanguage = 'pt' | 'en'

export type VitaStreakWidgetDayStatus =
  | 'completed'
  | 'missed'
  | 'frozen'
  | 'empty'

export type VitaStreakWidgetDay = {
  label: string
  status: VitaStreakWidgetDayStatus
}

export type VitaStreakWidgetData = {
  streak: number
  completed: number
  total: number
  language: VitaStreakWidgetLanguage
  weekDays: VitaStreakWidgetDay[]
  updatedAt: string
}

export const EMPTY_WIDGET_DATA: VitaStreakWidgetData = {
  streak: 0,
  completed: 0,
  total: 0,
  language: 'pt',
  weekDays: [],
  updatedAt: new Date(0).toISOString(),
}
