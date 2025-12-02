'use server';

import { createClient } from '@/lib/supabase/server';

export async function testCompleteFlow(code: string) {
  const supabase = createClient();

  console.log('=== TESTANDO FLUXO COMPLETO ===');
  console.log('Código:', code);

  // Teste 1: Validar convite
  console.log('\n=== TESTE 1: Validar Convite ===');
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 'unused');

  if (inviteError) {
    console.error('Erro ao buscar convite:', inviteError);
    return { success: false, step: 'validate', error: inviteError.message };
  }

  if (!invite || invite.length === 0) {
    console.error('Convite não encontrado ou já usado');
    return { success: false, step: 'validate', error: 'Código inválido ou já utilizado' };
  }

  console.log('Convite encontrado:', invite[0]);

  // Teste 2: Criar pending member
  console.log('\n=== TESTE 2: Criar Pending Member ===');
  const testEmail = `teste-${Date.now()}@teste.com`;
  
  const { data: newMember, error: memberError } = await supabase
    .from('pending_members')
    .insert({
      invite_code: code.toUpperCase(),
      name: 'Teste Fluxo Completo',
      email: testEmail,
      phone: '+55 11 99999-9999',
      extra_info: { interests: ['teste'] },
    })
    .select()
    .single();

  if (memberError) {
    console.error('Erro ao criar pending member:', memberError);
    return { success: false, step: 'create_member', error: memberError.message, details: memberError };
  }

  console.log('Pending member criado:', newMember);

  // Teste 3: Incrementar times_used
  console.log('\n=== TESTE 3: Incrementar times_used ===');
  const { error: incrementError } = await supabase.rpc('increment_invite_usage', {
    code_param: code.toUpperCase(),
  });

  if (incrementError) {
    console.error('Erro ao incrementar:', incrementError);
    return { success: false, step: 'increment', error: incrementError.message };
  }

  console.log('times_used incrementado com sucesso');

  // Teste 4: Verificar se incrementou
  const { data: updatedInvite } = await supabase
    .from('invites')
    .select('times_used, max_uses')
    .eq('code', code.toUpperCase())
    .single();

  console.log('Convite atualizado:', updatedInvite);

  return {
    success: true,
    invite: invite[0],
    member: newMember,
    updatedInvite,
    message: 'Fluxo completo testado com sucesso!',
  };
}
