'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function markInviteAsUsed(code: string, userId: string, whatsappNumber?: string | null) {
  const supabase = createAdminClient();

  console.log('[markInviteAsUsed] Iniciado:', { code, userId });

  try {
    // Buscar o convite com segurança
    const { data: invites, error: selectError } = await supabase
      .from('invites')
      .select('id, code, status, used_by, used_at')
      .eq('code', code.toUpperCase())
      .limit(1);

    console.log('[markInviteAsUsed] Busca:', { invites, selectError });

    if (selectError) {
      console.error('[markInviteAsUsed] Erro SELECT:', selectError);
      throw new Error(`Erro ao buscar convite: ${selectError.message}`);
    }

    if (!invites || invites.length === 0) {
      throw new Error('Convite não encontrado no servidor');
    }

    const invite = invites[0];
    console.log('[markInviteAsUsed] Convite encontrado:', invite);

    // Validar se já foi usado
    if (invite.status !== 'unused') {
      throw new Error(`Convite já foi utilizado (status atual: ${invite.status})`);
    }

    // Validação do número de WhatsApp (se enviado)
    if (whatsappNumber && !/^\d{11}$/.test(whatsappNumber)) {
      throw new Error('Número de WhatsApp inválido (use 11 dígitos: DDD + número, ex: 11999999999)');
    }

    // Atualizar o convite como usado
    console.log('[markInviteAsUsed] Executando UPDATE...');
    const { error: updateError, data: updateData, status } = await supabase
      .from('invites')
      .update({
        status: 'used',
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq('code', code.toUpperCase())
      .select();

    console.log('[markInviteAsUsed] UPDATE resultado:', { status, error: updateError?.message, dataCount: updateData?.length });

    if (updateError) {
      console.error('[markInviteAsUsed] Erro UPDATE:', updateError);
      throw new Error(`Erro ao atualizar convite: ${updateError.message}`);
    }

    if (!updateData || updateData.length === 0) {
      throw new Error('Falha ao atualizar convite (sem dados retornados)');
    }

    console.log('[markInviteAsUsed] ✅ Convite atualizado');

    // Incrementar times_used
    console.log('[markInviteAsUsed] Incrementando times_used...');
    const { error: incrementError } = await supabase.rpc('increment_invite_usage', {
      code_param: code.toUpperCase(),
    });

    if (incrementError) {
      console.error('[markInviteAsUsed] Erro RPC:', incrementError);
      // Não lançar erro aqui, pois o UPDATE já foi feito
    } else {
      console.log('[markInviteAsUsed] ✅ times_used incrementado');
    }

    // Buscar email do usuário para incluir no payload (tenta via auth.admin)
    let userEmail: string | null = null;
    try {
      // admin API — pode retornar { data: { user } } or { data }
      // supabase-js v2 exposes admin.getUserById
      // try/catch to avoid breaking if API is missing
      // @ts-ignore
      const userResult = await supabase.auth.admin.getUserById(userId);
      if (userResult && (userResult.data?.user?.email || userResult.data?.email)) {
        userEmail = userResult.data.user?.email ?? userResult.data?.email ?? null;
      }
    } catch (e) {
      console.warn('[markInviteAsUsed] não foi possível obter email via auth.admin.getUserById, tentando profiles');
      try {
        const { data: profileSelect } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .limit(1);
        // profiles may not contain email column; don't assume
        // If needed, could add later
      } catch (_) {
        // silent
      }
    }

    // Enviar webhook (server-side) com whatsapp se definido
    try {
      const webhookUrl = process.env.WEBHOOK_URL || process.env.NEXT_PUBLIC_WEBHOOK_URL;
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

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        console.log('[markInviteAsUsed] Webhook enviado', webhookUrl);
      }
    } catch (webhookErr: any) {
      console.error('[markInviteAsUsed] Erro enviando webhook:', webhookErr);
      // Não falhar o fluxo por causa do webhook
    }

    return { success: true };
  } catch (err: any) {
    console.error('[markInviteAsUsed] ❌ ERRO FINAL:', err.message);
    throw new Error(err.message || 'Erro desconhecido ao marcar convite como usado');
  }
}

export async function updateProfileWithInvite(userId: string, code: string, whatsappNumber?: string | null) {
  const supabase = createAdminClient();

  console.log('[updateProfileWithInvite] Iniciado:', { userId, code });

  try {
    // Primeiro, verificar se profile existe
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .limit(1);

    console.log('[updateProfileWithInvite] Profile check:', { exists: !!existingProfile?.length, error: selectError?.message });

    if (selectError) {
      console.error('[updateProfileWithInvite] Erro SELECT:', selectError);
      throw new Error(`Erro ao buscar profile: ${selectError.message}`);
    }

    if (!existingProfile || existingProfile.length === 0) {
      // Se não existe, criar o profile
      console.log('[updateProfileWithInvite] Profile não existe, criando...');
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

      if (insertError) {
        console.error('[updateProfileWithInvite] Erro INSERT:', insertError);
        throw new Error(`Erro ao criar profile: ${insertError.message}`);
      }

      console.log('[updateProfileWithInvite] ✅ Profile criado');
      return { success: true };
    }

    // Se existe, atualizar
    console.log('[updateProfileWithInvite] Atualizando profile existente...');
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

    const { error: updateError, data: updateData } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('[updateProfileWithInvite] Erro UPDATE:', updateError);
      throw new Error(`Erro ao atualizar profile: ${updateError.message}`);
    }

    console.log('[updateProfileWithInvite] ✅ Profile atualizado');
    return { success: true };
  } catch (err: any) {
    console.error('[updateProfileWithInvite] ❌ ERRO FINAL:', err.message);
    throw new Error(err.message || 'Erro desconhecido ao atualizar profile');
  }
}
