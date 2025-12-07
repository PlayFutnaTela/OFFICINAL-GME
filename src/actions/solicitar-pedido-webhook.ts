'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSolicitacaoPedidoWebhookUrl() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('webhook_configurations')
      .select('webhook_url')
      .eq('event_type', 'solicitar_pedido')
      .eq('active', true)
      .single()

    if (error) {
      console.error('Erro ao buscar webhook URL:', error)
      return { webhookUrl: '', error: 'Falha ao carregar URL' }
    }

    return { webhookUrl: data?.webhook_url || '' }
  } catch (error) {
    console.error('Erro ao buscar webhook URL:', error)
    return { webhookUrl: '', error: 'Erro ao buscar URL' }
  }
}

export async function updateSolicitacaoPedidoWebhookUrl(newUrl: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('webhook_configurations')
      .update({ webhook_url: newUrl })
      .eq('event_type', 'solicitar_pedido')

    if (error) {
      console.error('Erro ao atualizar webhook URL:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao atualizar webhook URL:', error)
    return { success: false, error: error.message }
  }
}

export async function testSolicitacaoPedidoWebhook(webhookUrl: string) {
  try {
    const testPayload = {
      event_type: 'solicitar_pedido',
      user_id: 'test-user-id',
      user_email: 'teste@gerezim.com',
      user_name: 'Usuário Teste',
      user_phone: '+55 11 99999-9999',
      request_data: {
        title: 'Teste - BMW M5 2023',
        description: 'Este é um teste de solicitação de pedido',
        specifications: 'Cor: Preta, Ano: 2023, Km: 0',
        category: 'carros',
        budget: 'R$ 500.000 - R$ 700.000',
        location: 'São Paulo, SP',
        contact_preference: 'whatsapp',
        additional_notes: 'Esta é uma solicitação de teste do sistema',
      },
      timestamp: new Date().toISOString(),
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    if (!response.ok) {
      return { success: false, error: `Erro: ${response.statusText}` }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao testar webhook:', error)
    return { success: false, error: error.message }
  }
}
