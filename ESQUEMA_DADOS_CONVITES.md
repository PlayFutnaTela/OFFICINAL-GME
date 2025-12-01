# 📊 ESQUEMA DE DADOS - Sistema de Convites

---

## Tabela: `invites`
**Descrição:** Códigos de convite gerados pelo admin

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | ✅ | Chave primária (auto-gerado) |
| `code` | TEXT | ✅ | Código único (ex: GZM-A9KQ12) |
| `created_by` | UUID | ❌ | ID do admin que criou |
| `created_at` | TIMESTAMP | ✅ | Data/hora de criação (auto) |
| `used_by` | UUID | ❌ | ID do usuário que usou o código |
| `used_at` | TIMESTAMP | ❌ | Data/hora de uso |
| `status` | TEXT | ✅ | unused / used / disabled |
| `notes` | TEXT | ❌ | Notas do admin |
| `max_uses` | INTEGER | ✅ | Quantas vezes pode usar (padrão: 1) |
| `times_used` | INTEGER | ✅ | Contador de usos (padrão: 0) |
| `category` | TEXT | ❌ | Categoria (premium, standard, vip) |
| `metadata` | JSONB | ❌ | Dados flexíveis (tags, campaign, etc) |
| `referral_user_id` | UUID | ❌ | ID de quem gerou via referência |

**Índices:**
- `idx_invites_code` (rápido validar código)
- `idx_invites_status` (listar por status)
- `idx_invites_created_by` (listar convites de um admin)
- `idx_invites_used_by` (listar convites usados por um usuário)

**RLS Policy:**
- Apenas `is_admin(auth.uid())` pode ver/editar

**Exemplo de Registro:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "GZM-A9KQ12",
  "created_by": "admin-uuid-123",
  "created_at": "2024-12-01T10:00:00Z",
  "used_by": "user-uuid-456",
  "used_at": "2024-12-01T14:30:00Z",
  "status": "used",
  "notes": "Convite para parceiro estratégico",
  "max_uses": 1,
  "times_used": 1,
  "category": "premium",
  "metadata": {
    "source": "email-campaign",
    "campaign_id": "camp-2024-12"
  },
  "referral_user_id": null
}
```

---

## Tabela: `pending_members`
**Descrição:** Candidatos aguardando aprovação

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | ✅ | Chave primária (auto-gerado) |
| `invite_code` | TEXT | ✅ | Código do convite usado |
| `name` | TEXT | ✅ | Nome completo do candidato |
| `phone` | TEXT | ❌ | Telefone/WhatsApp |
| `email` | TEXT | ✅ | Email (UNIQUE - não pode repetir) |
| `extra_info` | JSONB | ❌ | Dados adicionais (interests, etc) |
| `created_at` | TIMESTAMP | ✅ | Data candidatura (auto) |
| `status` | TEXT | ✅ | pending / approved / rejected |
| `reviewed_by` | UUID | ❌ | ID do admin que revisou |
| `reviewed_at` | TIMESTAMP | ❌ | Data da revisão |
| `rejection_reason` | TEXT | ❌ | Motivo da rejeição |

**Índices:**
- `idx_pending_members_email` (evitar duplicatas)
- `idx_pending_members_status` (listar pendentes)
- `idx_pending_members_invite_code` (associar código)
- `idx_pending_members_created_at` (ordenar por data)

**RLS Policies:**
- Qualquer um pode fazer INSERT (candidatar-se)
- Apenas admin pode fazer SELECT
- Apenas admin pode fazer UPDATE

**Exemplo de Registro:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440111",
  "invite_code": "GZM-A9KQ12",
  "name": "João Silva",
  "phone": "+55 11 99999-9999",
  "email": "joao@example.com",
  "extra_info": {
    "interests": ["carros", "imóveis"],
    "notes": "Interessado em oportunidades premium"
  },
  "created_at": "2024-12-01T14:00:00Z",
  "status": "pending",
  "reviewed_by": null,
  "reviewed_at": null,
  "rejection_reason": null
}
```

---

## Tabela: `audit_logs`
**Descrição:** Rastreamento de todas as ações do sistema

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | ✅ | Chave primária (auto-gerado) |
| `action` | TEXT | ✅ | invite_created, member_approved, etc |
| `performed_by` | UUID | ❌ | ID do admin/sistema que fez ação |
| `target_id` | UUID | ❌ | ID do recurso afetado (invite, user) |
| `target_type` | TEXT | ❌ | Tipo do recurso (invite, user, etc) |
| `changes` | JSONB | ❌ | before/after JSON |
| `ip_address` | TEXT | ❌ | IP de origem |
| `user_agent` | TEXT | ❌ | User agent do navegador |
| `status` | TEXT | ✅ | success / failed (padrão: success) |
| `error_message` | TEXT | ❌ | Mensagem de erro se falhou |
| `created_at` | TIMESTAMP | ✅ | Data/hora (auto) |

**Índices:**
- `idx_audit_logs_action`
- `idx_audit_logs_performed_by`
- `idx_audit_logs_created_at`
- `idx_audit_logs_target_id`
- `idx_audit_logs_target_type`

**RLS Policy:**
- Apenas admin pode SELECT
- Qualquer um pode INSERT (sistema cria)

**Exemplo de Registro:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440222",
  "action": "member_approved",
  "performed_by": "admin-uuid-123",
  "target_id": "user-uuid-456",
  "target_type": "user",
  "changes": {
    "before": {
      "status": "pending",
      "role": null
    },
    "after": {
      "status": "approved",
      "role": "user"
    }
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "status": "success",
  "error_message": null,
  "created_at": "2024-12-01T15:00:00Z"
}
```

---

## Tabela: `profiles` (ALTERADA)
**Descrição:** Perfil do usuário (já existe, adicionamos 3 campos)

### Colunas NOVAS adicionadas:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `joined_by_invite` | TEXT | Código do convite que usou (rastreamento) |
| `joined_via_referral_from` | UUID | ID do usuário que fez referência |
| `joined_date` | TIMESTAMP | Data que foi aprovado e acessou |

**Índice novo:**
- `idx_profiles_joined_date`

**Exemplo (apenas novos campos):**
```json
{
  "id": "user-uuid-456",
  "name": "João Silva",
  "email": "joao@example.com",
  "joined_by_invite": "GZM-A9KQ12",
  "joined_via_referral_from": null,
  "joined_date": "2024-12-01T15:00:00Z"
}
```

---

## Fluxo de Dados

### Usuário novo (T=0)

**BD Estado:**
```
invites:
  - GZM-A9KQ12 (status=unused, times_used=0)

pending_members:
  - (vazio)

auth.users:
  - (vazio)

profiles:
  - (vazio)
```

### Após candidato preencher formulário (T=10min)

**BD Estado:**
```
invites:
  - GZM-A9KQ12 (status=unused, times_used=1) ← incrementou!

pending_members:
  - João Silva (status=pending, email=joao@example.com, created_at=T)

audit_logs:
  - pending_member_created

auth.users:
  - (ainda vazio)

profiles:
  - (ainda vazio)
```

### Após admin aprovar (T=2h)

**BD Estado:**
```
invites:
  - GZM-A9KQ12 (status=used, times_used=1, used_by=user-uuid, used_at=T+2h)

pending_members:
  - João Silva (status=approved, reviewed_by=admin-uuid, reviewed_at=T+2h)

auth.users:
  - João Silva (email=joao@example.com, role=user, email_confirmed=true)

profiles:
  - João Silva (id=user-uuid, name=João Silva, phone=+55..., joined_by_invite=GZM-A9KQ12, joined_date=T+2h)

audit_logs:
  - member_approved (with before/after JSON)
```

---

## Queries Úteis

### Listar todos os convites gerados hoje

```sql
SELECT code, status, times_used, max_uses, created_at
FROM invites
WHERE created_at::date = TODAY()
ORDER BY created_at DESC;
```

### Listar candidatos pendentes

```sql
SELECT name, email, phone, created_at
FROM pending_members
WHERE status = 'pending'
ORDER BY created_at ASC;
```

### Taxa de conversão

```sql
SELECT 
  COUNT(CASE WHEN status = 'unused' THEN 1 END) as unused,
  COUNT(CASE WHEN status = 'used' THEN 1 END) as used,
  COUNT(CASE WHEN status = 'used' THEN 1 END)::float / COUNT(*) as conversion_rate
FROM invites;
```

### Audit log das últimas ações

```sql
SELECT action, performed_by, target_type, status, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;
```

### Listar compradores aprovados

```sql
SELECT p.name, p.email, p.joined_date, p.joined_by_invite
FROM profiles p
INNER JOIN auth.users u ON p.id = u.id
WHERE u.role = 'user' AND p.joined_by_invite IS NOT NULL
ORDER BY p.joined_date DESC;
```

---

## Resumo Visual

```
┌──────────────────┐
│     invites      │  Admin cria códigos
└────────┬─────────┘
         │
         │ (código compartilhado)
         ↓
    ┌─────────┐
    │ usuário │  Usuário cola código em /acesso
    └────┬────┘
         │ validateInvite()
         ↓
┌──────────────────────────┐
│  pending_members         │  Usuário preenche formulário
│  (status=pending)        │  createPendingMember()
└────────┬─────────────────┘
         │
         │ (webhook envia notificação)
         ↓
    ┌─────────┐
    │  admin  │  Admin aprova em /admin/convites
    └────┬────┘  approveMember()
         │
         ↓
    ┌──────────────────────┐
    │   auth.users         │  Cria usuário (role=user)
    │   profiles           │  Cria perfil com joined_by_invite
    │   pending_members    │  Status → approved
    │   invites            │  Status → used, times_used++
    │   audit_logs         │  Log da aprovação
    └──────────┬───────────┘
               │
               │ (email de boas-vindas)
               ↓
         ┌─────────────┐
         │  usuário    │  Login + reset senha
         │  logado ✅  │  Acesso a /oportunidades
         └─────────────┘
```

---

**Documentação completa de dados pronta!** 📊
