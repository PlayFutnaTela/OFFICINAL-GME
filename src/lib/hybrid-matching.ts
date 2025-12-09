import { 
  calculateRuleBasedMatch, 
  UserProfile, 
  Product, 
  MatchResult,
  getUserInteractionHistory 
} from './matching-engine'
import { calculateAIMatch, getCachedAIAnalysis } from './ai-matching'

export interface HybridMatchResult extends MatchResult {
  ruleScore: number
  aiScore: number
  hybridScore: number
}

/**
 * Calcular match híbrido combinando regras (60%) + IA (40%)
 * 
 * Estratégia:
 * 1. Sempre calcular score baseado em regras (rápido)
 * 2. Se rule score >= 50: calcular análise de IA (mais preciso)
 * 3. Combinar: (ruleScore * 0.6) + (aiScore * 0.4)
 * 4. Threshold final: >= 65 para notificar
 */
export async function calculateHybridMatch(
  user: UserProfile,
  product: Product
): Promise<HybridMatchResult> {
  // Passo 1: Score baseado em regras (sempre rápido)
  const ruleResult = calculateRuleBasedMatch(user, product)
  const ruleScore = ruleResult.score

  // Passo 2: Se score das regras é bom (>= 50), tentar análise de IA
  let aiScore = 0
  let aiAnalysis = null
  let combinedReasons = [...ruleResult.reasons]

  if (ruleScore >= 50) {
    try {
      // Tentar obter análise em cache primeiro
      aiAnalysis = await getCachedAIAnalysis(product.id)

      // Se não há cache, chamar OpenAI
      if (!aiAnalysis) {
        aiAnalysis = await calculateAIMatch(user, product)
        aiScore = aiAnalysis.score
      } else {
        aiScore = aiAnalysis.score
      }

      // Adicionar razões da IA
      if (aiAnalysis.reasons && aiAnalysis.reasons.length > 0) {
        combinedReasons.push(...aiAnalysis.reasons)
      }
    } catch (error) {
      console.error('Erro ao calcular IA match:', error)
      // Fallback: usar apenas score das regras
      aiScore = 0
    }
  }

  // Passo 3: Calcular score híbrido
  const hybridScore = Math.round(ruleScore * 0.6 + aiScore * 0.4)

  // Passo 4: Determinar se deve notificar
  const shouldNotify = hybridScore >= 65

  // Passo 5: Remover duplicatas nas razões
  const uniqueReasonsSet = new Set<string>(combinedReasons)
  const uniqueReasons = Array.from(uniqueReasonsSet)

  return {
    score: hybridScore,
    reasons: uniqueReasons,
    shouldNotify,
    matchType: aiAnalysis ? 'hybrid' : 'rule_based',
    ruleScore,
    aiScore,
    hybridScore,
  }
}

/**
 * Calcular matches para um usuário contra múltiplos produtos
 * Útil para cron job que processa em lote
 */
export async function calculateMultipleMatches(
  user: UserProfile,
  products: Product[]
): Promise<Map<string, HybridMatchResult>> {
  const matches = new Map<string, HybridMatchResult>()

  for (const product of products) {
    try {
      const match = await calculateHybridMatch(user, product)
      matches.set(product.id, match)
    } catch (error) {
      console.error(`Erro ao calcular match para produto ${product.id}:`, error)
    }
  }

  return matches
}

/**
 * Pontuar produtos por relevância
 */
export function rankMatches(matches: Map<string, HybridMatchResult>) {
  return Array.from(matches.entries())
    .filter(([_, match]) => match.shouldNotify)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([productId, match]) => ({ productId, ...match }))
}
