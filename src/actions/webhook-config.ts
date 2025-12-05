'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function getWebhookUrl() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('webhook_configurations')
      .select('webhook_url')
      .eq('event_type', 'user_registered_with_invite')
      .eq('active', true)
      .limit(1);

    if (error) {
      console.error('[getWebhookUrl] Erro:', error);
      return { success: false, error: error.message };
    }

    const webhookUrl = data?.[0]?.webhook_url || null;
    return { success: true, webhookUrl };
  } catch (err: any) {
    console.error('[getWebhookUrl] Erro:', err.message);
    return { success: false, error: err.message };
  }
}

export async function updateWebhookUrl(newUrl: string) {
  try {
    if (!newUrl || !newUrl.startsWith('http')) {
      return { success: false, error: 'URL inválida. Deve começar com http ou https.' };
    }

    const supabase = createAdminClient();
    
    // Tenta atualizar; se não existir, insere
    const { error: updateError } = await supabase
      .from('webhook_configurations')
      .update({ webhook_url: newUrl, updated_at: new Date().toISOString() })
      .eq('event_type', 'user_registered_with_invite')
      .eq('active', true);

    if (updateError) {
      console.error('[updateWebhookUrl] Erro UPDATE:', updateError);
      // Tenta inserir se update falhar
      const { error: insertError } = await supabase
        .from('webhook_configurations')
        .insert({
          event_type: 'user_registered_with_invite',
          webhook_url: newUrl,
          active: true,
        });

      if (insertError) {
        console.error('[updateWebhookUrl] Erro INSERT:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    console.log('[updateWebhookUrl] ✅ URL atualizada com sucesso:', newUrl);
    return { success: true, webhookUrl: newUrl };
  } catch (err: any) {
    console.error('[updateWebhookUrl] Erro:', err.message);
    return { success: false, error: err.message };
  }
}
