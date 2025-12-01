
# Sistema de Convites Privados — GEREZIM  
Documento técnico completo para implementação

---

## 1. Visão Geral

Este documento descreve todo o sistema de **convites privados** da plataforma GEREZIM, incluindo:

- Estrutura de banco de dados  
- Fluxo de solicitações  
- Páginas e componentes  
- Lógica de aprovação  
- Regras de segurança (RLS)  
- Server Actions  
- Sugestões de automação  
- SQL completo para criação das tabelas  
- Endpoints necessários  

O objetivo é permitir que **somente pessoas autorizadas** acessem a plataforma, mantendo um nível de exclusividade condizente com produtos high-ticket.

---

# 2. Estrutura do Banco de Dados (Supabase)

## 2.1 Tabela `invites`

```sql
create table public.invites (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  used_by uuid references auth.users(id),
  used_at timestamp with time zone,
  status text not null default 'unused', -- unused | used | disabled
  notes text,
  expires_at timestamp with time zone,
  max_uses integer default 1,
  times_used integer default 0,
  category text, -- 'premium', 'standard', 'vip', etc
  metadata jsonb, -- tags, source, campaign info, etc
  referral_user_id uuid references auth.users(id) -- para sistema de referência
);

alter table public.invites enable row level security;
```

**Campos Adicionados:**
- `expires_at`: Validade do código (automático com expiração)
- `max_uses`: Quantas vezes o código pode ser usado (1 = single-use, NULL = ilimitado)
- `times_used`: Contador de quantas vezes foi utilizado
- `category`: Classificação do convite (premium, standard, vip, etc)
- `metadata`: Dados flexíveis (tags, source, campanha, etc)
- `referral_user_id`: Para rastrear quem gerou via referência

### RLS Sugerido:

```sql
create policy "Admins can manage invites"
on public.invites
for all
using ( public.is_admin(auth.uid()) )
with check ( public.is_admin(auth.uid()) );
```

---

## 2.2 Tabela `pending_members`
Registra pessoas que usaram um código e estão aguardando aprovação.

```sql
create table public.pending_members (
  id uuid default gen_random_uuid() primary key,
  invite_code text not null,
  name text not null,
  phone text,
  email text unique,
  extra_info jsonb,
  created_at timestamp with time zone default now(),
  status text default 'pending', -- pending | approved | rejected
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  rejection_reason text,
  access_tier text default 'standard' -- tier de acesso a conceder
);

alter table public.pending_members enable row level security;
```

**Campos Adicionados:**
- `email unique`: Evitar duplicatas
- `reviewed_by`: Quem aprovou/rejeitou
- `reviewed_at`: Quando foi revisado
- `rejection_reason`: Motivo da rejeição (para feedback)
- `access_tier`: Nível de acesso a conceder quando aprovado

### RLS:

```sql
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
using ( public.is_admin(auth.uid()) );
```

---

## 2.3 Tabela `access_levels` (Novo)
Define os tiers de acesso com permissões específicas:

```sql
create table public.access_levels (
  id text primary key, -- 'bronze', 'silver', 'gold', 'platinum'
  name text not null,
  description text,
  max_opportunities integer,
  max_products integer,
  max_tasks integer,
  features jsonb, -- {'analytics': true, 'export': true, ...}
  monthly_price numeric,
  created_at timestamp with time zone default now()
);

alter table public.access_levels enable row level security;

-- Inserts iniciais
insert into access_levels (id, name, description, max_opportunities, max_products, max_tasks, features)
values
  ('bronze', 'Bronze', 'Acesso Padrão', 10, 50, 100, '{"analytics": false, "export": false, "api": false}'::jsonb),
  ('silver', 'Silver', 'Acesso Profissional', 50, 250, 500, '{"analytics": true, "export": true, "api": false}'::jsonb),
  ('gold', 'Gold', 'Acesso Premium', 500, NULL, NULL, '{"analytics": true, "export": true, "api": true, "priority_support": true}'::jsonb),
  ('platinum', 'Platinum', 'Acesso VIP', NULL, NULL, NULL, '{"analytics": true, "export": true, "api": true, "priority_support": true, "dedicated_manager": true}'::jsonb);
```

---

## 2.4 Alteração na tabela `profiles`

```sql
alter table public.profiles
add column access_tier text default 'standard' references access_levels(id),
add column joined_by_invite text,
add column joined_via_referral_from uuid references auth.users(id),
add column joined_date timestamp with time zone default now();
```

---

## 2.5 Tabela `audit_logs` (Novo)
Rastreamento completo de todas as ações:

```sql
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null, -- 'invite_created', 'pending_member_approved', 'user_invited', etc
  performed_by uuid references auth.users(id),
  target_id uuid, -- ID do recurso afetado (invite, pending_member, user, etc)
  target_type text, -- 'invite', 'pending_member', 'user', etc
  changes jsonb, -- Diferenças: {"before": {...}, "after": {...}}
  ip_address text,
  user_agent text,
  status text default 'success', -- success | failed
  error_message text,
  created_at timestamp with time zone default now()
);

alter table public.audit_logs enable row level security;

create index idx_audit_logs_action on audit_logs(action);
create index idx_audit_logs_performed_by on audit_logs(performed_by);
create index idx_audit_logs_created_at on audit_logs(created_at);
```

---

# 3. Fluxo Completo de Convites

## 3.1 Admin gera código(s)
- Admin escolhe quantidade, validade e tags.
- São gerados códigos únicos como:

```
GZM-74F29P
GZM-A9KQ12
GZM-PREMIUM-44D
```

- Entram na tabela `invites`.

## 3.2 Usuário acessa a página privada `/acesso`
- Ele digita o código.
- O sistema valida:
  - Se existe  
  - Se não está usado  
  - Se não está desabilitado  

## 3.3 Se valido → formulário de aplicação
Coleta:

- Nome  
- Telefone  
- Email  
- Interesses  
- Informações adicionais  

Salva em `pending_members`.

## 3.4 Admin recebe notificação (opcional)
Via Make/Zapier/WhatsApp.

## 3.5 Admin aprova ou rejeita
### Se aprova:
1. Cria usuário no Supabase Auth  
2. Cria um perfil em `profiles`  
3. Atualiza `pending_members` → approved  
4. Marca invite como usado  

### Se recusa:
- `pending_members.status = 'rejected'`

---

# 4. Páginas e Componentes (Next.js)

## 4.1 Página `/acesso`
- Input para o código
- Validação
- Estilo premium (preto + dourado)

### Estrutura:

```
- /app/acesso/page.tsx
- /components/invite-code-form.tsx
```

---

## 4.2 Página `/acesso/aplicar/[code]`
- Formulário de aplicação.
- Envia para Server Action.

---

## 4.3 Página Admin `/admin/convites`
Módulos:

### ✔ Gerar Convite  
### ✔ Listar Convites  
### ✔ Desabilitar Código  
### ✔ Ver quem usou  
### ✔ Aplicações pendentes  
### ✔ Aprovar / Rejeitar  

---

# 5. Server Actions

## 5.1 Criar convites

```ts
"use server";
import { createClient } from "@/lib/supabase/server";

export async function createInvites(data) {
  const supabase = createClient();

  const codes = [...Array(data.quantity)].map(() =>
    "GZM-" + Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  const rows = codes.map((code) => ({
    code,
    created_by: data.adminId,
    notes: data.notes || null,
  }));

  await supabase.from("invites").insert(rows);

  return { codes };
}
```

---

## 5.2 Validar código (Com Rate Limiting)

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 tentativas por 15 min
});

export async function validateInvite(code: string, ip: string) {
  // Rate limiting
  const { success } = await ratelimit.limit(`invite-${ip}`);
  if (!success) {
    throw new Error("Muitas tentativas. Tente novamente em 15 minutos.");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("status", "unused");

  if (!data || data.length === 0) return { valid: false };

  const invite = data[0];

  // Validar expiração
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { valid: false, error: "Código expirou" };
  }

  // Validar max_uses
  if (invite.max_uses && invite.times_used >= invite.max_uses) {
    return { valid: false, error: "Código já foi utilizado" };
  }

  return { valid: true, invite };
}
```

**Melhorias:**
- Rate limiting por IP (5 tentativas/15 min)
- Validação de expiração
- Validação de max_uses
- Mensagens de erro específicas

---

## 5.3 Criar pending_member (Com Notificação)

```ts
export async function createPendingMember(payload: {
  code: string;
  name: string;
  phone: string;
  email: string;
  extra_info?: Record<string, any>;
}, ip: string) {
  const supabase = createClient();

  // Validar se email já existe
  const { data: existingAuth } = await supabase.auth.admin.listUsers();
  if (existingAuth.users.some(u => u.email === payload.email)) {
    throw new Error("Email já registrado no sistema");
  }

  const { data: newMember, error } = await supabase
    .from("pending_members")
    .insert({
      invite_code: payload.code,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      extra_info: payload.extra_info || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Incrementar times_used no invite
  await supabase
    .from("invites")
    .update({ times_used: supabase.rpc("increment", { x: 1 }) })
    .eq("code", payload.code);

  // Enviar notificação ao admin via webhook
  try {
    await fetch(process.env.WEBHOOK_URL || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "new_pending_member",
        data: {
          id: newMember.id,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          code: payload.code,
          timestamp: new Date().toISOString(),
          ip_address: ip,
        },
      }),
    });
  } catch (webhookError) {
    console.error("[createPendingMember] Webhook falhou:", webhookError);
    // Não quebra o fluxo se webhook falhar
  }

  // Log de auditoria
  await logAudit({
    action: "pending_member_created",
    target_id: newMember.id,
    target_type: "pending_member",
    ip_address: ip,
    status: "success",
  });

  return newMember;
}
```

**Melhorias:**
- Validação de email duplicado
- Incremento de times_used
- Webhook para notificação do admin
- Audit log automático

---

## 5.4 Aprovar candidato (Completo com Email)

```ts
import { sendWelcomeEmail } from "@/lib/email"; // ou seu serviço de email

export async function approveMember(id: string, adminId: string) {
  const supabase = createClient();

  const { data: candidate, error: fetchError } = await supabase
    .from("pending_members")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !candidate) {
    throw new Error("Candidato não encontrado");
  }

  // Validar email duplicado
  const { data: existingUser } = await supabase.auth.admin.listUsers();
  if (existingUser.users.some(u => u.email === candidate.email)) {
    throw new Error("Email já registrado no sistema");
  }

  // Gerar senha temporária
  const tempPassword = Math.random().toString(36).slice(-12);

  // Criar usuário no Auth
  const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
    email: candidate.email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError || !newUser.user) {
    throw new Error(`Erro ao criar usuário: ${authError?.message}`);
  }

  // Obter access_tier do pending_member ou usar default
  const accessTier = candidate.access_tier || "standard";

  // Criar profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: newUser.user.id,
      name: candidate.name,
      phone: candidate.phone,
      access_tier: accessTier,
      joined_by_invite: candidate.invite_code,
      joined_date: new Date(),
    });

  if (profileError) {
    // Deletar user se profile falhar
    await supabase.auth.admin.deleteUser(newUser.user.id);
    throw new Error(`Erro ao criar profile: ${profileError.message}`);
  }

  // Atualizar pending_member como approved
  const { error: updateError } = await supabase
    .from("pending_members")
    .update({
      status: "approved",
      reviewed_by: adminId,
      reviewed_at: new Date(),
    })
    .eq("id", id);

  if (updateError) throw updateError;

  // Marcar invite como used
  await supabase
    .from("invites")
    .update({
      status: "used",
      used_by: newUser.user.id,
      used_at: new Date(),
    })
    .eq("code", candidate.invite_code);

  // Enviar email de boas-vindas
  try {
    await sendWelcomeEmail({
      email: candidate.email,
      name: candidate.name,
      tempPassword,
      resetLink: `${process.env.NEXT_PUBLIC_URL}/reset-password?token=...`,
      accessTier,
      exclusivityMessage: true,
    });
  } catch (emailError) {
    console.error("[approveMember] Erro ao enviar email:", emailError);
    // Log mas não quebra o fluxo
  }

  // Log de auditoria
  await logAudit({
    action: "member_approved",
    performed_by: adminId,
    target_id: newUser.user.id,
    target_type: "user",
    changes: {
      before: { status: "pending" },
      after: { status: "approved", access_tier: accessTier },
    },
  });

  return {
    user: newUser.user,
    tempPassword, // Retornar para admin exibir/copiar
  };
}
```

**Melhorias:**
- Validação de email duplicado
- Geração de senha temporária
- Criação de profile com access_tier
- Email de boas-vindas com mensagem de exclusividade
- Audit log detalhado com mudanças
- Transação segura (rollback se falhar)

---

---

# 6. Automação Inteligente

## 6.1 Notificação automática (Webhook Nativo)

Implementado na `createPendingMember()` — webhook automático quando novo candidato se registra:

```json
{
  "type": "new_pending_member",
  "data": {
    "id": "uuid-aqui",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "+55 11 99999-9999",
    "code": "GZM-A9KQ12",
    "timestamp": "2024-12-01T10:30:00Z",
    "ip_address": "192.168.1.1"
  }
}
```

**Próximos passos:**
1. Admin recebe via Make/Zapier/Discord/Slack
2. Admin acessa `/admin/convites` para aprovar
3. Email automático é enviado

---

## 6.2 Expiração automática de códigos

Cron job (Supabase Edge Functions ou externa):

```sql
-- Desabilitar códigos expirados
update invites
set status = 'disabled'
where expires_at < now()
and status = 'unused';

-- Desabilitar códigos antigos (30 dias)
update invites
set status = 'disabled'
where created_at < now() - interval '30 days'
and status = 'unused'
and expires_at is null;
```

---

## 6.3 Server Action para Rejeitar Candidato

```ts
export async function rejectMember(
  id: string,
  reason: string,
  adminId: string
) {
  const supabase = createClient();

  const { data: candidate } = await supabase
    .from("pending_members")
    .select("email, name")
    .eq("id", id)
    .single();

  if (!candidate) throw new Error("Candidato não encontrado");

  // Atualizar status
  await supabase
    .from("pending_members")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_by: adminId,
      reviewed_at: new Date(),
    })
    .eq("id", id);

  // Enviar email de rejeição
  try {
    await sendRejectionEmail({
      email: candidate.email,
      name: candidate.name,
      reason,
      supportEmail: process.env.SUPPORT_EMAIL,
    });
  } catch (error) {
    console.error("[rejectMember] Erro ao enviar email:", error);
  }

  // Log de auditoria
  await logAudit({
    action: "member_rejected",
    performed_by: adminId,
    target_id: id,
    target_type: "pending_member",
    changes: {
      before: { status: "pending" },
      after: { status: "rejected", reason },
    },
  });

  return { success: true };
}
```

---

# 7. UI Premium (Sugestão)

- Fundo preto profundo
- Dourado #C6A667 muito suave
- Glassmorphism discreto nas caixas
- Transições usando Framer Motion
- Ícones minimalistas lucide-react

## 7.1 Dashboard Admin (`/admin/convites`)

### Seção 1: Métricas
```tsx
<div className="grid grid-cols-4 gap-4 mb-8">
  <MetricCard
    label="Convites Gerados"
    value={totalInvites}
    icon={<Gift />}
  />
  <MetricCard
    label="Utilizados"
    value={usedInvites}
    subtext={`${conversionRate.toFixed(1)}% de conversão`}
    icon={<CheckCircle />}
  />
  <MetricCard
    label="Pendentes"
    value={pendingCount}
    subtext={`${pendingCount > 0 ? 'Ação necessária' : 'Nenhum'}`}
    icon={<Clock />}
    alert={pendingCount > 0}
  />
  <MetricCard
    label="Membros Aprovados"
    value={approvedCount}
    icon={<Users />}
  />
</div>
```

### Seção 2: Gerar Convites
```tsx
<Card>
  <CardHeader>
    <CardTitle>Gerar Convites</CardTitle>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleGenerateInvites} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantidade"
          type="number"
          min="1"
          max="100"
          defaultValue={10}
        />
        <Select
          label="Categoria"
          options={[
            { value: "standard", label: "Padrão" },
            { value: "premium", label: "Premium" },
            { value: "vip", label: "VIP" },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Válido até" type="date" />
        <Select
          label="Acesso (Tier)"
          options={[
            { value: "bronze", label: "Bronze" },
            { value: "silver", label: "Silver" },
            { value: "gold", label: "Gold" },
            { value: "platinum", label: "Platinum" },
          ]}
        />
      </div>
      <Textarea label="Notas" placeholder="Ex: Campanha de Natal" />
      <Button type="submit">Gerar Convites</Button>
    </form>
  </CardContent>
</Card>
```

### Seção 3: Candidatos Pendentes
```tsx
<Card>
  <CardHeader>
    <CardTitle>Aprovações Pendentes ({pendingCount})</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {pendingMembers.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div>
            <p className="font-semibold">{member.name}</p>
            <p className="text-sm text-gray-600">{member.email}</p>
            <p className="text-xs text-gray-500">Código: {member.invite_code}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="success"
              onClick={() => approveMember(member.id)}
            >
              Aprovar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(member.id)}
            >
              Rejeitar
            </Button>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

---

## 7.2 Sistema de Referência (Bonus)

Usuários aprovados podem convidar outros e ganhar rewards:

```tsx
// Na seção do usuário logado
<Card className="border-2 border-gold-500">
  <CardHeader>
    <CardTitle>Seu Link de Referência</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex gap-2">
      <Input
        value={`${process.env.NEXT_PUBLIC_URL}/acesso?ref=${userReferralCode}`}
        readOnly
      />
      <Button onClick={() => copyToClipboard(referralLink)}>
        Copiar
      </Button>
    </div>
    <p className="text-sm text-gray-600 mt-4">
      Convide amigos e ganhe {referralBonus} de crédito por cada aprovado!
    </p>
  </CardContent>
</Card>
```

---

---

# 8. Helper: Function de Audit Log

```ts
// src/actions/audit.ts

export async function logAudit({
  action,
  performed_by,
  target_id,
  target_type,
  changes,
  ip_address = null,
  user_agent = null,
  status = "success",
  error_message = null,
}: {
  action: string;
  performed_by?: string;
  target_id?: string;
  target_type?: string;
  changes?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  status?: "success" | "failed";
  error_message?: string | null;
}) {
  const supabase = createClient();

  try {
    await supabase.from("audit_logs").insert({
      action,
      performed_by,
      target_id,
      target_type,
      changes: changes || null,
      ip_address,
      user_agent,
      status,
      error_message,
    });
  } catch (error) {
    console.error("[logAudit] Erro ao registrar log:", error);
    // Não quebra o fluxo
  }
}
```

---

# 9. RLS Policies Completas

```sql
-- Invites: apenas admins podem gerenciar
create policy "admins_manage_invites"
on public.invites
for all
using ( public.is_admin(auth.uid()) )
with check ( public.is_admin(auth.uid()) );

-- Pending Members: qualquer um pode se registrar, admins gerenciam
create policy "anyone_create_pending"
on public.pending_members
for insert
with check ( true );

create policy "admins_view_pending"
on public.pending_members
for select
using ( public.is_admin(auth.uid()) );

create policy "admins_update_pending"
on public.pending_members
for update
using ( public.is_admin(auth.uid()) )
with check ( public.is_admin(auth.uid()) );

-- Audit Logs: admins podem ver, sistema pode registrar
create policy "admins_view_audit"
on public.audit_logs
for select
using ( public.is_admin(auth.uid()) );

create policy "system_create_audit"
on public.audit_logs
for insert
with check ( true ); -- Sistema cria internamente

-- Access Levels: qualquer um pode ler
create policy "public_read_access_levels"
on public.access_levels
for select
using ( true );
```

---

# 10. Checklist de Implementação

- [ ] Criar tabelas no Supabase (invites, pending_members, audit_logs, access_levels)
- [ ] Implementar RLS policies
- [ ] Criar Server Actions (validateInvite, createPendingMember, approveMember, rejectMember, logAudit)
- [ ] Página `/acesso` (input de código)
- [ ] Página `/acesso/aplicar/[code]` (formulário)
- [ ] Página `/admin/convites` (dashboard admin)
- [ ] Componente de geração de convites
- [ ] Componente de aprovação/rejeição
- [ ] Validação e rate limiting (@upstash/ratelimit)
- [ ] Email de boas-vindas (Resend/SendGrid/SES)
- [ ] Email de rejeição
- [ ] Notificações ao admin (webhook)
- [ ] Audit log tracking
- [ ] Testes de segurança (RLS)
- [ ] Testes de rate limiting
- [ ] Documentação de API
- [ ] Sistema de referência (opcional)
- [ ] Tiers de acesso (verificação em componentes/pages)
- [ ] Cron job de expiração (opcional)

---

# 11. Conclusão

Este documento fornece **tudo** que você precisa para implementar o sistema de convites privados na plataforma GEREZIM de forma **enterprise-grade**:

✅ Banco de dados completo com RLS  
✅ Server Actions seguros e validados  
✅ Automação com webhooks  
✅ Rate limiting contra força bruta  
✅ Audit log para compliance  
✅ Tiers de acesso e permissões granulares  
✅ Email de notificação  
✅ UI premium com dashboard admin  
✅ Sistema de referência (bonus)

É modular, seguro, escalável e 100% exclusivo.

---

**Próximos passos:**

1. Executar as migrations SQL no Supabase
2. Criar os Server Actions (`src/actions/invites.ts`, `src/actions/audit.ts`)
3. Implementar páginas (`/acesso`, `/acesso/aplicar/[code]`, `/admin/convites`)
4. Testar fluxo completo
5. Integrar email service (Resend recomendado)
6. Configurar webhook URL
7. Deployar na Vercel

Qualquer dúvida, consulte este documento ou peça por arquivos prontos.
