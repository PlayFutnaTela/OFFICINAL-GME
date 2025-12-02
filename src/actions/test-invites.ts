'use server';

import { createClient } from '@/lib/supabase/server';

export async function testInviteSystem() {
  const supabase = createClient();

  // Teste 1: Verificar se a tabela existe
  console.log('=== TESTE 1: Verificar tabelas ===');
  const { data: tables, error: tablesError } = await supabase
    .from('pending_members')
    .select('*')
    .limit(1);

  console.log('pending_members existe?', !tablesError);
  if (tablesError) console.error('Erro:', tablesError);

  // Teste 2: Tentar inserir direto
  console.log('\n=== TESTE 2: Inserir registro de teste ===');
  const { data: testInsert, error: insertError } = await supabase
    .from('pending_members')
    .insert({
      invite_code: 'TEST-CODE',
      name: 'Teste Sistema',
      email: 'teste@teste.com',
      phone: '+55 11 99999-9999',
      status: 'pending',
    })
    .select()
    .single();

  console.log('Insert bem-sucedido?', !insertError);
  if (insertError) {
    console.error('Erro no insert:', insertError);
    return { success: false, error: insertError.message, details: insertError };
  }

  console.log('Registro criado:', testInsert);

  // Teste 3: Verificar RLS
  console.log('\n=== TESTE 3: Verificar RLS ===');
  const { data: rlsPolicies } = await supabase
    .rpc('pg_policies')
    .eq('tablename', 'pending_members');

  console.log('Policies RLS:', rlsPolicies);

  return {
    success: true,
    testInsert,
    message: 'Sistema de convites funcionando!',
  };
}
