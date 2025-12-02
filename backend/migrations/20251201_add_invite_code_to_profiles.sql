-- ============================================================================
-- Adicionar coluna invite_code à tabela profiles
-- Data: 2024-12-01
-- ============================================================================

-- Adicionar coluna invite_code para rastrear qual código de convite foi usado
alter table public.profiles
add column if not exists invite_code text;

-- Criar índice para performance
create index if not exists idx_profiles_invite_code on public.profiles(invite_code);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar se a coluna foi criada
select 
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_name = 'profiles'
and column_name in ('invite_code', 'joined_by_invite', 'joined_date')
order by column_name;

-- ============================================================================
-- FIM
-- ============================================================================
