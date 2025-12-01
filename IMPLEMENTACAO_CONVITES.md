# Implementação do Sistema de Convites Privados

## 📋 Status: Documentação Completa ✅

Toda a estrutura do sistema de convites privados está documentada em `sistema_convites_gerezim.md`.

---

## 🚀 Próximos Passos (Ordem Recomendada)

### FASE 1: Banco de Dados (15 min)

```bash
# 1. Abra o Supabase SQL Editor
# Dashboard → SQL Editor → New Query

# 2. Cole o conteúdo completo de:
backend/migrations/20251201_create_invites_system.sql

# 3. Execute (Ctrl+Enter)

# 4. Verifique no Data Editor se as tabelas foram criadas:
# - invites
# - pending_members
# - audit_logs
# - profiles (verificar se as 3 novas colunas existem)
```

✅ **O que foi criado:**
- Tabela `invites` com 13 campos
- Tabela `pending_members` com 10 campos
- Tabela `audit_logs` com 10 campos
- Alteração em `profiles` com 3 novos campos
- Índices para performance
- RLS policies de segurança
- 2 funções auxiliares (increment_invite_usage, log_audit_action)

---

### FASE 2: Email Service (10 min)

**Escolha UMA opção:**

#### Opção A: Resend (RECOMENDADO)

```bash
# 1. Instalar
npm install resend

# 2. Criar conta em https://resend.com (gratuito)

# 3. Copiar API Key

# 4. Adicionar em .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 5. Criar lib/email.ts (veja exemplo abaixo)
```

#### Opção B: SendGrid

```bash
npm install @sendgrid/mail

# 1. Conta em https://sendgrid.com
# 2. Copiar API Key
# 3. SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

#### Opção C: AWS SES

```bash
npm install aws-sdk

# 1. Configurar AWS CLI
# 2. aws configure
# 3. Credenciais da AWS SES
```

**Arquivo `lib/email.ts` (exemplo com Resend):**

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({
  email,
  name,
  tempPassword,
  resetLink,
  exclusivityMessage = true,
}: {
  email: string;
  name: string;
  tempPassword: string;
  resetLink: string;
  exclusivityMessage?: boolean;
}) {
  try {
    await resend.emails.send({
      from: 'noreply@gerezim.com',
      to: email,
      subject: '🎉 Bem-vindo à GEREZIM!',
      html: `
        <h1>Bem-vindo à GEREZIM, ${name}!</h1>
        <p>Sua candidatura foi aprovada!</p>
        <p><strong>Suas credenciais:</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>Senha temporária: ${tempPassword}</li>
        </ul>
        <p><a href="${resetLink}">Clique aqui para redefinir sua senha</a></p>
        ${exclusivityMessage ? '<p>Você agora tem acesso exclusivo às oportunidades premium da GEREZIM!</p>' : ''}
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}

export async function sendRejectionEmail({
  email,
  name,
  reason,
  supportEmail,
}: {
  email: string;
  name: string;
  reason: string;
  supportEmail?: string;
}) {
  try {
    await resend.emails.send({
      from: 'noreply@gerezim.com',
      to: email,
      subject: 'Resultado da sua candidatura à GEREZIM',
      html: `
        <h1>Olá ${name},</h1>
        <p>Sua inscrição foi revisada. Infelizmente, não conseguimos prosseguir neste momento.</p>
        <p><strong>Motivo:</strong> ${reason}</p>
        ${supportEmail ? `<p>Dúvidas? Entre em contato: ${supportEmail}</p>` : ''}
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}
```

---

### FASE 3: Server Actions (45 min)

**Criar `src/actions/invites.ts`:**

```typescript
"use server";
import { createClient } from "@/lib/supabase/server";

export async function createInvites(data: {
  quantity: number;
  category?: string;
  notes?: string;
}) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  
  if (!user.data.user) throw new Error("Não autenticado");

  const codes = Array.from({ length: data.quantity }).map(() =>
    "GZM-" + Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  const rows = codes.map((code) => ({
    code,
    created_by: user.data.user!.id,
    notes: data.notes || null,
    category: data.category || 'standard',
  }));

  const { data: inserted, error } = await supabase
    .from("invites")
    .insert(rows)
    .select();

  if (error) throw error;
  return { codes, inserted };
}

export async function validateInvite(code: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("status", "unused");

  if (error || !data || data.length === 0) {
    return { valid: false, error: "Código inválido ou já utilizado" };
  }

  const invite = data[0];

  if (invite.max_uses && invite.times_used >= invite.max_uses) {
    return { valid: false, error: "Código já foi utilizado (máximo atingido)" };
  }

  return { valid: true, invite };
}

export async function createPendingMember(payload: {
  code: string;
  name: string;
  phone: string;
  email: string;
  extra_info?: Record<string, any>;
}) {
  const supabase = createClient();

  // Validar email não está em auth.users
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

  // Incrementar times_used
  await supabase.rpc('increment_invite_usage', { code_param: payload.code });

  // Enviar webhook
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
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
          },
        }),
      });
    }
  } catch (webhookError) {
    console.error("Webhook falhou:", webhookError);
  }

  return newMember;
}
```

**Criar `src/actions/members.ts`:**

```typescript
"use server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail, sendRejectionEmail } from "@/lib/email";

export async function approveMember(id: string) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  
  if (!user.data.user) throw new Error("Não autenticado");

  const { data: candidate } = await supabase
    .from("pending_members")
    .select("*")
    .eq("id", id)
    .single();

  if (!candidate) throw new Error("Candidato não encontrado");

  const tempPassword = Math.random().toString(36).slice(-12);

  // Criar user no Auth
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
    await supabase.auth.admin.deleteUser(newUser.user.id);
    throw new Error(`Erro ao criar profile: ${profileError.message}`);
  }

  // Atualizar pending_member
  await supabase
    .from("pending_members")
    .update({
      status: "approved",
      reviewed_by: user.data.user.id,
      reviewed_at: new Date(),
    })
    .eq("id", id);

  // Marcar invite como usado
  await supabase
    .from("invites")
    .update({
      status: "used",
      used_by: newUser.user.id,
      used_at: new Date(),
    })
    .eq("code", candidate.invite_code);

  // Enviar email
  try {
    await sendWelcomeEmail({
      email: candidate.email,
      name: candidate.name,
      tempPassword,
      resetLink: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      exclusivityMessage: true,
    });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
  }

  return { user: newUser.user, tempPassword };
}

export async function rejectMember(id: string, reason: string) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  
  if (!user.data.user) throw new Error("Não autenticado");

  const { data: candidate } = await supabase
    .from("pending_members")
    .select("email, name")
    .eq("id", id)
    .single();

  if (!candidate) throw new Error("Candidato não encontrado");

  await supabase
    .from("pending_members")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_by: user.data.user.id,
      reviewed_at: new Date(),
    })
    .eq("id", id);

  try {
    await sendRejectionEmail({
      email: candidate.email,
      name: candidate.name,
      reason,
      supportEmail: process.env.SUPPORT_EMAIL,
    });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
  }

  return { success: true };
}
```

---

### FASE 4: Páginas Públicas (60 min)

**Criar `src/app/acesso/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateInvite } from '@/actions/invites';

export default function AcessoPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await validateInvite(code);
      if (result.valid) {
        router.push(`/acesso/aplicar/${code.toUpperCase()}`);
      } else {
        setError(result.error || 'Código inválido');
      }
    } catch (err) {
      setError('Erro ao validar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">GEREZIM</h1>
          <p className="text-gray-400">Oportunidades Premium de Negócios</p>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          <h2 className="text-xl font-bold mb-4">Você tem um convite?</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="GZM-XXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              disabled={loading}
            />
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Validando...' : 'Continuar'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Você não tem convite? Contate nossos parceiros.
        </p>
      </div>
    </div>
  );
}
```

**Criar `src/app/acesso/aplicar/[code]/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPendingMember } from '@/actions/invites';

export default function AplicarPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createPendingMember({
        code: params.code,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        extra_info: { interests: formData.interests },
      });

      alert('✅ Candidatura enviada! Você receberá um email em breve.');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar candidatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Complete seu perfil</h1>
          <p className="text-gray-400 text-sm">Código: {params.code}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-lg p-8 space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            disabled={loading}
          />

          <input
            type="tel"
            placeholder="Telefone/WhatsApp"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            disabled={loading}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Candidatura'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

### FASE 5: Dashboard Admin (90 min)

Veja documentação completa em `sistema_convites_gerezim.md` seção 7.1.

A página deve ter:
- **Seção 0:** Configuração do webhook (URL input + botões Salvar/Testar)
- **Seção 1:** Métricas (4 cards)
- **Seção 2:** Gerar convites (formulário)
- **Seção 3:** Candidatos pendentes (lista com ações)

---

### FASE 6: Webhook (10 min)

#### Discord (Mais fácil)

1. Abra seu servidor Discord
2. Clique em ⚙️ **Configurações do servidor**
3. Vá em **Integrações** → **Webhooks**
4. Clique em **Novo Webhook**
5. Copie a URL
6. Cole em `.env.local`:

```bash
WEBHOOK_URL=https://discord.com/api/webhooks/123456/xyzabc
```

#### Make (Recomendado)

1. Acesse https://make.com
2. Crie novo "Scenario"
3. Procure por **Webhook**
4. Copie a URL
5. Cole em `.env.local`:

```bash
WEBHOOK_URL=https://hook.make.com/asdf123asdf123asdf123
```

---

### FASE 7: Testes (60 min)

```bash
# 1. Iniciar servidor local
npm run dev

# 2. Testar fluxo completo
- Abrir http://localhost:3000/acesso
- Entrar em admin, gerar convite
- Voltar para /acesso, colar código
- Preencher formulário
- Verificar se webhook chegou
- Admin aprova candidato
- Candidato recebe email
- Candidato consegue fazer login
- Candidato acessa /oportunidades

# 3. Testar validações
- Código inválido → erro
- Email duplicado → erro
- Código desabilitado → erro
```

---

### FASE 8: Deployment (30 min)

```bash
# 1. Commit e push
git add -A
git commit -m "feat: implement invite system"
git push

# 2. Vercel faz deploy automático

# 3. Configurar variáveis de ambiente em Vercel
# Dashboard → Project Settings → Environment Variables
RESEND_API_KEY=re_xxxxxxxxxxxxx
WEBHOOK_URL=https://discord.com/api/webhooks/...
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
SUPPORT_EMAIL=support@gerezim.com

# 4. Testar em produção
```

---

## ⏱️ Tempo Total: ~4-5 horas

| Fase | Tempo | Status |
|------|-------|--------|
| 1. BD | 15 min | ✅ SQL pronto |
| 2. Email | 10 min | ⏳ Próximo |
| 3. Server Actions | 45 min | ⏳ Próximo |
| 4. Páginas Públicas | 60 min | ⏳ Próximo |
| 5. Dashboard Admin | 90 min | ⏳ Próximo |
| 6. Webhook | 10 min | ⏳ Próximo |
| 7. Testes | 60 min | ⏳ Próximo |
| 8. Deploy | 30 min | ⏳ Próximo |

---

## 📞 Suporte

Se tiver dúvidas, consulte:
- `sistema_convites_gerezim.md` - Documentação completa
- `backend/migrations/20251201_create_invites_system.sql` - Schema SQL

Sucesso! 🚀
