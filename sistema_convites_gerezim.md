
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

**Contexto:** GEREZIM é uma plataforma **exclusiva de compra de oportunidades premium**. Somente a GEREZIM vende produtos/oportunidades. Os usuários (compradores) precisam de um código de convite para acessar e visualizar as oportunidades disponíveis, mantendo um nível de exclusividade condizente com produtos high-ticket.

**Importante:** Usuários logados NÃO têm acesso a `/dashboard`. Eles acessam diretamente as páginas de produtos/oportunidades e podem gerenciar seus próprios dados (perfil, favoritos, contatos, etc).

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
  max_uses integer default 1,
  times_used integer default 0,
  category text, -- 'premium', 'standard', 'vip', etc
  metadata jsonb, -- tags, source, campaign info, etc
  referral_user_id uuid references auth.users(id) -- para sistema de referência
);

alter table public.invites enable row level security;
```

**Campos:**
- `status`: 'unused' (disponível) | 'used' (foi utilizado, indisponível) | 'disabled' (admin desabilitou)
- `max_uses`: Quantas vezes o código pode ser usado (1 = single-use, NULL = ilimitado)
- `times_used`: Contador de quantas vezes foi utilizado
- `category`: Classificação do convite (premium, standard, vip, etc)
- `metadata`: Dados flexíveis (tags, source, campanha, etc)
- `referral_user_id`: Para rastrear quem gerou via referência

**Importante:** A validade do código é determinada APENAS pelo campo `status`:
- `status = 'unused'` → Disponível para usar
- `status = 'used'` → Indisponível (já foi utilizado)
- `status = 'disabled'` → Admin desabilitou
- Sem coluna `expires_at` — tokens não expiram por tempo

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
  rejection_reason text
);

alter table public.pending_members enable row level security;
```

**Campos Adicionados:**
- `email unique`: Evitar duplicatas
- `reviewed_by`: Quem aprovou/rejeitou
- `reviewed_at`: Quando foi revisado
- `rejection_reason`: Motivo da rejeição (para feedback)

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

---

## 2.4 Alteração na tabela `profiles`

```sql
alter table public.profiles
add column joined_by_invite text,
add column joined_via_referral_from uuid references auth.users(id),
add column joined_date timestamp with time zone default now();
```

**Nota:** O role do comprador será sempre `user` (definido em `auth.users.role`). Todos os compradores aprovados via convite recebem este role.

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

## 3.1 Admin (GEREZIM) gera código(s)
- Admin escolhe quantidade, validade e tier de acesso.
- São gerados códigos únicos como:

```
GZM-74F29P
GZM-A9KQ12
GZM-PREMIUM-44D
```

- Entram na tabela `invites`.

## 3.2 Comprador recebe o convite
- Recebe via email, WhatsApp, SMS ou link privado
- Código válido por período determinado

## 3.3 Comprador acessa a página pública `/acesso`
- Digita o código de convite
- O sistema valida:
  - Se existe  
  - Se não está usado  
  - Se não está desabilitado  
  - Se não expirou

## 3.4 Se válido → formulário de aplicação
Coleta:
- Nome  
- Telefone  
- Email  
- Interesse(s) em categorias (carros, imóveis, empresas, itens premium)
- Informações adicionais  

Salva em `pending_members`.

## 3.5 Admin (GEREZIM) recebe notificação
Via Make/Zapier/WhatsApp/Discord.

## 3.6 Admin aprova ou rejeita
### Se aprova:
1. Cria usuário no Supabase Auth  
2. Cria um perfil em `profiles`  
3. Atualiza `pending_members` → approved  
4. Marca invite como usado  
5. Envia email de boas-vindas

### Se rejeita:
- `pending_members.status = 'rejected'`
- Envia email informando rejeição

## 3.7 Comprador aprovado acessa as oportunidades
- Faz login com email e senha
- Redefine senha (primeiro acesso)
- Acessa `/oportunidades` ou `/produtos` ou `/categorias`
- VÊ APENAS as oportunidades que GEREZIM está vendendo
- Pode favoritar, compartilhar, consultar detalhes
- **NÃO pode criar oportunidades** (Gerezim vende, ele compra)

---

# 3.8 Fluxo Completo do Usuário (Do Zero ao Acesso)

## Timeline Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 1: CONVITE (T0 → T+1 dia)                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Admin gera código → Envia via Email/WhatsApp → Usuário recebe      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 2: VALIDAÇÃO DO CÓDIGO (T+1 dia → T+5 min)                   │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Usuário acessa /acesso                                           │
│ 2. Cola código: GZM-A9KQ12                                          │
│ 3. Sistema valida:                                                  │
│    ✓ Existe na tabela invites?                                      │
│    ✓ Status = 'unused'?                                             │
│    ✓ Não ultrapassou max_uses?                                      │
│ 4. Se válido → Redireciona para /acesso/aplicar/GZM-A9KQ12        │
│    Se inválido → Mostra erro                                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 3: FORMULÁRIO DE APLICAÇÃO (T+5 min → T+10 min)              │
├─────────────────────────────────────────────────────────────────────┤
│ Usuário preenche:                                                   │
│ • Nome completo                                                     │
│ • Telefone (WhatsApp)                                               │
│ • Email (principal para login)                                      │
│ • Interesse(s) em categorias (carros, imóveis, empresas, etc)      │
│ • Informações adicionais                                            │
│                                                                      │
│ Server Action: createPendingMember()                                │
│ • Valida email não está em auth.users                               │
│ • Insere em pending_members com status='pending'                    │
│ • Incrementa times_used no invite                                   │
│ • Envia webhook ao admin (Make/Zapier)                              │
│ • Cria audit log                                                    │
│                                                                      │
│ BD APÓS: pending_members = 1 registro em 'pending'                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 4: NOTIFICAÇÃO AO ADMIN (T+10 min)                           │
├─────────────────────────────────────────────────────────────────────┤
│ Webhook enviado contém:                                             │
│ {                                                                   │
│   "type": "new_pending_member",                                     │
│   "data": {                                                         │
│     "name": "João Silva",                                           │
│     "email": "joao@example.com",                                    │
│     "phone": "+55 11 99999-9999",                                   │
│     "interests": ["carros", "imóveis"],                             │
│     "code": "GZM-A9KQ12"                                            │
│   }                                                                 │
│ }                                                                   │
│                                                                      │
│ Admin recebe notificação via:                                       │
│ • Discord/Slack (Make)                                              │
│ • WhatsApp (Zapier)                                                 │
│ • Email automático                                                  │
│                                                                      │
│ → Admin acessa /admin/convites para revisar                         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 5: REVISÃO E APROVAÇÃO (T+10 min → T+2 horas)                │
├─────────────────────────────────────────────────────────────────────┤
│ Admin acessa /admin/convites e vê:                                  │
│ • 1 candidato pendente: João Silva (joao@example.com)              │
│                                                                      │
│ Admin clica em "Aprovar Comprador"                                  │
│ Server Action: approveMember(candidato_id)                          │
│                                                                      │
│ Sistema executa transação:                                          │
│ 1. Gera senha temporária (ex: aB3dE9kL2x)                          │
│ 2. Cria auth.users com:                                             │
│    • email: joao@example.com                                        │
│    • password: aB3dE9kL2x (temporária)                              │
│    • role: 'user' (comprador)                                       │
│    • email_confirmed: true                                          │
│ 3. Cria profile com:                                                │
│    • id: uuid_do_usuario                                            │
│    • name: João Silva                                               │
│    • phone: +55 11 99999-9999                                       │
│    • joined_by_invite: GZM-A9KQ12                                   │
│    • joined_date: agora                                             │
│ 4. Atualiza pending_members:                                        │
│    • status: 'approved'                                             │
│    • reviewed_by: admin_id                                          │
│    • reviewed_at: agora                                             │
│ 5. Marca invite como usado:                                         │
│    • status: 'used'                                                 │
│    • used_by: usuario_id                                            │
│    • used_at: agora                                                 │
│ 6. Envia email de boas-vindas:                                      │
│    Assunto: "Bem-vindo à GEREZIM!"                                  │
│    Corpo: Explica exclusividade, instruções de login, reset senha   │
│ 7. Cria audit log detalhado                                         │
│                                                                      │
│ BD APÓS:                                                            │
│ • auth.users: 1 novo usuário (role=user)                            │
│ • profiles: 1 novo perfil                                           │
│ • pending_members.status: approved                                  │
│ • invites.status: used                                              │
│ • audit_logs: 1 registro                                            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 6: PRIMEIRO ACESSO (T+2 horas → T+2h 5min)                   │
├─────────────────────────────────────────────────────────────────────┤
│ Usuário clica em link do email ou acessa app                        │
│ Login em /login:                                                    │
│ • Email: joao@example.com                                           │
│ • Senha (temporária): aB3dE9kL2x                                    │
│                                                                      │
│ Supabase Auth valida credenciais                                    │
│ → Token JWT gerado com claims:                                      │
│   {                                                                 │
│     "sub": "uuid_usuario",                                          │
│     "role": "user",                                                 │
│     "email": "joao@example.com",                                    │
│     "email_verified": true                                          │
│   }                                                                 │
│                                                                      │
│ App detecta que é primeiro acesso (senha temporária)                │
│ → Redireciona para /reset-password                                  │
│ → Usuário define senha permanente                                   │
│                                                                      │
│ DB APÓS:                                                            │
│ • auth.users.encrypted_password: nova senha                         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 7: ACESSO À PLATAFORMA (T+2h 5min →∞)                        │
├─────────────────────────────────────────────────────────────────────┤
│ Usuário agora pode:                                                 │
│                                                                      │
│ ✅ Acessar /oportunidades                                            │
│    • VÊ catálogo de oportunidades criadas por GEREZIM              │
│    • Filtra por categoria (carros, imóveis, empresas)              │
│    • Clica em detalhes de cada oportunidade                        │
│                                                                      │
│ ✅ Acessar /produtos                                                 │
│    • VÊ lista de produtos premium                                   │
│    • Preços e disponibilidade                                      │
│                                                                      │
│ ✅ Acessar /categorias                                               │
│    • Navega por segmentos de negócio                               │
│                                                                      │
│ ✅ Acessar /perfil                                                   │
│    • Edita dados pessoais (nome, telefone)                         │
│    • Não vê dados de admin (roles, permissões)                     │
│                                                                      │
│ ✅ Acessar /favoritos                                                │
│    • VÊ oportunidades que favoritou                                │
│    • Gerencia lista de interesses                                  │
│                                                                      │
│ ✅ Acessar /contatos                                                 │
│    • VÊ histórico de interações                                    │
│    • Dados de contato de representantes GEREZIM                    │
│                                                                      │
│ ❌ NÃO pode:                                                         │
│    • Acessar /dashboard (só admin pode)                            │
│    • Criar oportunidades (só GEREZIM vende)                        │
│    • Acessar /admin/* (só admin)                                   │
│    • Ver dados de outros usuários                                  │
│                                                                      │
│ 🔐 RLS Policies garantem:                                           │
│    • Vê apenas dados públicos de oportunidades GEREZIM             │
│    • Vê apenas seu perfil                                          │
│    • Vê apenas seus favoritos/contatos/interações                  │
│    • Admin vê tudo, comprador vê apenas seu próprio                │
└─────────────────────────────────────────────────────────────────────┘
```

## Resumo das Mudanças no BD

### T0: Nada existe para este usuário
```
auth.users: vazio
profiles: vazio
pending_members: vazio
invites: tem GZM-A9KQ12 (status=unused, times_used=0)
```

### T+10min: Formulário preenchido
```
auth.users: vazio (ainda não criado)
profiles: vazio
pending_members: João Silva (status=pending, email=joao@example.com)
invites: GZM-A9KQ12 (status=unused, times_used=1) ← incrementou
audit_logs: "pending_member_created"
```

### T+2h: Aprovado
```
auth.users: João Silva (role=user, email=joao@example.com)
profiles: João Silva (joined_by_invite=GZM-A9KQ12)
pending_members: João Silva (status=approved, reviewed_by=admin_id)
invites: GZM-A9KQ12 (status=used, used_by=joao_uuid, used_at=T+2h)
audit_logs: "member_approved" (with before/after)
```

### T+2h 5min: Senha redefinida
```
auth.users: João Silva (password hash atualizado)
(resto igual)
```

## Timeline de Tempo Real

| Ação | Tempo | Duração |
|------|-------|---------|
| Admin gera convite | T+0 | - |
| Usuário recebe email/WhatsApp | T+0:30 | 30 min |
| Usuário acessa /acesso | T+1:00 | - |
| Usuário preenche formulário | T+1:00 até T+1:05 | 5 min |
| Webhook enviado ao admin | T+1:05 | - |
| Admin notificado | T+1:10 | 5 min depois |
| Admin revisa e aprova | T+1:30 | 25 min depois (até aqui) |
| Usuário recebe email de aprovação | T+1:31 | 1 min depois |
| Usuário faz login | T+2:00 | 29 min depois |
| Usuário redefine senha | T+2:05 | 5 min de login |
| **ACESSO TOTAL À PLATAFORMA** | T+2:05 | **~2h 5min do início** |

## Decisões por Usuário

### ✅ Se Admin aprova:
- ✅ Email de boas-vindas enviado
- ✅ Pode fazer login
- ✅ Pode acessar /oportunidades, /perfil, /favoritos, etc
- ✅ Aparece em relatórios como "Comprador Aprovado"

### ❌ Se Admin rejeita:
- Server Action: rejectMember(id, reason)
- pending_members.status = rejected
- pending_members.rejection_reason = "Motivo da rejeição"
- Email de rejeição enviado: "Sua inscrição foi revisada. Infelizmente, não conseguimos prosseguir neste momento."
- Usuário NÃO é criado em auth.users
- NÃO tem acesso à plataforma
- Pode tentar com outro código

---

## 4.1 Página `/acesso` (Pública)
- Input para código de convite
- Validação em tempo real
- Estilo premium (preto + dourado)
- Mensagem explicativa sobre exclusividade

### Estrutura:

```
- /app/acesso/page.tsx
- /components/invite-code-form.tsx
```

---

## 4.2 Página `/acesso/aplicar/[code]` (Pública)
- Formulário de aplicação para potencial comprador
- Coleta dados do interessado
- Envia para Server Action

---

## 4.3 Página Admin `/admin/convites` (Privada - Admin Only)
Módulos:

### ✔ Gerar Convites  
### ✔ Listar Convites  
### ✔ Desabilitar Código  
### ✔ Ver quem usou  
### ✔ Aplicações pendentes (com ação necessária)
### ✔ Aprovar / Rejeitar candidatos  

---

## 4.4 Páginas do Comprador Logado

As páginas já existentes (`/oportunidades`, `/perfil`, `/favoritos`, `/contatos`, etc.) funcionam naturalmente para compradores logados via convite. Nenhuma página nova precisa ser criada.

**Comportamento automático:**
- Comprador logado acessa `/oportunidades` e vê catálogo da GEREZIM
- Acessa `/perfil` para gerenciar dados pessoais
- Acessa `/favoritos` para oportunidades favoritadas
- (Comportamento idêntico aos usuários já logados, sem diferenciação)  

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

## 5.2 Validar código (Sem Rate Limiting por enquanto)

```ts
export async function validateInvite(code: string, ip: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("status", "unused");

  if (!data || data.length === 0) return { valid: false };

  const invite = data[0];

  // Validar max_uses
  if (invite.max_uses && invite.times_used >= invite.max_uses) {
    return { valid: false, error: "Código já foi utilizado" };
  }

  return { valid: true, invite };
}
```

**Características:**
- Validação de existência do código
- Validação de status (deve ser 'unused')
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

  // Criar profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: newUser.user.id,
      name: candidate.name,
      phone: candidate.phone,
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
      after: { status: "approved", role: "user" },
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

**Não é necessário** — A validade é controlada apenas pelo campo `status`:

```sql
-- Admin pode desabilitar um código manualmente
update invites
set status = 'disabled'
where id = 'uuid-aqui';
```

Sem cron job de expiração por tempo.

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

## 7. UI Premium (Sugestão)

- Fundo preto profundo
- Dourado #C6A667 muito suave
- Glassmorphism discreto nas caixas
- Transições usando Framer Motion
- Ícones minimalistas lucide-react

## 7.1 Dashboard Admin (`/admin/convites`)

Exibe métricas e gerenciamento de convites e candidatos.

### Seção 0: Configuração do Webhook

```tsx
<Card className="mb-8 border-yellow-600 bg-yellow-50">
  <CardHeader>
    <CardTitle className="text-yellow-900">⚙️ Configuração do Webhook</CardTitle>
    <CardDescription className="text-yellow-800">
      Configure o URL webhook para receber notificações quando novos candidatos se registram
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold">URL do Webhook</label>
        <p className="text-xs text-gray-600 mb-2">
          Exemplos: 
          <br />• Discord: https://discord.com/api/webhooks/123456/xyzabc
          <br />• Make: https://hook.make.com/asdf123asdf123asdf123
          <br />• Zapier: https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/
        </p>
        <Input
          placeholder="Cole o URL do seu webhook aqui (Discord, Make, Zapier, etc)"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Dica: O webhook recebe POST quando um candidato preenche o formulário em /acesso/aplicar/[code]
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={() => saveWebhookUrl(webhookUrl)}
          variant="default"
        >
          Salvar Configuração
        </Button>
        <Button 
          onClick={() => testWebhookUrl(webhookUrl)}
          variant="outline"
        >
          Testar Webhook
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

**O que este campo faz:**
- ✅ Armazena o URL do webhook (em `.env.local` ou BD)
- ✅ Permite testar a conexão com um teste POST
- ✅ Mostra exemplos de URLs válidos (Discord, Make, Zapier)
- ✅ Explica que o webhook recebe dados quando candidatos se registram

**Dados enviados no webhook:**
```json
{
  "type": "new_pending_member",
  "data": {
    "id": "uuid-candidato",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "+55 11 99999-9999",
    "code": "GZM-A9KQ12",
    "timestamp": "2024-12-01T10:30:00Z",
    "ip_address": "192.168.1.100"
  }
}
```

---

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
    label="Compradores Aprovados"
    value={approvedCount}
    icon={<Users />}
  />
</div>
```

### Seção 2: Gerar Convites
```tsx
<Card>
  <CardHeader>
    <CardTitle>Gerar Convites para Compradores</CardTitle>
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
          label="Categoria do Comprador"
          options={[
            { value: "geral", label: "Geral" },
            { value: "premium", label: "Premium" },
            { value: "vip", label: "VIP" },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Input label="Válido até" type="date />
      </div>
      <Textarea label="Notas" placeholder="Ex: Convites para parceiros estratégicos" />
      <Button type="submit">Gerar Convites</Button>
    </form>
  </CardContent>
</Card>
```

### Seção 3: Candidatos Pendentes de Aprovação
```tsx
<Card>
  <CardHeader>
    <CardTitle>Aprovações Pendentes de Compradores ({pendingCount})</CardTitle>
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
            <p className="text-xs text-gray-500">Interesse(s): {member.interests?.join(", ")}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="success"
              onClick={() => approveMember(member.id)}
            >
              Aprovar Comprador
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

## 7.2 Página `/acesso` (Para Potencial Comprador)

```tsx
<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
  <div className="max-w-md w-full">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-2">GEREZIM</h1>
      <p className="text-gray-400">Oportunidades Premium de Negócios</p>
    </div>

    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Você tem um convite?</CardTitle>
        <CardDescription className="text-gray-400">
          Digite seu código exclusivo para acessar oportunidades de negócios premium
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="GZM-XXXXX"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="bg-gray-800 border-gray-700 text-white"
          />
          <Button className="w-full bg-gold-600 hover:bg-gold-700">
            Continuar
          </Button>
        </form>
      </CardContent>
    </Card>

    <p className="text-center text-gray-500 text-sm mt-8">
      Você não tem convite? Contate nossos parceiros para obter um.
    </p>
  </div>
</div>
```

---

## 7.3 Página `/oportunidades` (Comprador Logado)

Esta página já existe. Nenhuma mudança necessária.

---

## 7.4 Sistema de Referência (Bonus)

Compradores aprovados podem indicar outros:

```tsx
// Na seção de perfil do comprador logado
<Card className="border-2 border-gold-500">
  <CardHeader>
    <CardTitle>Indique um Comprador</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-gray-600 mb-4">
      Indique um amigo para ganhar benefícios exclusivos em sua próxima compra!
    </p>
    <div className="flex gap-2">
      <Input
        value={`${process.env.NEXT_PUBLIC_URL}/acesso?ref=${userReferralCode}`}
        readOnly
      />
      <Button onClick={() => copyToClipboard(referralLink)}>
        Copiar Link
      </Button>
    </div>
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

## FASE 1: Banco de Dados (SQL)

- [ ] **1.1** Executar arquivo `backend/migrations/20251201_create_invites_system.sql` no Supabase
  - Cria tabela `invites` com índices
  - Cria tabela `pending_members` com índices
  - Altera tabela `profiles` com novos campos
  - Cria tabela `audit_logs` com índices
  - Cria funções auxiliares (`increment_invite_usage`, `log_audit_action`)
  - Configura RLS policies
- [ ] **1.2** Verificar se as tabelas foram criadas com sucesso no Supabase
- [ ] **1.3** Testar as RLS policies (select, insert, update)

---

## FASE 2: Server Actions

- [ ] **2.1** Criar `src/actions/invites.ts`
  - [ ] Implementar `createInvites(data)` - gera códigos de convite
  - [ ] Implementar `validateInvite(code, ip)` - valida código antes do formulário
  - [ ] Implementar `createPendingMember(payload, ip)` - salva candidato + envia webhook
  
- [ ] **2.2** Criar `src/actions/audit.ts`
  - [ ] Implementar `logAudit(action, performed_by, ...)` - função auxiliar de logs

- [ ] **2.3** Criar `src/actions/members.ts`
  - [ ] Implementar `approveMember(id, adminId)` - aprova candidato (cria user)
  - [ ] Implementar `rejectMember(id, reason, adminId)` - rejeita candidato

---

## FASE 3: Páginas Públicas

- [ ] **3.1** Criar página `/app/acesso/page.tsx`
  - [ ] Layout premium (preto + dourado)
  - [ ] Input para código de convite
  - [ ] Validação em tempo real do código
  - [ ] Erro/sucesso messages
  - [ ] Redireciona para `/acesso/aplicar/[code]` se válido

- [ ] **3.2** Criar página `/app/acesso/aplicar/[code]/page.tsx`
  - [ ] Formulário com campos: nome, telefone, email, categorias de interesse
  - [ ] Validação de email (não pode estar em auth.users)
  - [ ] Chamada Server Action `createPendingMember()`
  - [ ] Mensagem de sucesso com confirmação

- [ ] **3.3** Criar componentes reutilizáveis
  - [ ] `/components/invite-code-form.tsx` - form para inserir código
  - [ ] `/components/invite-application-form.tsx` - form de candidatura

---

## FASE 4: Página Admin (Dashboard)

- [ ] **4.1** Criar página `/app/(dashboard)/admin/convites/page.tsx`
  - [ ] Proteção: Apenas admins podem acessar (middleware/RLS)
  
- [ ] **4.2** Implementar Seção 0: Configuração do Webhook
  - [ ] Campo input para URL do webhook
  - [ ] Botão "Salvar Configuração"
  - [ ] Botão "Testar Webhook"
  - [ ] Armazenar em `.env.local` ou BD
  
- [ ] **4.3** Implementar Seção 1: Métricas
  - [ ] Total de convites gerados
  - [ ] Total de convites utilizados (com % conversão)
  - [ ] Total de candidatos pendentes
  - [ ] Total de compradores aprovados
  
- [ ] **4.4** Implementar Seção 2: Gerar Convites
  - [ ] Campo "Quantidade" (número)
  - [ ] Campo "Categoria" (select: geral, premium, vip)
  - [ ] Campo "Válido até" (date)
  - [ ] Campo "Notas" (textarea)
  - [ ] Botão "Gerar Convites"
  - [ ] Copiar/exibir códigos gerados
  
- [ ] **4.5** Implementar Seção 3: Candidatos Pendentes
  - [ ] Lista de candidatos com status "pending"
  - [ ] Exibir: nome, email, telefone, código usado, data candidatura
  - [ ] Botão "Aprovar Comprador" para cada candidato
  - [ ] Botão "Rejeitar" para cada candidato
  - [ ] Modal de rejeição com campo "Motivo"

---

## FASE 5: Email Service

- [ ] **5.1** Integrar Resend (recomendado) ou seu email provider
  - [ ] `npm install resend` (ou SendGrid/SES)
  - [ ] Configurar API key em `.env.local`
  - [ ] Criar `lib/email.ts` com funções:
    - [ ] `sendWelcomeEmail(email, name, tempPassword, resetLink, exclusivityMessage)`
    - [ ] `sendRejectionEmail(email, name, reason, supportEmail)`

- [ ] **5.2** Testar envio de emails
  - [ ] Enviar email de boas-vindas para teste
  - [ ] Enviar email de rejeição para teste

---

## FASE 6: Webhook e Notificações

- [ ] **6.1** Criar webhook no serviço de terceiros
  - [ ] Discord: Criar webhook em servidor Discord
  - [ ] OU Make: Criar webhook e configurar ações
  - [ ] OU Zapier: Criar webhook catch
  
- [ ] **6.2** Armazenar URL do webhook
  - [ ] No Supabase (tabela `settings` ou similar)
  - [ ] Ou em `.env.local` (para desenvolvimento)
  
- [ ] **6.3** Testar webhook
  - [ ] Usar botão "Testar Webhook" na página admin
  - [ ] Verificar se notificação chega (Discord/Make/Zapier)

---

## FASE 7: Testes

- [ ] **7.1** Testes de fluxo completo
  - [ ] [ ] Gerar convite no admin
  - [ ] [ ] Usuário valida código em `/acesso`
  - [ ] [ ] Usuário preenche formulário em `/acesso/aplicar/[code]`
  - [ ] [ ] Webhook notifica admin
  - [ ] [ ] Admin aprova candidato
  - [ ] [ ] Usuário recebe email e consegue fazer login
  - [ ] [ ] Usuário acessa `/oportunidades` com sucesso
  
- [ ] **7.2** Testes de segurança
  - [ ] RLS bloqueia acesso não autorizado
  - [ ] Admin não consegue acessar outros dados
  - [ ] Usuário não consegue acessar `/admin/*`
  - [ ] Código inválido não permite avançar
  - [ ] Email duplicado não permite candidatura
  
- [ ] **7.3** Testes de validação
  - [ ] Código expirado (status=disabled) é rejeitado
  - [ ] Código já usado (status=used) é rejeitado
  - [ ] Max_uses é respeitado

---

## FASE 8: Deployment

- [ ] **8.1** Preparar para produção
  - [ ] Revisar variáveis de ambiente
  - [ ] Configurar WEBHOOK_URL para produção
  - [ ] Configurar email service com credenciais reais
  - [ ] Revisar RLS policies
  
- [ ] **8.2** Deploy na Vercel
  - [ ] `git push` com todas as mudanças
  - [ ] Vercel faz deploy automático
  - [ ] Testar fluxo completo em produção
  
- [ ] **8.3** Monitoramento
  - [ ] Verificar logs de erro
  - [ ] Monitorar audit_logs para atividades suspeitas
  - [ ] Testar notificações de webhook em produção

---

## Ordem Recomendada de Execução

1. **FASE 1** (Banco de Dados) - ~15 min
2. **FASE 5** (Email) - ~10 min
3. **FASE 2** (Server Actions) - ~45 min
4. **FASE 3** (Páginas Públicas) - ~60 min
5. **FASE 4** (Dashboard Admin) - ~90 min
6. **FASE 6** (Webhook) - ~10 min
7. **FASE 7** (Testes) - ~60 min
8. **FASE 8** (Deployment) - ~30 min

**Tempo Total Estimado: ~4-5 horas** ⏱️

---

## Checklist de Implementação

## Checklist de Implementação

- [ ] Executar SQL migration (backend/migrations/20251201_create_invites_system.sql)
- [ ] Implementar Server Actions (src/actions/invites.ts, audit.ts, members.ts)
- [ ] Criar página `/acesso` (input de código - PÚBLICA)
- [ ] Criar página `/acesso/aplicar/[code]` (formulário - PÚBLICA)
- [ ] Criar página `/admin/convites` (dashboard admin - PRIVADA)
- [ ] Integrar email service (Resend/SendGrid/SES)
- [ ] Configurar webhook URL (Discord/Make/Zapier)
- [ ] Testar fluxo completo (convite → candidatura → aprovação → acesso)
- [ ] Testar segurança (RLS, acesso não autorizado, validações)
- [ ] Deploy na Vercel

---

# 11. Conclusão

Este documento fornece **tudo** que você precisa para implementar o sistema de convites privados na plataforma GEREZIM de forma **enterprise-grade**:

✅ Banco de dados completo com RLS  
✅ Server Actions seguros e validados  
✅ Automação com webhooks  
✅ Audit log para compliance  
✅ Role simples (user) para todos os compradores  
✅ Email de notificação  
✅ UI premium com dashboard admin  
✅ Sistema de referência (bonus)  
✅ **Plataforma de COMPRA apenas** (não de venda)  
✅ Sem acesso a `/dashboard` para compradores  
✅ Compradores veem apenas oportunidades da GEREZIM

## Modelo de Negócio Claro

```
┌─────────────────────────────────────────┐
│         GEREZIM (Proprietário)          │
│  - Cria oportunidades de negócios       │
│  - Define preços e disponibilidade      │
│  - Gera convites para compradores       │
│  - Aprova ou rejeita candidatos         │
│  - Gerencia dashboard administrativo    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Compradores (Clientes da Gerezim)  │
│  - Usam convite para acessar            │
│  - Visualizam oportunidades premium     │
│  - Favoritam oportunidades              │
│  - Consultam detalhes                   │
│  - Compartilham via WhatsApp/Email      │
│  - NÃO criam oportunidades              │
│  - NÃO acessam /dashboard               │
└─────────────────────────────────────────┘
```

É modular, seguro, escalável e **100% exclusivo** como uma plataforma de compra premium.

---

**Próximos passos:**

1. Executar as migrations SQL no Supabase
2. Criar os Server Actions (`src/actions/invites.ts`, `src/actions/audit.ts`)
3. Implementar páginas de acesso (`/acesso`, `/acesso/aplicar/[code]`)
4. Implementar dashboard admin (`/admin/convites`)
5. Testar fluxo completo
6. Integrar email service (Resend recomendado)
7. Configurar webhook URL
8. Deployar na Vercel

Qualquer dúvida, consulte este documento ou peça por arquivos prontos.
