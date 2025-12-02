-- ============================================================================
-- Migration: add whatsapp column to profiles
-- Date: 2025-12-02
-- ============================================================================

alter table public.profiles
add column if not exists whatsapp text;

create index if not exists idx_profiles_whatsapp on public.profiles(whatsapp);

-- ============================================================================
-- Verification
-- ============================================================================

select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'profiles'
  and column_name in ('whatsapp', 'invite_code', 'joined_by_invite', 'joined_date')
order by column_name;

-- ============================================================================
-- End
-- ============================================================================
