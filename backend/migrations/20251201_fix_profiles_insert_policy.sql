-- ============================================================================
-- FIX: Permitir que usuários autenticados insiram seu próprio profile
-- Data: 2024-12-01
-- ============================================================================

-- Adicionar policy de INSERT para profiles
-- Permite que qualquer usuário autenticado crie seu próprio profile
create policy "Users can insert their own profile"
on public.profiles
for insert
with check ( auth.uid() = id );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar as policies criadas
select 
  policyname,
  tablename,
  cmd
from pg_policies
where tablename = 'profiles'
order by policyname;

-- ============================================================================
-- FIM DO FIX
-- ============================================================================
