-- ============================================================================
-- FIX: Permitir usuários autenticados lerem convites não utilizados
-- Data: 2024-12-01
-- ============================================================================

-- Remover policies antigas se existirem
drop policy if exists "Authenticated users can read unused invites" on public.invites;
drop policy if exists "Authenticated users can mark invite as used" on public.invites;
drop policy if exists "Authenticated users can update their invite" on public.invites;

-- Adicionar política para usuários autenticados lerem convites disponíveis
create policy "Authenticated users can read unused invites"
on public.invites
for select
using ( auth.role() = 'authenticated' and status = 'unused' );

-- Permitir que qualquer usuário autenticado atualize um convite para marcar como usado
-- Esta é a política mais importante para a segurança!
create policy "Authenticated users can mark invite as used"
on public.invites
for update
using ( 
  auth.role() = 'authenticated' 
)
with check (
  auth.role() = 'authenticated'
  and status = 'used'  -- Só permite atualizar se mudou para 'used'
  and used_by = auth.uid()  -- E se o used_by é o usuário atual
);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar as policies criadas
select 
  policyname,
  tablename,
  cmd
from pg_policies
where tablename = 'invites'
order by policyname;

-- ============================================================================
-- FIM DO FIX
-- ============================================================================

