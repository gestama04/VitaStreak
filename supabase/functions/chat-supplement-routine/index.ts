import {
  GoogleGenerativeAI,
  type Part,
} from '@google/generative-ai'

type GeminiContentPart = string | Part

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')

const GEMINI_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
]

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

async function generateWithFallback(parts: GeminiContentPart[]) {
  let lastError: unknown = null

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      return await model.generateContent(parts)
    } catch (error) {
      console.error('Gemini model failed: ' + modelName, error)
      lastError = error
    }
  }

  throw lastError
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    if (!Deno.env.get('GEMINI_API_KEY')) {
      return jsonResponse({ error: 'Missing GEMINI_API_KEY' }, 500)
    }

    const body = await req.json()
    const supplements = Array.isArray(body.supplements)
      ? body.supplements.slice(0, 40)
      : []
    const messages = Array.isArray(body.messages)
      ? body.messages.slice(-8).map((message: Record<string, unknown>) => ({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: cleanText(message.content, 1200),
        }))
      : []
    const question = cleanText(body.question, 600)
    const language = body.language === 'pt' ? 'pt' : 'en'

    if (supplements.length === 0) {
      return jsonResponse({ error: 'No supplements provided' }, 400)
    }

    if (!question) {
      return jsonResponse({ error: 'Question is required' }, 400)
    }

    const responseLanguage =
      language === 'pt' ? 'Portuguese from Portugal' : 'English'
    const fallback =
      language === 'pt'
        ? 'Nao tenho dados suficientes na rotina guardada para responder com seguranca. Confirma os rotulos e fala com um profissional de saude.'
        : 'There is not enough information in the saved routine to answer safely. Check the labels and speak with a healthcare professional.'

    const prompt = [
      'You are VitaStreak AI, an educational assistant inside a supplement tracking app.',
      'Reply in ' + responseLanguage + '.',
      '',
      'Strict safety rules:',
      '- Do not diagnose any condition.',
      '- Do not prescribe, recommend, calculate, increase, reduce, start, or stop doses.',
      '- Do not claim that a supplement, dose, schedule, or combination is safe.',
      '- Do not replace a doctor, pharmacist, dietitian, or other healthcare professional.',
      '- Do not interpret symptoms as evidence of a disease.',
      '- If the user asks for a medical decision, explain that you cannot make it and suggest questions for a qualified professional.',
      '- Distinguish label data from general educational information.',
      '- Mention missing or uncertain data when relevant.',
      '- Only discuss the supplements and routine supplied below.',
      '- Be concise, clear, calm, and useful for a mobile interface.',
      '- Use short paragraphs or up to 5 bullets.',
      '- Do not use markdown headings.',
      '',
      'Saved supplements:',
      JSON.stringify(supplements, null, 2),
      '',
      'Latest structured review:',
      JSON.stringify(body.review ?? null, null, 2),
      '',
      'Recent conversation:',
      JSON.stringify(messages, null, 2),
      '',
      'Current user question:',
      question,
      '',
      'If the available information is insufficient, answer exactly or closely to:',
      fallback,
    ].join('\n')

    const result = await generateWithFallback([prompt])
    const answer = cleanText(result.response.text(), 4000)

    if (!answer) {
      return jsonResponse({ answer: fallback })
    }

    return jsonResponse({ answer })
  } catch (error) {
    console.error('CHAT_SUPPLEMENT_ROUTINE_ERROR:', error)
    return jsonResponse(
      {
        error:
          error instanceof Error ? error.message : 'Internal error',
      },
      500
    )
  }
})
