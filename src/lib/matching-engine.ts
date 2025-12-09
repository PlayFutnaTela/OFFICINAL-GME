import { createClient } from '@/lib/supabase/server'

export interface UserProfile {
  id: string
  interests: string[]
  minPrice: number
  maxPrice: number
  preferredLocations: string[]
  urgency: 'low' | 'normal' | 'high'
}

export interface Product {
  id: string
  name: string
  title?: string
  category: string
  price: number
  location?: string
  location_info?: string
  description?: string
  created_at: string | Date
  status: string
}

export interface MatchResult {
  score: number
  reasons: string[]
  shouldNotify: boolean
  matchType: 'rule_based' | 'ai' | 'hybrid'
}

/**
 * Calcula match baseado em regras determinísticas (60 pontos)
 */
export function calculateRuleBasedMatch(
  user: UserProfile,
  product: Product
): MatchResult {
  const reasons: string[] = []
  let score = 0

  // 1. Categoria match (35 pontos)
  if (user.interests && user.interests.length > 0 && user.interests.includes(product.category)) {
    score += 35
    reasons.push(`📦 Categoria: ${product.category}`)
  }

  // 2. Preço dentro da faixa (30 pontos)
  if (
    product.price >= user.minPrice &&
    product.price <= user.maxPrice
  ) {
    score += 30
    reasons.push(
      `💰 Preço: R$ ${product.price.toLocaleString('pt-BR')} (dentro da faixa)`
    )
  }

  // 3. Localização match (20 pontos)
  const productLocation = product.location || product.location_info || ''
  if (
    user.preferredLocations &&
    user.preferredLocations.length > 0 &&
    user.preferredLocations.some(loc => productLocation.includes(loc))
  ) {
    score += 20
    reasons.push(`📍 Localização: ${productLocation}`)
  }

  // 4. Urgência (15 pontos) - produtos recentes para high urgency
  const createdDate = typeof product.created_at === 'string' 
    ? new Date(product.created_at) 
    : product.created_at
  
  const daysSinceCreation =
    (Date.now() - createdDate.getTime()) /
    (1000 * 60 * 60 * 24)

  if (user.urgency === 'high' && daysSinceCreation < 7) {
    score += 15
    reasons.push('🆕 Oportunidade recente')
  } else if (user.urgency === 'normal' && daysSinceCreation < 14) {
    score += 10
    reasons.push('⏰ Adicionado recentemente')
  }

  return {
    score: Math.min(score, 100),
    reasons: reasons.length > 0 ? reasons : ['Match básico encontrado'],
    shouldNotify: score >= 65,
    matchType: 'rule_based',
  }
}

/**
 * Obter perfil do usuário do banco de dados
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      console.warn(`Preferências não encontradas para usuário ${userId}`)
      return null
    }

    return {
      id: userId,
      interests: data.interests || [],
      minPrice: data.min_price || 0,
      maxPrice: data.max_price || 1000000000,
      preferredLocations: data.preferred_locations || [],
      urgency: data.urgency_level || 'normal',
    }
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    return null
  }
}

/**
 * Verificar se um match já foi enviado
 */
export async function hasMatchBeenSent(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('recommendation_matches')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    return !!data && !error
  } catch (error) {
    console.error('Erro ao verificar match anterior:', error)
    return false
  }
}

/**
 * Obter histórico de interações do usuário
 */
export async function getUserInteractionHistory(userId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('user_interactions')
      .select('product_id, interaction_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !data) return []

    return data
  } catch (error) {
    console.error('Erro ao buscar histórico de interações:', error)
    return []
  }
}

/**
 * Calcular score de compatibilidade final (0-100)
 */
export async function calculateFinalMatchScore(
  user: UserProfile,
  product: Product
): Promise<MatchResult> {
  // Usar apenas matching baseado em regras por enquanto
  // (IA pode ser adicionada depois com OpenAI)
  const ruleMatch = calculateRuleBasedMatch(user, product)
  
  return ruleMatch
}
