import { MatchResult, UserProfile, Product } from './matching-engine'

export interface AIMatchAnalysis {
  score: number
  reasons: string[]
  analysis: string
  shouldNotify: boolean
}

/**
 * Calcular match usando OpenAI API
 * Análise sofisticada do perfil do usuário vs produto
 */
export async function calculateAIMatch(
  user: UserProfile,
  product: Product
): Promise<AIMatchAnalysis> {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.warn('OPENAI_API_KEY não configurada - usando fallback')
      return {
        score: 0,
        reasons: [],
        analysis: 'API não configurada',
        shouldNotify: false,
      }
    }

    const prompt = `
Analise se este produto é uma boa oportunidade para este usuário.

PERFIL DO USUÁRIO:
- Interesses: ${user.interests.join(', ') || 'Não informado'}
- Faixa de preço: R$ ${user.minPrice.toLocaleString('pt-BR')} - R$ ${user.maxPrice.toLocaleString('pt-BR')}
- Localizações preferidas: ${user.preferredLocations.join(', ') || 'Qualquer uma'}
- Urgência: ${user.urgency}

PRODUTO:
- Nome: ${product.name || product.title}
- Categoria: ${product.category}
- Preço: R$ ${product.price.toLocaleString('pt-BR')}
- Localização: ${product.location || product.location_info || 'Não informada'}
- Descrição: ${product.description || 'Não disponível'}

Responda em JSON (sem markdown, apenas o objeto):
{
  "score": 0-100,
  "reasons": ["razão 1", "razão 2", "razão 3"],
  "analysis": "análise breve",
  "shouldNotify": true/false
}

Critérios de scoring:
- 80+: Muito compatível com o perfil
- 60-79: Compatível
- 40-59: Moderadamente interessante
- 20-39: Pouco interessante
- 0-19: Não recomendado
`.trim()

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro da OpenAI API:', errorData)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Resposta vazia da API')
    }

    // Parse a resposta JSON
    const analysis: AIMatchAnalysis = JSON.parse(content)

    return {
      score: Math.min(Math.max(analysis.score || 0, 0), 100),
      reasons: Array.isArray(analysis.reasons) ? analysis.reasons : [],
      analysis: analysis.analysis || '',
      shouldNotify: analysis.shouldNotify || analysis.score >= 65,
    }
  } catch (error) {
    console.error('Erro ao calcular AI match:', error)

    // Fallback seguro
    return {
      score: 0,
      reasons: ['Análise indisponível no momento'],
      analysis: 'Erro ao processar análise',
      shouldNotify: false,
    }
  }
}

/**
 * Salvar análise de IA no banco para cache
 */
export async function cacheAIAnalysis(
  productId: string,
  analysis: AIMatchAnalysis
) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    await supabase.from('product_ai_scores').upsert({
      product_id: productId,
      ai_score: analysis.score,
      ai_analysis: analysis.analysis,
      ai_reasons: analysis.reasons,
      cached_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao fazer cache de análise:', error)
  }
}

/**
 * Obter análise em cache se existir
 */
export async function getCachedAIAnalysis(productId: string) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()

    const { data } = await supabase
      .from('product_ai_scores')
      .select('*')
      .eq('product_id', productId)
      .maybeSingle()

    // Se cache tem menos de 7 dias, retornar
    if (data) {
      const cachedDate = new Date(data.cached_at)
      const daysSinceCache =
        (Date.now() - cachedDate.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceCache < 7) {
        return {
          score: data.ai_score,
          reasons: data.ai_reasons || [],
          analysis: data.ai_analysis || '',
          shouldNotify: data.ai_score >= 65,
        }
      }
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar análise em cache:', error)
    return null
  }
}
