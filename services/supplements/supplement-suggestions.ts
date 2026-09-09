import { Supplement } from '../../types/supplements/supplement'
import { t } from '@/i18n'

export type SupplementSuggestion = {
  reminderTime: string
  daysOfWeek: number[]
  note: string
  caution?: string
}

export function getSupplementSuggestion(input: {
  name?: string
  mainIngredient?: string
  dosageAmount?: number | null
  dosageUnit?: string | null
}): SupplementSuggestion {
  const text = `${input.name ?? ''} ${input.mainIngredient ?? ''}`.toLowerCase()
  const amount = input.dosageAmount
  const unit = input.dosageUnit

  let reminderTime = '09:00'
  let note = t('supplementSuggestions.defaultNote')
  let caution: string | undefined

  const has = (...words: string[]) => words.some((word) => text.includes(word))

  if (has('vitamina d', 'd3', 'k2', 'mk-7')) {
    reminderTime = '09:00'
    note = t('supplementSuggestions.vitaminDNote')
  }

  if (has('magnésio', 'magnesium', 'bisglicinato', 'glycinate')) {
    reminderTime = '21:00'
    note = t('supplementSuggestions.magnesiumNote')
  }

  if (has('omega', 'ómega', 'fish oil', 'epa', 'dha')) {
    reminderTime = '13:00'
    note = t('supplementSuggestions.omega3Note')
  }

  if (has('creatina', 'creatine')) {
    reminderTime = '10:00'
    note = t('supplementSuggestions.creatineNote')
  }

  if (has('probiótico', 'probiotic')) {
    reminderTime = '08:00'
    note = t('supplementSuggestions.probioticNote')
  }

  if (has('ferro', 'iron')) {
    reminderTime = '08:00'
    note = t('supplementSuggestions.ironNote')
    caution = t('supplementSuggestions.ironCaution')
  }

  if (has('zinco', 'zinc')) {
    reminderTime = '13:00'
    note = t('supplementSuggestions.zincNote')
  }

  if (has('melatonina', 'melatonin')) {
    reminderTime = '22:00'
    note = t('supplementSuggestions.melatoninNote')
    caution = t('supplementSuggestions.melatoninCaution')
  }

  if (
    has('vitamina d', 'd3') &&
    unit === 'IU' &&
    typeof amount === 'number' &&
    amount >= 4000
  ) {
    caution = t('supplementSuggestions.highDoseCaution')
  }

  if (
    has('magnésio', 'magnesium') &&
    unit === 'mg' &&
    typeof amount === 'number' &&
    amount >= 400
  ) {
    caution = t('supplementSuggestions.magnesiumDoseCaution')
  }

  return {
    reminderTime,
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    note,
    caution,
  }
}