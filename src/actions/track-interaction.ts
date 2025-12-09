'use server'

import { createClient } from '@/lib/supabase/server'

export type InteractionType = 'viewed' | 'clicked' | 'saved' | 'inquired' | 'shared'

/**
 * Rastrear interação do usuário com um produto
 * Chamado de forma assíncrona (fire-and-forget)
 */
export async function trackInteraction(
  productId: string,
  type: InteractionType,
  durationSeconds: number = 0
) {
  try {
    const supabase = createClient()

    // Obter ID do usuário atual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.warn('Usuário não autenticado - interação não rastreada')
      return
    }

    // Inserir interação
    await supabase.from('user_interactions').insert({
      user_id: user.id,
      product_id: productId,
      interaction_type: type,
      duration_seconds: durationSeconds || null,
      timestamp: new Date().toISOString(),
    })

    // Eventos especiais: se inquired ou shared, enviar webhook
    if (type === 'inquired' || type === 'shared') {
      await triggerInteractionWebhook(user.id, productId, type)
    }
  } catch (error) {
    // Falhar silenciosamente - não deve bloquear a experiência do usuário
    console.error(`Erro ao rastrear interação ${type} para produto ${productId}:`, error)
  }
}

/**
 * Obter estatísticas de interação de um produto
 */
export async function getProductInteractionStats(productId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('user_interactions')
      .select('interaction_type')
      .eq('product_id', productId)

    if (error || !data) {
      return {
        total_views: 0,
        total_clicks: 0,
        total_saved: 0,
        total_inquiries: 0,
        total_shares: 0,
      }
    }

    return {
      total_views: data.filter((d) => d.interaction_type === 'viewed').length,
      total_clicks: data.filter((d) => d.interaction_type === 'clicked').length,
      total_saved: data.filter((d) => d.interaction_type === 'saved').length,
      total_inquiries: data.filter((d) => d.interaction_type === 'inquired').length,
      total_shares: data.filter((d) => d.interaction_type === 'shared').length,
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas de interação:', error)
    return null
  }
}

/**
 * Obter histórico de interações do usuário
 */
export async function getUserInteractionStats() {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
      .from('user_interactions')
      .select('interaction_type')
      .eq('user_id', user.id)

    if (error || !data) {
      return null
    }

    return {
      total_interactions: data.length,
      views: data.filter((d) => d.interaction_type === 'viewed').length,
      clicks: data.filter((d) => d.interaction_type === 'clicked').length,
      saved: data.filter((d) => d.interaction_type === 'saved').length,
      inquiries: data.filter((d) => d.interaction_type === 'inquired').length,
      shares: data.filter((d) => d.interaction_type === 'shared').length,
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error)
    return null
  }
}

/**
 * Disparar webhook para interações importantes
 */
async function triggerInteractionWebhook(
  userId: string,
  productId: string,
  type: InteractionType
) {
  try {
    const webhookUrl = process.env.INTERACTION_WEBHOOK_URL

    if (!webhookUrl) {
      return // Webhook não configurado
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'user_interaction',
        userId,
        productId,
        interactionType: type,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Erro ao disparar webhook de interação:', error)
  }
}
