'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function markInviteAsUsed(code: string, userId: string, whatsappNumber?: string | null) {
  console.log('[markInviteAsUsed] START code=', code);
  
  let supabase: any;
  try {
    supabase = createAdminClient();
  } catch (e: any) {
    const msg = String(e?.message || e);
    console.error('[markInviteAsUsed] Admin client error:', msg);
    throw new Error(`Client init: ${msg}`);
  }

  try {
    // Buscar o convite com segurança
    const { data: invites, error: selectError } = await supabase
      .from('invites')
      .select('id, code, status, used_by, used_at')
      .eq('code', code.toUpperCase())
      .limit(1);

    console.log('[markInviteAsUsed] SELECT resultado:', {
      found: invites?.length,
      selectError: selectError?.message,
      inviteStatus: invites?.[0]?.status,
    });

    if (selectError) {
      console.error('[markInviteAsUsed] ❌ Erro SELECT:', selectError);
      throw new Error(`Erro ao buscar convite: ${selectError.message}`);
    }

    if (!invites || invites.length === 0) {
      console.error('[markInviteAsUsed] ❌ Convite não encontrado para código:', code.toUpperCase());
      throw new Error('Convite não encontrado no servidor');
    }

    const invite = invites[0];
    console.log('[markInviteAsUsed] ✅ Convite encontrado');

    // Validar se já foi usado
    if (invite.status !== 'unused') {
      console.error('[markInviteAsUsed] ❌ Convite já foi utilizado:', { status: invite.status });
      throw new Error(`Convite já foi utilizado (status atual: ${invite.status})`);
    }

    // Atualizar o convite como usado
    console.log('[markInviteAsUsed] → Executando UPDATE de invites...');
    const { error: updateError, data: updateData, status } = await supabase
      .from('invites')
      .update({
        status: 'used',
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq('code', code.toUpperCase())
      .select();

    console.log('[markInviteAsUsed] UPDATE resultado:', {
      status,
      dataCount: updateData?.length,
      error: updateError?.message,
      errorCode: updateError?.code,
      errorDetails: updateError?.details,
    });

    if (updateError) {
      console.error('[markInviteAsUsed] ❌ Erro UPDATE completo:', updateError);
      throw new Error(`Erro ao atualizar convite: ${updateError.message}`);
    }

    if (!updateData || updateData.length === 0) {
      console.error('[markInviteAsUsed] ❌ UPDATE não retornou dados');
      throw new Error('Falha ao atualizar convite (sem dados retornados)');
    }

    console.log('[markInviteAsUsed] ✅ Convite atualizado com sucesso');

    // Incrementar times_used
    console.log('[markInviteAsUsed] → Incrementando times_used via RPC...');
    const { error: incrementError } = await supabase.rpc('increment_invite_usage', {
      code_param: code.toUpperCase(),
    });

    if (incrementError) {
      console.error('[markInviteAsUsed] ⚠️ Erro RPC (não crítico):', {
        message: incrementError.message,
        code: incrementError.code,
      });
      // Não lançar erro aqui, pois o UPDATE já foi feito
    } else {
      console.log('[markInviteAsUsed] ✅ times_used incrementado');
    }

    // Buscar email do usuário para incluir no payload (tenta via auth.admin)
    console.log('[markInviteAsUsed] → Buscando email do usuário...');
    let userEmail: string | null = null;
    try {
      // admin API — pode retornar { data: { user } } or { data }
      // supabase-js v2 exposes admin.getUserById
      // try/catch to avoid breaking if API is missing
      // @ts-ignore
      const userResult = await supabase.auth.admin.getUserById(userId);
      if (userResult && (userResult.data?.user?.email || userResult.data?.email)) {
        userEmail = userResult.data.user?.email ?? userResult.data?.email ?? null;
        console.log('[markInviteAsUsed] ✅ Email obtido via auth.admin');
      }
    } catch (e) {
      console.warn('[markInviteAsUsed] ⚠️ Falha ao obter email via auth.admin');
      // Continuar mesmo sem email
    }

    // Enviar webhook (server-side) com whatsapp se definido
    console.log('[markInviteAsUsed] → Enviando webhook...');
    try {
      const webhookUrl = process.env.WEBHOOK_URL || process.env.NEXT_PUBLIC_WEBHOOK_URL;
      console.log('[markInviteAsUsed] Webhook URL:', { 
        hasWebhookUrl: !!webhookUrl,
        fromEnv: webhookUrl ? 'WEBHOOK_URL' : 'NEXT_PUBLIC_WEBHOOK_URL',
      });
      
      if (webhookUrl) {
        const body = {
          type: 'user_registered_with_invite',
          data: {
            code: code.toUpperCase(),
            invite_id: updateData?.[0]?.id || invite.id,
            user_id: userId,
            email: userEmail || null,
            whatsapp: whatsappNumber || null,
            timestamp: new Date().toISOString(),
          },
        };

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        console.log('[markInviteAsUsed] Webhook enviado:', {
          status: webhookResponse.status,
          ok: webhookResponse.ok,
        });
      } else {
        console.warn('[markInviteAsUsed] ⚠️ Nenhuma webhook URL configurada');
      }
    } catch (webhookErr: any) {
      console.error('[markInviteAsUsed] ⚠️ Erro enviando webhook (não crítico):', webhookErr.message);
      // Não falhar o fluxo por causa do webhook
    }

    console.log('[markInviteAsUsed] ========== ✅ SUCESSO ==========');
    return { success: true };
  } catch (err: any) {
    console.error('[markInviteAsUsed] ❌ ERRO FINAL:', {
      message: err.message,
      stack: err.stack,
      type: err.constructor?.name,
    });
    throw new Error(err.message || 'Erro desconhecido ao marcar convite como usado');
  }
}

export async function updateProfileWithInvite(userId: string, code: string, whatsappNumber?: string | null) {
  console.log('[updateProfileWithInvite] ========== INICIANDO ==========');
  console.log('[updateProfileWithInvite] Input params:', { userId, code, hasWhatsapp: !!whatsappNumber });
  
  let supabase;
  try {
    console.log('[updateProfileWithInvite] Tentando criar admin client...');
    supabase = createAdminClient();
    console.log('[updateProfileWithInvite] ✅ Admin client criado com sucesso');
  } catch (clientErr: any) {
    console.error('[updateProfileWithInvite] ❌ Erro CRÍTICO ao criar admin client:', {
      message: clientErr.message,
      stack: clientErr.stack,
      type: clientErr.constructor?.name,
    });
    throw new Error(`Erro ao inicializar cliente administrativo: ${clientErr.message}`);
  }

  console.log('[updateProfileWithInvite] Iniciado:', { userId, code });

  try {
    // Primeiro, verificar se profile existe
    console.log('[updateProfileWithInvite] → Verificando se profile existe...');
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .limit(1);

    console.log('[updateProfileWithInvite] Profile check:', {
      exists: !!existingProfile?.length,
      error: selectError?.message,
    });

    if (selectError) {
      console.error('[updateProfileWithInvite] ❌ Erro SELECT:', selectError);
      throw new Error(`Erro ao buscar profile: ${selectError.message}`);
    }

    if (!existingProfile || existingProfile.length === 0) {
      // Se não existe, criar o profile
      console.log('[updateProfileWithInvite] → Profile não existe, criando novo...');
      const { error: insertError, data: insertData } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          invite_code: code.toUpperCase(),
          whatsapp: whatsappNumber || null,
          joined_by_invite: code.toUpperCase(),
          joined_date: new Date().toISOString(),
        })
        .select();

      console.log('[updateProfileWithInvite] INSERT resultado:', {
        dataCount: insertData?.length,
        error: insertError?.message,
      });

      if (insertError) {
        console.error('[updateProfileWithInvite] ❌ Erro INSERT completo:', insertError);
        throw new Error(`Erro ao criar profile: ${insertError.message}`);
      }

      console.log('[updateProfileWithInvite] ✅ Profile criado com sucesso');
      return { success: true };
    }

    // Se existe, atualizar
    console.log('[updateProfileWithInvite] → Profile existe, atualizando...');
    const updatePayload: any = {
      // keep existing update fields, do not overwrite any other user profile fields
      invite_code: code.toUpperCase(),
      joined_by_invite: code.toUpperCase(),
      joined_date: new Date().toISOString(),
    };

    // Only persist whatsapp if provided (don't overwrite existing value with null)
    if (whatsappNumber) {
      updatePayload.whatsapp = whatsappNumber;
    }

    console.log('[updateProfileWithInvite] → Executando UPDATE de profiles...');
    const { error: updateError, data: updateData } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select();

    console.log('[updateProfileWithInvite] UPDATE resultado:', {
      dataCount: updateData?.length,
      error: updateError?.message,
    });

    if (updateError) {
      console.error('[updateProfileWithInvite] ❌ Erro UPDATE completo:', updateError);
      throw new Error(`Erro ao atualizar profile: ${updateError.message}`);
    }

    console.log('[updateProfileWithInvite] ✅ Profile atualizado com sucesso');
    console.log('[updateProfileWithInvite] ========== ✅ SUCESSO ==========');
    return { success: true };
  } catch (err: any) {
    console.error('[updateProfileWithInvite] ❌ ERRO FINAL:', {
      message: err.message,
      stack: err.stack,
      type: err.constructor?.name,
    });
    throw new Error(err.message || 'Erro desconhecido ao atualizar profile');
  }
}
