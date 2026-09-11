import { i18n, t } from '@/i18n'
import { supabase } from '../../supabase-config'
import { Supplement } from '../../types/supplements/supplement'
import { AIRoutineReview } from './ai-routine-review-service'

export type AIRoutineChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

function compactSupplement(item: Supplement) {
  return {
    name: item.name,
    brand: item.brand,
    mainIngredient: item.main_ingredient,
    dosageAmount: item.dosage_amount,
    dosageUnit: item.dosage_unit,
    servingSize: item.serving_size,
    activeIngredients: item.active_ingredients,
    reminderTimes: item.reminder_times,
    reminderTime: item.reminder_time,
    frequencyType: item.frequency_type,
    daysOfWeek: item.days_of_week,
    instructionsFromLabel: item.instructions_from_label,
  }
}

export async function askVitaStreakAI(input: {
  supplements: Supplement[]
  review: AIRoutineReview | null
  messages: AIRoutineChatMessage[]
  question: string
}): Promise<string> {
  const question = input.question.trim()
  if (!question) throw new Error('Pergunta vazia')

  const recentMessages = input.messages
    .slice(-8)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 1200),
    }))

  const { data, error } = await supabase.functions.invoke(
    'chat-supplement-routine',
    {
      body: {
        supplements: input.supplements.map(compactSupplement),
        review: input.review,
        messages: recentMessages,
        question: question.slice(0, 600),
        language: i18n.locale === 'pt' ? 'pt' : 'en',
      },
    }
  )

  if (error) throw error

  if (!data || typeof data.answer !== 'string' || !data.answer.trim()) {
    throw new Error(t('vitaStreakAI.chatError'))
  }

  return data.answer.trim()
}
