'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function getInviteRequests(status: string = 'pending') {
  try {
    console.log('[getInviteRequests] Iniciando busca com status:', status);
    const supabase = createAdminClient();
    
    // Buscar apenas registros com o status especificado
    const { data, error } = await supabase
      .from('invite_requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getInviteRequests] Erro ao buscar:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log('[getInviteRequests] ✅ Registros com status', status + ':', data?.length || 0);

    return { success: true, data: data || [], count: data?.length || 0 };
  } catch (err: any) {
    console.error('[getInviteRequests] Erro catch:', err.message);
    console.error('[getInviteRequests] Stack:', err.stack);
    return { success: false, error: err.message, data: [] };
  }
}

export async function approveInviteRequest(requestId: string) {
  try {
    // Obter usuário autenticado
    const supabaseClient = createClient();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('[approveInviteRequest] Erro de autenticação:', authError?.message);
      return { success: false, error: 'Usuário não autenticado' };
    }

    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('invite_requests')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      console.error('[approveInviteRequest] Erro:', error);
      return { success: false, error: error.message };
    }

    console.log('[approveInviteRequest] ✅ Solicitação aprovada:', requestId);
    return { success: true, message: 'Solicitação aprovada com sucesso!' };
  } catch (err: any) {
    console.error('[approveInviteRequest] Erro:', err.message);
    return { success: false, error: err.message };
  }
}

export async function rejectInviteRequest(requestId: string, rejectionReason: string) {
  try {
    // Obter usuário autenticado
    const supabaseClient = createClient();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('[rejectInviteRequest] Erro de autenticação:', authError?.message);
      return { success: false, error: 'Usuário não autenticado' };
    }

    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('invite_requests')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      console.error('[rejectInviteRequest] Erro:', error);
      return { success: false, error: error.message };
    }

    console.log('[rejectInviteRequest] ✅ Solicitação rejeitada:', requestId);
    return { success: true, message: 'Solicitação rejeitada com sucesso!' };
  } catch (err: any) {
    console.error('[rejectInviteRequest] Erro:', err.message);
    return { success: false, error: err.message };
  }
}
