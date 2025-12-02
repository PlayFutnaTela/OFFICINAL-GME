'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function markInviteAsUsed(code: string, userId: string) {
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

    return { success: true };
  } catch (err: any) {
    console.error('[markInviteAsUsed] ❌ ERRO FINAL:', err.message);
    throw new Error(err.message || 'Erro desconhecido ao marcar convite como usado');
  }
}

export async function updateProfileWithInvite(userId: string, code: string) {
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
    const { error: updateError, data: updateData } = await supabase
      .from('profiles')
      .update({
        joined_by_invite: code.toUpperCase(),
        joined_date: new Date().toISOString(),
      })
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
