-- ============================================================================
-- FIX CRÍTICO: Permitir usuários atualizarem invites para marcar como used
-- Data: 2024-12-01
-- ============================================================================

-- Remover policies antigas que podem estar conflitando
drop policy if exists "Authenticated users can mark invite as used" on public.invites;
drop policy if exists "Authenticated users can update their invite" on public.invites;

-- Adicionar policy para permitir UPDATE de invites por usuários autenticados
-- CRUCIAL: Permitir atualizar um convite quando o status muda para 'used'
create policy "Users can mark invite as used"
on public.invites
for update
using ( 
  auth.role() = 'authenticated'
)
with check (
  auth.role() = 'authenticated'
  and status = 'used'
);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar as policies criadas
select 
  policyname,
  tablename,
  cmd,
  qual
from pg_policies
where tablename = 'invites'
order by policyname;

-- ============================================================================
-- FIM DO FIX
-- ============================================================================
