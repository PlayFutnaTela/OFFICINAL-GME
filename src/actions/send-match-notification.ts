'use server'

import { createClient } from '@/lib/supabase/server'
import { Product } from '@/lib/matching-engine'
import { Resend } from 'resend'

export interface MatchNotificationData {
  userId: string
  productId: string
  matchScore: number
  reasons: string[]
  product: Product
}

/**
 * Enviar notificação de match encontrado
 * Orquestra: Email + Dashboard + Webhook
 */
export async function sendMatchNotification(
  data: MatchNotificationData
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // 1. Verificar se já foi enviado (evitar duplicatas)
    const { data: existingMatch, error: checkError } = await supabase
      .from('recommendation_matches')
      .select('id')
      .eq('user_id', data.userId)
      .eq('product_id', data.productId)
      .maybeSingle()

    if (existingMatch) {
      console.log(`Match já foi enviado para ${data.userId} x ${data.productId}`)
      return { success: true }
    }

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // 2. Buscar email do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', data.userId)
      .single()

    if (profileError || !profile?.email) {
      console.warn(`Email não encontrado para usuário ${data.userId}`)
      return { success: false, error: 'Email não encontrado' }
    }

    // 3. Inserir match no banco
    const { error: insertError } = await supabase
      .from('recommendation_matches')
      .insert({
        user_id: data.userId,
        product_id: data.productId,
        match_score: data.matchScore,
        match_reasons: data.reasons,
        clicked: false,
        email_sent: false,
        email_opened: false,
      })

    if (insertError) {
      console.error('Erro ao inserir match no banco:', insertError)
      throw insertError
    }

    // 4. Enviar email via Resend
    const emailSuccess = await sendMatchEmail(
      profile.email,
      data
    )

    // 5. Atualizar flag de email enviado
    if (emailSuccess) {
      await supabase
        .from('recommendation_matches')
        .update({ email_sent: true })
        .eq('user_id', data.userId)
        .eq('product_id', data.productId)
    }

    // 6. Criar notificação no dashboard
    await createDashboardNotification(data)

    // 7. Dispatar webhook (opcional)
    await triggerWebhook(data)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Erro ao enviar notificação de match:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Enviar email formatado com match encontrado
 */
async function sendMatchEmail(
  email: string,
  data: MatchNotificationData
): Promise<boolean> {
  try {
    // Instancia o Resend apenas se a chave existir, evitando erro em build
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY não configurada; pulando envio de email')
      return true // não bloquear fluxo
    }
    const resend = new Resend(apiKey)

    const productLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://gerezim.com.br'}/produto/${data.productId}`
    const matchPercentage = data.matchScore

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .score-badge { display: inline-block; background: #fbbf24; color: #1f2937; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
    .reasons { background: white; padding: 15px; border-left: 4px solid #f97316; margin: 20px 0; border-radius: 4px; }
    .reasons ul { margin: 0; padding-left: 20px; }
    .reasons li { margin: 8px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Nova Oportunidade Encontrada!</h1>
      <p>Baseado no seu perfil e preferências</p>
    </div>
    <div class="content">
      <div class="score-badge">Compatibilidade: ${matchPercentage}%</div>
      
      <h2>${data.product.name || data.product.title}</h2>
      <p><strong>Categoria:</strong> ${data.product.category}</p>
      <p><strong>Preço:</strong> R$ ${data.product.price.toLocaleString('pt-BR')}</p>
      ${data.product.location || data.product.location_info ? `<p><strong>Localização:</strong> ${data.product.location || data.product.location_info}</p>` : ''}
      
      <div class="reasons">
        <strong>Por que essa oportunidade é para você:</strong>
        <ul>
          ${data.reasons.map(reason => `<li>${reason}</li>`).join('')}
        </ul>
      </div>

      <a href="${productLink}" class="cta-button">Ver Oportunidade Completa →</a>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Não quer mais recomendações? Acesse suas <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/preferencias" style="color: #f97316;">Preferências</a> e desative as notificações.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 GEREZIM - Clube Privado de Elite</p>
      <p>Esta é uma notificação personalizada baseada em suas preferências.</p>
    </div>
  </div>
</body>
</html>
    `.trim()

    const result = await resend.emails.send({
      from: 'matches@gerezim.com.br',
      to: email,
      subject: `✨ Nova oportunidade ${data.matchScore}% compatível com seu perfil!`,
      html,
    })

    return !result.error
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return false
  }
}

/**
 * Criar notificação no dashboard do usuário
 */
async function createDashboardNotification(data: MatchNotificationData) {
  try {
    const supabase = createClient()

    await supabase.from('notifications').insert({
      user_id: data.userId,
      type: 'match_found',
      title: `Nova oportunidade: ${data.product.name || data.product.title}`,
      message: `${data.matchScore}% de compatibilidade com seu perfil`,
      related_product_id: data.productId,
      read: false,
    })
  } catch (error) {
    console.error('Erro ao criar notificação de dashboard:', error)
  }
}

/**
 * Dispatar webhook para integrações externas
 */
async function triggerWebhook(data: MatchNotificationData) {
  try {
    const webhookUrl = process.env.MATCH_NOTIFICATION_WEBHOOK_URL

    if (!webhookUrl) {
      return // Webhook não configurado, ignorar silenciosamente
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'match_notification',
        userId: data.userId,
        productId: data.productId,
        matchScore: data.matchScore,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Erro ao disparar webhook:', error)
  }
}

/**
 * Marcar match como clicado
 */
export async function markMatchAsClicked(
  userId: string,
  productId: string
) {
  const supabase = createClient()

  try {
    await supabase
      .from('recommendation_matches')
      .update({ clicked: true })
      .eq('user_id', userId)
      .eq('product_id', productId)
  } catch (error) {
    console.error('Erro ao marcar match como clicado:', error)
  }
}

/**
 * Marcar email como aberto
 */
export async function markEmailAsOpened(
  userId: string,
  productId: string
) {
  const supabase = createClient()

  try {
    await supabase
      .from('recommendation_matches')
      .update({ email_opened: true })
      .eq('user_id', userId)
      .eq('product_id', productId)
  } catch (error) {
    console.error('Erro ao marcar email como aberto:', error)
  }
}
