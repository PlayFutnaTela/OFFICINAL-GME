'use server'

import { createClient } from '@/lib/supabase/server'

export type SolicitacaoPedidoData = {
  title: string
  description: string
  specifications: string
  category: string
  budget: string
  location: string
  contact_preference: string
  additional_notes: string
}

export async function submitSolicitacaoPedido(formData: SolicitacaoPedidoData) {
  try {
    const supabase = createClient()

    // 1. Autenticar usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Você precisa estar autenticado para fazer uma solicitação',
      }
    }

    // 2. Buscar dados do usuário (profile)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        error: 'Erro ao buscar dados do perfil. Por favor, complete seu perfil.',
      }
    }

    // 3. Salvar solicitação na tabela solicitar_pedidos
    const { data: solicitacao, error: insertError } = await supabase
      .from('solicitar_pedidos')
      .insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        specifications: formData.specifications || null,
        category: formData.category,
        budget: formData.budget,
        location: formData.location || null,
        contact_preference: formData.contact_preference,
        additional_notes: formData.additional_notes || null,
        status: 'pending',
        priority: 'normal',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao salvar solicitação:', insertError)
      return {
        success: false,
        error: 'Erro ao salvar sua solicitação. Por favor, tente novamente.',
      }
    }

    // 4. Buscar URL do webhook
    const { data: webhookConfig, error: webhookError } = await supabase
      .from('webhook_configurations')
      .select('webhook_url, active')
      .eq('event_type', 'solicitar_pedido')
      .single()

    if (webhookError || !webhookConfig || !webhookConfig.active) {
      console.error('Webhook não configurado:', webhookError)
      // Mesmo sem webhook, retorna sucesso pois a solicitação foi salva
      return {
        success: true,
        message: 'Solicitação recebida com sucesso! Nossos especialistas entrarão em contato em breve.',
      }
    }

    // 5. Preparar payload para webhook
    const webhookPayload = {
      event_type: 'solicitar_pedido',
      request_id: solicitacao.id,
      user_id: user.id,
      user_name: profile.full_name,
      user_email: profile.email,
      user_phone: profile.phone,
      request_data: {
        title: formData.title,
        description: formData.description,
        specifications: formData.specifications,
        category: formData.category,
        budget: formData.budget,
        location: formData.location,
        contact_preference: formData.contact_preference,
        additional_notes: formData.additional_notes,
      },
      timestamp: new Date().toISOString(),
    }

    // 6. Disparar webhook (não bloqueia a resposta se falhar)
    try {
      const webhookResponse = await fetch(webhookConfig.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      })

      if (!webhookResponse.ok) {
        console.error('Erro ao disparar webhook:', webhookResponse.statusText)
        // Mesmo que o webhook falhe, a solicitação foi salva
      }
    } catch (webhookFetchError) {
      console.error('Erro ao conectar com webhook:', webhookFetchError)
      // Mesmo que o webhook falhe, a solicitação foi salva
    }

    return {
      success: true,
      message: 'Solicitação recebida com sucesso! Nossos especialistas entrarão em contato em breve.',
    }
  } catch (error) {
    console.error('Erro ao processar solicitação:', error)
    return {
      success: false,
      error: 'Erro ao processar sua solicitação. Por favor, tente novamente.',
    }
  }
}
