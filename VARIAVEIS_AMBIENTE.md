# 🔐 VARIÁVEIS DE AMBIENTE - CONFIGURAÇÃO COMPLETA

## 📋 Resumo das Variáveis

| Variável | Status | Tipo | Descrição |
|----------|--------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Configurado | Public | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Configurado | Public | Chave pública Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Configurado | Secret | Chave privada Supabase |
| `OPENAI_API_KEY` | ✅ Configurado | Secret | Chave OpenAI para IA |
| `CRON_SECRET` | ✅ Configurado | Secret | Token para Cron Job |
| `RESEND_API_KEY` | ✅ Configurado | Secret | Chave Resend para emails |
| `NEXT_PUBLIC_SITE_URL` | ✅ Configurado | Public | URL local de desenvolvimento |
| `NEXT_PUBLIC_BASE_URL` | ✅ Configurado | Public | URL de produção |
| `WEBHOOK_URL` | ✅ Configurado | Public | Webhook N8N para notificações |

---

## 🔍 Detalhamento das Variáveis

### 1️⃣ SUPABASE - Banco de Dados

```env
NEXT_PUBLIC_SUPABASE_URL=https://wmacjzobwnrfyrqyxhko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**O que faz:**
- ✅ Conecta a aplicação ao banco de dados PostgreSQL
- ✅ Autentica usuários
- ✅ Armazena: produtos, favoritos, solicitações, preferências, etc
- ✅ Executa queries em tempo real

**Onde é usado:**
```typescript
// Client-side (público)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Server-side (privado)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

---

### 2️⃣ OPENAI - IA para Matching Inteligente

```env
OPENAI_API_KEY=sk-proj-M2lNVoBsc_UdGqXQHkYdKFceCKRT...
```

**O que faz:**
- ✅ Analisa produtos com GPT-4
- ✅ Gera scores de compatibilidade entre usuário e produto
- ✅ Cria mensagens personalizadas de recomendação
- ✅ Cache de 7 dias para economizar custos

**Onde é usado:**
```typescript
// /src/lib/ai-matching.ts
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "Você é um especialista em análise de oportunidades..."
    },
    {
      role: "user",
      content: `Analise se este produto é bom para este usuário...`
    }
  ]
})
```

**Custo:**
- 🟢 Barato: ~$0.03 por análise (cache otimiza)
- 📊 Volume: ~30 análises/dia com 100 usuários
- 💰 Estimado: ~$3-5/mês

---

### 3️⃣ CRON_SECRET - Segurança do Job de Matching

```env
CRON_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**O que faz:**
- ✅ Token de autenticação para o cron job
- ✅ Previne execução não autorizada
- ✅ Validado a cada execução do `/api/cron/matching`

**Como é usado:**
```typescript
// /src/app/api/cron/matching/route.ts
const authHeader = request.headers.get('Authorization')
const token = authHeader?.replace('Bearer ', '')

if (token !== process.env.CRON_SECRET) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}
```

**Configuração em Vercel:**
1. Vá para: **Vercel Dashboard** → **Project Settings** → **Cron Jobs**
2. Adicione:
   - **Path:** `/api/cron/matching`
   - **Schedule:** `0 8 * * *` (8am UTC diariamente)
   - **Header:** `Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

### 4️⃣ RESEND_API_KEY - Sistema de Emails

```env
RESEND_API_KEY=re_fGgArrWu_6cJ382h8z5Yz2krnJDKazj4v
```

**O que faz:**
- ✅ Envia emails de recomendações
- ✅ Envia notificações de solicitações
- ✅ Envia confirmações de ações

**Onde é usado:**
```typescript
// /src/actions/send-match-notification.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'noreply@gmeprivateclub.com',
  to: userEmail,
  subject: '✨ Nova Oportunidade Encontrada!',
  html: emailTemplate
})
```

**Tipos de Email:**
1. **Match Notification** - Quando há recomendação
2. **Request Confirmation** - Quando solicitação é criada
3. **Status Update** - Quando status muda

**Custo:**
- 🟢 Barato: Primeiros 100/mês grátis, depois $1 por 1000
- 📊 Volume: ~5-10 emails/usuário/mês
- 💰 Estimado: Grátis → $2-5/mês

---

### 5️⃣ NEXT_PUBLIC_BASE_URL - URL de Produção

```env
NEXT_PUBLIC_BASE_URL=https://gmeprivateclub.vercel.app/
```

**O que faz:**
- ✅ URL base para links em emails
- ✅ URL para webhooks
- ✅ Usado em: `${NEXT_PUBLIC_BASE_URL}/produto/123`

**Onde é usado:**
```typescript
// Emails
const productLink = `${process.env.NEXT_PUBLIC_BASE_URL}/produto/${productId}`

// Webhooks
const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`
```

---

### 6️⃣ WEBHOOK_URL - N8N para Automações

```env
WEBHOOK_URL=https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/convitegerezim
```

**O que faz:**
- ✅ Recebe eventos de solicitações
- ✅ Dispara automações (avisos, notificações)
- ✅ Integra com sistemas externos

**Eventos enviados:**
```json
{
  "event_type": "solicitar_pedido",
  "request_id": "uuid",
  "user_id": "uuid",
  "user_name": "João Silva",
  "user_email": "joao@example.com",
  "request_data": {
    "title": "iPhone 15 Pro Max",
    "category": "Eletrônicos",
    "budget": "R$ 10.000"
  }
}
```

---

## 🔒 Segurança das Variáveis

### Variáveis Públicas (NEXT_PUBLIC_*)
```env
✅ Seguro expor em:
   - Frontend
   - Emails
   - URLs públicas
   - Logs

VARIÁVEIS:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_BASE_URL
```

### Variáveis Privadas (Server-only)
```env
🔒 NUNCA exposar:
   - Em commits Git
   - Em logs públicos
   - No frontend
   - Em repositórios públicos

VARIÁVEIS:
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- CRON_SECRET
- RESEND_API_KEY
```

**Arquivo `.env.local` está em `.gitignore`** ✅

---

## 📝 Arquivo `.env.local` Atual

```env
# SUPABASE - Banco de Dados
NEXT_PUBLIC_SUPABASE_URL=https://wmacjzobwnrfyrqyxhko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=https://gmeprivateclub.vercel.app/

# IA - OpenAI
OPENAI_API_KEY=sk-proj-M2lNVoBsc_UdGqXQHkYdKFce...

# CRON - Segurança
CRON_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# EMAIL - Resend
RESEND_API_KEY=re_fGgArrWu_6cJ382h8z5Yz2krnJDKazj4v

# WEBHOOK - N8N
WEBHOOK_URL=https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/convitegerezim
```

---

## ✅ Checklist de Configuração

### Local (Desenvolvimento)
- [x] Supabase URL
- [x] Supabase Anon Key
- [x] Supabase Service Role Key
- [x] OpenAI API Key
- [x] CRON Secret
- [x] Resend API Key
- [x] NEXT_PUBLIC_SITE_URL = http://localhost:3000
- [x] NEXT_PUBLIC_BASE_URL = https://gmeprivateclub.vercel.app/ (produção)
- [x] Webhook URL

### Vercel (Produção)
- [ ] Copiar `.env.local` para Vercel Settings → Environment Variables
- [ ] Configurar CRON_SECRET em Cron Jobs
- [ ] Testar endpoints
- [ ] Validar emails sendo enviados

---

## 🚀 Próximos Passos

### 1️⃣ Testar Localmente
```bash
npm run dev
# Acessar http://localhost:3000
# Testar dashboard, favoritos, solicitações
```

### 2️⃣ Testar IA (Optional)
```bash
# Verificar se GPT está funcionando
# Será testado automaticamente no cron job
```

### 3️⃣ Configurar Vercel
```
1. Vá para: vercel.com → seu projeto
2. Settings → Environment Variables
3. Copie todas as variáveis do .env.local
4. Deploy
```

### 4️⃣ Configurar Cron Job em Vercel
```
1. Settings → Cron Jobs
2. Path: /api/cron/matching
3. Schedule: 0 8 * * * (8am UTC)
4. Headers: Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 💡 Dicas

**Qual variável usar onde?**

```typescript
// Frontend
import.meta.env.NEXT_PUBLIC_SUPABASE_URL

// Server Actions
process.env.SUPABASE_SERVICE_ROLE_KEY
process.env.OPENAI_API_KEY

// API Routes
process.env.CRON_SECRET
process.env.RESEND_API_KEY
```

**Testar se estão carregadas:**
```bash
# Add a console.log em um arquivo .server.ts ou API route
console.log('OpenAI:', process.env.OPENAI_API_KEY ? '✅ Carregado' : '❌ Faltando')
```

---

**Status:** ✅ **TODAS AS VARIÁVEIS CONFIGURADAS**

Seu sistema está pronto para rodar! 🚀

