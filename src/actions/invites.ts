'use server';

import { createClient } from '@/lib/supabase/server';

export async function createInvites(data: {
  quantity: number;
  category?: string;
  notes?: string;
}) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) throw new Error('Usuário não autenticado');

  const codes = Array.from({ length: data.quantity }).map(() =>
    'GZM-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  const rows = codes.map((code) => ({
    code,
    created_by: authData.user!.id,
    notes: data.notes || null,
    category: data.category || 'standard',
  }));

  const { data: inserted, error } = await supabase
    .from('invites')
    .insert(rows)
    .select();

  if (error) throw error;
  return { codes, inserted };
}

export async function validateInvite(code: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 'unused');

  if (error || !data || data.length === 0) {
    return { valid: false, error: 'Código inválido ou já utilizado' };
  }

  const invite = data[0];

  if (invite.max_uses && invite.times_used >= invite.max_uses) {
    return { valid: false, error: 'Código já foi utilizado (máximo atingido)' };
  }

  return { valid: true, invite };
}

export async function createPendingMember(payload: {
  code: string;
  name: string;
  phone: string;
  email: string;
  extra_info?: Record<string, any>;
}) {
  const supabase = createClient();

  console.log('createPendingMember iniciado', payload);

  // Validar se email não existe em profiles
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', payload.email)
    .maybeSingle();

  if (existingUser) {
    console.error('Email já existe em profiles');
    throw new Error('Este email já está registrado no sistema');
  }

  // Validar se email não está em pending_members
  const { data: existingPending } = await supabase
    .from('pending_members')
    .select('id')
    .eq('email', payload.email)
    .maybeSingle();

  if (existingPending) {
    console.error('Email já existe em pending_members');
    throw new Error('Este email já possui uma solicitação pendente');
  }

  // Criar pending member
  console.log('Inserindo pending member no BD...');
  const { data: newMember, error } = await supabase
    .from('pending_members')
    .insert({
      invite_code: payload.code.toUpperCase(),
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      extra_info: payload.extra_info || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir pending member:', error);
    throw error;
  }

  console.log('Pending member criado:', newMember);

  // Incrementar times_used
  await supabase.rpc('increment_invite_usage', {
    code_param: payload.code.toUpperCase(),
  });

  // Enviar webhook ao admin
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_pending_member',
          data: {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            interests: payload.extra_info?.interests || [],
            code: payload.code,
          },
        }),
      });
    }
  } catch (webhookError) {
    console.error('Erro ao enviar webhook:', webhookError);
    // Não falha a requisição se webhook falhar
  }

  return newMember;
}
