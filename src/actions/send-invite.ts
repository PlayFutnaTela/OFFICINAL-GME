'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function getAvailableInvites() {
  try {
    console.log('[getAvailableInvites] Buscando convites disponíveis...');
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('invites')
      .select('id, code, category')
      .eq('status', 'unused')
      .is('notes', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getAvailableInvites] Erro:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log('[getAvailableInvites] ✅ Encontrados:', data?.length || 0, 'convites disponíveis');
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('[getAvailableInvites] Erro catch:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}

export async function getSendInviteWebhookUrl() {
  try {
    console.log('[getSendInviteWebhookUrl] Buscando URL do webhook...');
    const supabase = createAdminClient();
    
    // Primeiro buscar todos os webhooks para debug
    const { data: allData, error: allError } = await supabase
      .from('webhook_configurations')
      .select('*');
    
    console.log('[getSendInviteWebhookUrl] Todos os webhooks:', allData);

    const { data, error } = await supabase
      .from('webhook_configurations')
      .select('webhook_url')
      .eq('event_type', 'send_invite_to_client');

    if (error) {
      console.error('[getSendInviteWebhookUrl] Erro:', error);
      return { success: false, error: 'Webhook não configurado', webhookUrl: null };
    }

    console.log('[getSendInviteWebhookUrl] Dados retornados:', data);
    
    if (!data || data.length === 0) {
      console.error('[getSendInviteWebhookUrl] Nenhum webhook encontrado');
      return { success: false, error: 'Webhook não configurado', webhookUrl: null };
    }

    const webhookUrl = data[0]?.webhook_url;
    console.log('[getSendInviteWebhookUrl] ✅ URL encontrada:', webhookUrl);
    return { success: true, webhookUrl };
  } catch (err: any) {
    console.error('[getSendInviteWebhookUrl] Erro catch:', err.message);
    return { success: false, error: err.message, webhookUrl: null };
  }
}

export async function updateSendInviteWebhookUrl(newUrl: string) {
  try {
    console.log('[updateSendInviteWebhookUrl] Atualizando URL do webhook...');
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('webhook_configurations')
      .update({
        webhook_url: newUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('event_type', 'send_invite_to_client');

    if (error) {
      console.error('[updateSendInviteWebhookUrl] Erro:', error);
      return { success: false, error: error.message };
    }

    console.log('[updateSendInviteWebhookUrl] ✅ URL atualizada');
    return { success: true, message: 'URL do webhook atualizada com sucesso!' };
  } catch (err: any) {
    console.error('[updateSendInviteWebhookUrl] Erro catch:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendInviteToClient(nome: string, whatsapp: string, inviteCode: string) {
  try {
    console.log('[sendInviteToClient] Iniciando envio de convite...');
    
    // Obter URL do webhook
    const webhookResult = await getSendInviteWebhookUrl();
    if (!webhookResult.success || !webhookResult.webhookUrl) {
      console.error('[sendInviteToClient] Webhook não configurado');
      return { success: false, error: 'Webhook não configurado no banco de dados' };
    }

    const webhookUrl = webhookResult.webhookUrl;
    console.log('[sendInviteToClient] Disparando webhook em:', webhookUrl);

    const payload = {
      type: 'send_invite_to_client',
      data: {
        nome,
        whatsapp,
        convite: inviteCode,
        data: new Date().toISOString(),
      },
    };

    console.log('[sendInviteToClient] Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('[sendInviteToClient] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[sendInviteToClient] Erro na resposta:', errorText);
      return { 
        success: false, 
        error: `Erro ao enviar convite: ${response.statusText}` 
      };
    }

    console.log('[sendInviteToClient] ✅ Convite enviado com sucesso!');
    return { success: true, message: 'Convite enviado com sucesso!' };
  } catch (err: any) {
    console.error('[sendInviteToClient] Erro catch:', err.message);
    return { success: false, error: err.message };
  }
}

export async function markInviteAsSent(inviteCode: string, recipientWhatsapp: string) {
  try {
    console.log('[markInviteAsSent] Marcando convite como enviado...');
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('invites')
      .update({
        status: 'used',
        notes: `Enviado para ${recipientWhatsapp}`,
        updated_at: new Date().toISOString(),
      })
      .eq('code', inviteCode);

    if (error) {
      console.error('[markInviteAsSent] Erro:', error);
      return { success: false, error: error.message };
    }

    console.log('[markInviteAsSent] ✅ Convite marcado como enviado');
    return { success: true };
  } catch (err: any) {
    console.error('[markInviteAsSent] Erro catch:', err.message);
    return { success: false, error: err.message };
  }
}
