-- ============================================================================
-- SISTEMA DE CONVITES PRIVADOS - GEREZIM
-- Data: 2024-12-01
-- Descrição: Cria tabelas e políticas RLS para sistema de convites privados
-- ============================================================================

-- ============================================================================
-- 1. TABELA: invites
-- Descrição: Armazena códigos de convite gerados pelo admin
-- ============================================================================

create table if not exists public.invites (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamp with time zone,
  status text not null default 'unused', -- unused | used | disabled
  notes text,
  max_uses integer default 1,
  times_used integer default 0,
  category text, -- 'premium', 'standard', 'vip', etc
  metadata jsonb, -- tags, source, campaign info, etc
  referral_user_id uuid references auth.users(id) on delete set null
);

-- Índices para performance
create index if not exists idx_invites_code on public.invites(code);
create index if not exists idx_invites_status on public.invites(status);
create index if not exists idx_invites_created_by on public.invites(created_by);
create index if not exists idx_invites_used_by on public.invites(used_by);

-- RLS para invites
alter table public.invites enable row level security;

create policy "Admins can manage invites"
on public.invites
for all
using ( public.is_admin(auth.uid()) )
with check ( public.is_admin(auth.uid()) );

---

-- ============================================================================
-- 2. TABELA: pending_members
-- Descrição: Registra pessoas aguardando aprovação para acessar a plataforma
-- ============================================================================

create table if not exists public.pending_members (
  id uuid default gen_random_uuid() primary key,
  invite_code text not null,
  name text not null,
  phone text,
  email text unique not null,
  extra_info jsonb,
  created_at timestamp with time zone default now(),
  status text default 'pending', -- pending | approved | rejected
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamp with time zone,
  rejection_reason text
);

-- Índices para performance
create index if not exists idx_pending_members_email on public.pending_members(email);
create index if not exists idx_pending_members_status on public.pending_members(status);
create index if not exists idx_pending_members_invite_code on public.pending_members(invite_code);
create index if not exists idx_pending_members_created_at on public.pending_members(created_at);

-- RLS para pending_members
alter table public.pending_members enable row level security;

create policy "Anyone can insert pending members"
on public.pending_members
for insert
with check (true);

create policy "Admins can view pending members"
on public.pending_members
for select
using ( public.is_admin(auth.uid()) );

create policy "Admins can update pending members"
on public.pending_members
for update
using ( public.is_admin(auth.uid()) )
with check ( public.is_admin(auth.uid()) );

---

-- ============================================================================
-- 3. ALTERAÇÃO NA TABELA: profiles
-- Descrição: Adiciona colunas para rastrear convites e referências
-- ============================================================================

alter table public.profiles
add column if not exists joined_by_invite text,
add column if not exists joined_via_referral_from uuid references auth.users(id) on delete set null,
add column if not exists joined_date timestamp with time zone default now();

-- Índice para performance
create index if not exists idx_profiles_joined_date on public.profiles(joined_date);

---

-- ============================================================================
-- 4. TABELA: audit_logs
-- Descrição: Rastreamento completo de todas as ações do sistema de convites
-- ============================================================================

create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null, -- invite_created, pending_member_created, member_approved, member_rejected, etc
  performed_by uuid references auth.users(id) on delete set null,
  target_id uuid,
  target_type text, -- invite, pending_member, user, etc
  changes jsonb, -- {"before": {...}, "after": {...}}
  ip_address text,
  user_agent text,
  status text default 'success', -- success | failed
  error_message text,
  created_at timestamp with time zone default now()
);

-- Índices para performance
create index if not exists idx_audit_logs_action on public.audit_logs(action);
create index if not exists idx_audit_logs_performed_by on public.audit_logs(performed_by);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);
create index if not exists idx_audit_logs_target_id on public.audit_logs(target_id);
create index if not exists idx_audit_logs_target_type on public.audit_logs(target_type);

-- RLS para audit_logs
alter table public.audit_logs enable row level security;

create policy "Admins can view audit logs"
on public.audit_logs
for select
using ( public.is_admin(auth.uid()) );

create policy "System can create audit logs"
on public.audit_logs
for insert
with check (true);

---

-- ============================================================================
-- 5. FUNÇÃO AUXILIAR: Validar e incrementar times_used
-- ============================================================================

create or replace function public.increment_invite_usage(code_param text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.invites
  set times_used = times_used + 1
  where code = code_param;
end;
$$;

---

-- ============================================================================
-- 6. FUNÇÃO AUXILIAR: Criar log de auditoria
-- ============================================================================

create or replace function public.log_audit_action(
  action_name text,
  performed_by_id uuid,
  target_id_param uuid,
  target_type_param text,
  changes_data jsonb default null,
  ip_address_param text default null,
  user_agent_param text default null,
  status_param text default 'success',
  error_message_param text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  log_id uuid;
begin
  insert into public.audit_logs (
    action,
    performed_by,
    target_id,
    target_type,
    changes,
    ip_address,
    user_agent,
    status,
    error_message
  ) values (
    action_name,
    performed_by_id,
    target_id_param,
    target_type_param,
    changes_data,
    ip_address_param,
    user_agent_param,
    status_param,
    error_message_param
  )
  returning id into log_id;
  
  return log_id;
end;
$$;

---

-- ============================================================================
-- 7. SEED DE DADOS (OPCIONAL)
-- Descrição: Cria alguns convites de exemplo para testes
-- ============================================================================

-- Descomente a linha abaixo se quiser adicionar convites de teste
-- Certifique-se de ter um admin_id válido antes de descomentar

/*
-- Exemplo: Gerar 5 convites de teste
insert into public.invites (code, created_by, notes, category, status)
values
  ('GZM-TEST01', (select id from auth.users where role = 'admin' limit 1), 'Teste - Premium', 'premium', 'unused'),
  ('GZM-TEST02', (select id from auth.users where role = 'admin' limit 1), 'Teste - Standard', 'standard', 'unused'),
  ('GZM-TEST03', (select id from auth.users where role = 'admin' limit 1), 'Teste - VIP', 'vip', 'unused'),
  ('GZM-TEST04', (select id from auth.users where role = 'admin' limit 1), 'Teste - Geral', 'geral', 'unused'),
  ('GZM-TEST05', (select id from auth.users where role = 'admin' limit 1), 'Teste - Disabled', 'standard', 'disabled');
*/

---

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se as tabelas foram criadas
select 
  schemaname, 
  tablename 
from pg_tables 
where schemaname = 'public' 
and tablename in ('invites', 'pending_members', 'audit_logs')
order by tablename;

-- Verificar as colunas da tabela profiles
select 
  column_name, 
  data_type 
from information_schema.columns 
where table_name = 'profiles' 
and table_schema = 'public'
and column_name in ('joined_by_invite', 'joined_via_referral_from', 'joined_date')
order by column_name;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
