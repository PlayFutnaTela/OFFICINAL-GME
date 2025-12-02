'use server';

import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail, sendRejectionEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

function generateTempPassword() {
  return randomBytes(8).toString('hex');
}

export async function approveMember(id: string) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) throw new Error('Usuário não autenticado');

  // Buscar candidato
  const { data: candidate, error: candidateError } = await supabase
    .from('pending_members')
    .select('*')
    .eq('id', id)
    .single();

  if (candidateError || !candidate) {
    throw new Error('Candidato não encontrado');
  }

  const tempPassword = generateTempPassword();

  try {
    // Criar user no Auth
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email: candidate.email,
      password: tempPassword,
      email_confirm: true, // Email já confirmado automaticamente
    });

    if (authError || !newUser.user) {
      throw new Error(`Erro ao criar usuário: ${authError?.message}`);
    }

    // Criar profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        name: candidate.name,
        phone: candidate.phone,
        joined_by_invite: candidate.invite_code,
        joined_date: new Date().toISOString(),
      });

    if (profileError) {
      await supabase.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Erro ao criar profile: ${profileError.message}`);
    }

    // Atualizar pending_member
    await supabase
      .from('pending_members')
      .update({
        status: 'approved',
        reviewed_by: authData.user!.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Marcar invite como usado
    await supabase
      .from('invites')
      .update({
        status: 'used',
        used_by: newUser.user.id,
        used_at: new Date().toISOString(),
      })
      .eq('code', candidate.invite_code);

    // Enviar email de boas-vindas
    try {
      await sendWelcomeEmail({
        email: candidate.email,
        name: candidate.name,
        tempPassword,
      });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
    }

    return { success: true, user: newUser.user, tempPassword };
  } catch (error) {
    console.error('Erro ao aprovar membro:', error);
    throw error;
  }
}

export async function rejectMember(id: string, reason: string) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) throw new Error('Usuário não autenticado');

  // Buscar candidato
  const { data: candidate, error: candidateError } = await supabase
    .from('pending_members')
    .select('*')
    .eq('id', id)
    .single();

  if (candidateError || !candidate) {
    throw new Error('Candidato não encontrado');
  }

  try {
    // Atualizar status para rejected
    await supabase
      .from('pending_members')
      .update({
        status: 'rejected',
        reviewed_by: authData.user!.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', id);

    // Enviar email de rejeição
    try {
      await sendRejectionEmail({
        email: candidate.email,
        name: candidate.name,
        reason,
      });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao rejeitar membro:', error);
    throw error;
  }
}
