# ✅ Checklist de Configuração - Sistema de Matching

## 1. Variáveis de Ambiente

Adicionar ao arquivo `.env.local`:

```bash
# OpenAI API - Para análise sofisticada de matching
# Obter em: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Cron Job Security - Gerar string aleatória de 32 caracteres
# Use: openssl rand -hex 16
CRON_SECRET=seu-secret-aleatorio-32-chars-aqui

# Resend Email API - Para notificações por email
# Obter em: https://resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Webhooks (Opcional) - Para integrações externas
MATCH_NOTIFICATION_WEBHOOK_URL=https://seu-webhook.com/matches
INTERACTION_WEBHOOK_URL=https://seu-webhook.com/interactions

# Base URL - Para links em emails
NEXT_PUBLIC_BASE_URL=https://gerezim.com.br
```

### Como Gerar CRON_SECRET

**No terminal (macOS/Linux):**
```bash
openssl rand -hex 16
# Resultado: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**No PowerShell (Windows):**
```powershell
$bytes = [byte[]]::new(16)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [System.Convert]::ToHexString($bytes)
Write-Host $secret
```

## 2. Banco de Dados - Executar Migrations

As 5 tabelas já foram criadas em `backend/migrations/`. 
Verificar que estão no Supabase:

```sql
-- Validar tabelas existem
SELECT EXISTS(
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('user_preferences', 'user_interactions', 
                     'recommendation_matches', 'product_ai_scores', 'notifications')
) as all_tables_exist;
```

✅ **Expected result:** `true`

## 3. Configurar Cron Job no Vercel

1. Acessar: [Vercel Dashboard](https://vercel.com)
2. Ir para seu projeto GEREZIM
3. **Settings** → **Cron Jobs**
4. Clique **Create New Cron Job**

Preencher com:
- **Schedule:** `0 8 * * *` (8am UTC, todos os dias)
- **URL:** `/api/cron/matching`
- **Timezone:** UTC
- **Headers:**
  - `Authorization: Bearer <seu-CRON_SECRET>`

5. Clique **Create**

### ⚠️ Importante
- O `CRON_SECRET` debe ser o **mesmo** que você colocou em `.env.local`
- O horário `0 8 * * *` é 8am UTC = **5am horário de Brasília**
- Para ajustar, converter para Cron expression: https://crontab.guru

## 4. Testar Localmente

### 4.1 Testar Matching Engine

```bash
# Terminal - na raiz do projeto
npm run dev

# Em outro terminal - chamar cron manualmente (vai falhar, é esperado sem secret)
curl -X GET http://localhost:3000/api/cron/matching
# Resultado esperado: 401 Unauthorized

# Chamar com secret correto
curl -X GET http://localhost:3000/api/cron/matching \
  -H "Authorization: Bearer seu-cron-secret"
```

### 4.2 Testar Preferências

1. Ir para `/dashboard/preferencias`
2. Selecionar categorias, preço, etc
3. Clicar "Salvar Preferências"
4. Verificar em Supabase se foi salvo em `user_preferences`

### 4.3 Testar Notificação

```sql
-- No Supabase SQL Editor
-- Inserir um match de teste
INSERT INTO recommendation_matches (
  user_id, 
  product_id, 
  match_score, 
  match_reasons
) VALUES (
  'seu-user-id-aqui',
  'seu-product-id-aqui',
  85,
  ARRAY['Categoria: Embarcações', 'Preço: R$ 5.000.000']
);

-- Verificar que foi inserido
SELECT * FROM recommendation_matches 
WHERE user_id = 'seu-user-id-aqui';
```

## 5. Verificar Resend Configuração

1. Acessar: [Resend Dashboard](https://resend.com)
2. Ir para **API Keys**
3. Copiar a chave e colocar em `.env.local`
4. Verificar domínio: **deve ser** `gerezim.com.br`
5. Clicar **Add Domain** se necessário

### Testar Email Localmente

```typescript
// Em qualquer arquivo .tsx com 'use server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const result = await resend.emails.send({
  from: 'matches@gerezim.com.br',
  to: 'seu-email@test.com',
  subject: 'Test Email',
  html: '<h1>Teste</h1>'
})

console.log(result)
```

## 6. Verificar OpenAI Configuração

1. Acessar: [OpenAI Platform](https://platform.openai.com)
2. Ir para **API Keys**
3. Criar nova chave
4. Colocar em `.env.local`
5. Verificar créditos (precisa de saldo)

### Testar API Localmente

```typescript
import { calculateAIMatch } from '@/lib/ai-matching'

const user = {
  id: 'test',
  interests: ['Embarcações'],
  minPrice: 1000000,
  maxPrice: 10000000,
  preferredLocations: ['Rio de Janeiro'],
  urgency: 'high'
}

const product = {
  id: '123',
  name: 'Iate de Luxo',
  category: 'Embarcações',
  price: 5000000,
  location: 'Rio de Janeiro',
  description: 'Iate moderno com 40m',
  created_at: new Date().toISOString(),
  status: 'ativo'
}

const result = await calculateAIMatch(user, product)
console.log(result)
```

## 7. Testar Pipeline Completo

### Cenário de Teste End-to-End

```sql
-- 1. Criar usuário de teste (se não existir)
INSERT INTO auth.users (id, email)
VALUES ('test-user-123', 'test@gerezim.com.br')
ON CONFLICT DO NOTHING;

-- 2. Criar preferências para o usuário
INSERT INTO user_preferences (user_id, interests, min_price, max_price, preferred_locations, urgency_level, notifications_enabled)
VALUES (
  'test-user-123',
  ARRAY['Embarcações', 'Imóveis'],
  1000000,
  10000000,
  ARRAY['Rio de Janeiro', 'São Paulo'],
  'high',
  true
)
ON CONFLICT (user_id) DO UPDATE SET 
  interests = ARRAY['Embarcações', 'Imóveis'];

-- 3. Criar um produto de teste
INSERT INTO products (name, category, price, location, status)
VALUES ('Iate de Teste', 'Embarcações', 5000000, 'Rio de Janeiro', 'ativo');

-- 4. Executar cron manualmente
-- curl -X GET http://seu-dominio.com/api/cron/matching \
--   -H "Authorization: Bearer seu-cron-secret"

-- 5. Verificar resultado
SELECT * FROM recommendation_matches 
WHERE user_id = 'test-user-123'
ORDER BY created_at DESC;

-- 6. Verificar notificação
SELECT * FROM notifications 
WHERE user_id = 'test-user-123'
ORDER BY created_at DESC;

-- 7. Verificar email foi enviado
SELECT email_sent, email_opened FROM recommendation_matches 
WHERE user_id = 'test-user-123' LIMIT 1;
```

## 8. Deploy para Produção

### 8.1 Variáveis de Ambiente no Vercel

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Adicionar cada variável:
   - `OPENAI_API_KEY`
   - `CRON_SECRET`
   - `RESEND_API_KEY`
   - `MATCH_NOTIFICATION_WEBHOOK_URL` (opcional)
   - `INTERACTION_WEBHOOK_URL` (opcional)
   - `NEXT_PUBLIC_BASE_URL` (public)

### 8.2 Deploy

```bash
git add .
git commit -m "feat: implement intelligent matching system"
git push origin main

# Vercel deploy automático
# Monitore em: https://vercel.com/your-project/deployments
```

### 8.3 Pós-Deploy

1. **Verificar Cron Job** - Ir para Settings → Cron Jobs
2. **Testar API**
   ```bash
   curl -X GET https://gerezim.com.br/api/cron/matching \
     -H "Authorization: Bearer seu-cron-secret"
   ```
3. **Monitorar Logs** - Vercel → Deployment → Logs

## 9. Monitorar Produção

### Queries Úteis de Monitoramento

```sql
-- Última execução do cron
SELECT * FROM logs 
WHERE function_name = 'matching_cron'
ORDER BY created_at DESC LIMIT 1;

-- Matches enviados hoje
SELECT COUNT(*) as matches_today
FROM recommendation_matches
WHERE DATE(created_at) = CURRENT_DATE
AND email_sent = true;

-- Taxa de clique de matches
SELECT 
  ROUND(100.0 * SUM(CASE WHEN clicked THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate,
  COUNT(*) as total_matches,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicks
FROM recommendation_matches
WHERE DATE(created_at) = CURRENT_DATE;

-- Usuários com maior engajamento
SELECT user_id, COUNT(*) as interactions
FROM user_interactions
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY user_id
ORDER BY COUNT(*) DESC
LIMIT 10;
```

## 10. Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| **Matches não aparecem** | Verificar se user_preferences existe, if product created_at < 24h |
| **Cron 401 Unauthorized** | Validar CRON_SECRET no Vercel Settings vs Authorization header |
| **Email não chega** | Verificar RESEND_API_KEY, domínio validado, email em spam |
| **IA score 0** | Verificar OPENAI_API_KEY, créditos OpenAI, logs do servidor |
| **Matches duplicados** | UNIQUE constraint in recommendations_matches deve rejeitar |
| **Performance lenta** | Verificar índices de banco, limitar matches por execução |

## 11. Documentação

- 📖 **Sistema completo:** `INTELLIGENT_MATCHING_SYSTEM.md`
- 🔧 **Código:** Ver comments em cada arquivo `.ts`
- 📊 **Dashboard:** `/dashboard/preferencias` para usuários

## 12. Support & Escalation

Para problemas:

1. **Logs do Vercel** - Settings → Deployments → Logs
2. **Logs do Supabase** - Database → Logs
3. **Email de erro** - Configurar error tracking em Sentry
4. **OpenAI Status** - https://status.openai.com
5. **Resend Status** - https://resend.statuspage.io

---

## ✅ Checklist Final

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Cron job criado no Vercel
- [ ] Tabelas de banco de dados verificadas
- [ ] Email Resend funcionando
- [ ] OpenAI API testada
- [ ] Preferências salvas com sucesso
- [ ] Matches aparecem no dashboard
- [ ] Notificações chegam por email
- [ ] Cliques em recomendações são rastreados
- [ ] Cron executa diariamente sem erro
- [ ] Monitoramento configurado

**Quando tudo estiver ✅ você está pronto!**

---

*Última atualização: Novembro 2024*
