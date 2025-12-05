'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function getInviteRequestWebhookUrl() {
  try {
    const supabase = createAdminClient();
    console.log('[getInviteRequestWebhookUrl] Iniciando busca do webhook...');
    
    const { data, error } = await supabase
      .from('webhook_configurations')
      .select('webhook_url')
      .eq('event_type', 'invite_request')
      .eq('active', true)
      .limit(1);

    console.log('[getInviteRequestWebhookUrl] Resultado da query:', {
      data,
      error: error?.message,
      dataLength: data?.length,
    });

    if (error) {
      console.error('[getInviteRequestWebhookUrl] Erro na query:', error);
      return { success: false, error: error.message };
    }

    const webhookUrl = data?.[0]?.webhook_url || null;
    console.log('[getInviteRequestWebhookUrl] URL encontrada:', webhookUrl);
    
    return { success: true, webhookUrl };
  } catch (err: any) {
    console.error('[getInviteRequestWebhookUrl] Erro:', err.message);
    return { success: false, error: err.message };
  }
}

export async function updateInviteRequestWebhookUrl(newUrl: string) {
  try {
    if (!newUrl || !newUrl.startsWith('http')) {
      return { success: false, error: 'URL inválida. Deve começar com http ou https.' };
    }

    const supabase = createAdminClient();
    
    // Tenta atualizar; se não existir, insere
    const { error: updateError } = await supabase
      .from('webhook_configurations')
      .update({ webhook_url: newUrl, updated_at: new Date().toISOString() })
      .eq('event_type', 'invite_request')
      .eq('active', true);

    if (updateError) {
      console.error('[updateInviteRequestWebhookUrl] Erro UPDATE:', updateError);
      // Tenta inserir se update falhar
      const { error: insertError } = await supabase
        .from('webhook_configurations')
        .insert({
          event_type: 'invite_request',
          webhook_url: newUrl,
          active: true,
        });

      if (insertError) {
        console.error('[updateInviteRequestWebhookUrl] Erro INSERT:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    console.log('[updateInviteRequestWebhookUrl] ✅ URL atualizada com sucesso:', newUrl);
    return { success: true, webhookUrl: newUrl };
  } catch (err: any) {
    console.error('[updateInviteRequestWebhookUrl] Erro:', err.message);
    return { success: false, error: err.message };
  }
}

export async function submitInviteRequest(
  nome: string,
  email: string,
  whatsapp: string,
  motivo: string
) {
  try {
    console.log('[submitInviteRequest] Iniciando com dados:', { nome, email, whatsapp });

    // Validar dados
    if (!nome?.trim() || !email?.trim() || !whatsapp?.trim() || !motivo?.trim()) {
      return { success: false, error: 'Todos os campos são obrigatórios.' };
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Email inválido.' };
    }

    // Validar WhatsApp (apenas dígitos, mínimo 11)
    const whatsappClean = whatsapp.replace(/\D/g, '');
    if (whatsappClean.length < 11) {
      return { success: false, error: 'WhatsApp inválido. Use formato com 11 dígitos.' };
    }

    // Buscar URL do webhook com logs detalhados
    console.log('[submitInviteRequest] Tentando buscar webhook do banco...');
    const supabase = createAdminClient();
    
    // Buscar TODOS os webhooks para debug
    const { data: allWebhooks, error: allError } = await supabase
      .from('webhook_configurations')
      .select('*');
    
    console.log('[submitInviteRequest] Todos os webhooks no banco:', {
      data: allWebhooks,
      error: allError?.message,
    });

    // Agora buscar especificamente o de invite_request
    const { data: webhookData, error: webhookError } = await supabase
      .from('webhook_configurations')
      .select('webhook_url, event_type, active')
      .eq('event_type', 'invite_request');

    console.log('[submitInviteRequest] Busca específica por invite_request:', {
      data: webhookData,
      error: webhookError?.message,
      dataLength: webhookData?.length,
      firstItem: webhookData?.[0],
    });

    if (webhookError) {
      console.error('[submitInviteRequest] Erro ao buscar webhook:', webhookError);
      return { success: false, error: `Erro ao buscar configuração: ${webhookError.message}` };
    }

    if (!webhookData || webhookData.length === 0) {
      console.error('[submitInviteRequest] Nenhum webhook encontrado no banco');
      return { success: false, error: 'Webhook não configurado. Tente novamente mais tarde.' };
    }

    const webhookUrl = webhookData[0]?.webhook_url;
    console.log('[submitInviteRequest] ✅ URL do webhook encontrada:', webhookUrl);

    if (!webhookUrl) {
      return { success: false, error: 'URL do webhook inválida.' };
    }

    // Preparar payload
    const payload = {
      type: 'invite_request',
      data: {
        nome,
        email,
        whatsapp: whatsappClean,
        motivo,
        timestamp: new Date().toISOString(),
      },
    };

    // Enviar para webhook
    console.log('[submitInviteRequest] Enviando webhook com payload:', payload);
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('[submitInviteRequest] Resposta do webhook:', {
      status: webhookResponse.status,
      ok: webhookResponse.ok,
    });

    if (!webhookResponse.ok) {
      const responseText = await webhookResponse.text();
      console.error('[submitInviteRequest] Erro do webhook:', responseText);
      return { success: false, error: `Erro ao enviar solicitação (${webhookResponse.status})` };
    }

    console.log('[submitInviteRequest] ✅ Solicitação enviada com sucesso');
    return { success: true, message: 'Solicitação encaminhada com sucesso!' };
  } catch (err: any) {
    console.error('[submitInviteRequest] Erro:', err.message);
    return { success: false, error: err.message };
  }
}
