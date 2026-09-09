import { supabase } from '../../supabase-config'
import { SupplementAnalysisResult } from '../../types/supplements/supplement'
import { i18n } from '@/i18n'

export async function analyzeSupplementLabel(
  imageBase64: string
): Promise<SupplementAnalysisResult> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'analyze-supplement-label',
      {
        body: {
  imageBase64,
  language: i18n.locale === 'pt' ? 'pt' : 'en',
},
      }
    )

    if (error) throw error

    return data as SupplementAnalysisResult
  } catch (error) {
    console.error('Erro ao analisar suplemento:', error)

    return {
      name: null,
      brand: null,
      mainIngredient: null,
      dosageAmount: null,
      dosageUnit: null,
      servingSize: null,
      containerQuantity: null,
      instructionsFromLabel: null,
      confidence: 0,
      activeIngredients: [],
      aiInsights: {
        summary: null,
        benefits: [],
        cautions: [],
      },
    }
  }
}