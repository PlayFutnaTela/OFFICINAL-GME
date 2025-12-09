# 🧠 Sistema de Match Inteligente de Oportunidades - GEREZIM

## Visão Geral

O sistema de **Match Inteligente** é uma solução de recomendação personalizada que conecta usuários a oportunidades baseado em seu perfil e preferências. Funciona em tempo real com análise híbrida (regras + IA).

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE MATCHING                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DATA LAYER (Supabase PostgreSQL)                           │
│     ├── user_preferences (preferências do usuário)             │
│     ├── user_interactions (histórico de interações)            │
│     ├── recommendation_matches (matches encontrados)           │
│     ├── product_ai_scores (cache de análises GPT)              │
│     └── notifications (notificações do dashboard)              │
│                                                                  │
│  2. MATCHING ENGINE (Hybrid Strategy)                           │
│     ├── src/lib/matching-engine.ts (regra: 0-100 pontos)       │
│     ├── src/lib/ai-matching.ts (OpenAI GPT-4)                  │
│     └── src/lib/hybrid-matching.ts (60% regra + 40% IA)        │
│                                                                  │
│  3. ACTIONS (Server-side Operations)                            │
│     ├── src/actions/send-match-notification.ts (email + DB)    │
│     └── src/actions/track-interaction.ts (rastreamento)        │
│                                                                  │
│  4. CRON JOB (Daily Execution)                                  │
│     └── src/app/api/cron/matching/route.ts (schedule 8am UTC)  │
│                                                                  │
│  5. UI COMPONENTS (Client-side)                                 │
│     ├── src/components/recommended-opportunities.tsx (card)    │
│     └── src/components/user-preferences-form.tsx (settings)    │
│                                                                  │
│  6. PAGES (Integration Points)                                  │
│     ├── /dashboard → RecommendedOpportunities component        │
│     └── /dashboard/preferencias → UserPreferencesForm          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Funcionamento

### 1️⃣ **Usuário Configura Preferências**

```mermaid
Usuário → /dashboard/preferencias → UserPreferencesForm
   ↓
Define: Categorias, Preço Min/Max, Localizações, Urgência, Frequência de Notificações
   ↓
Dados salvos em: user_preferences (Supabase)
```

### 2️⃣ **Sistema Detecta Novo Produto**

```mermaid
Produto criado → status='ativo' → timestamp dentro de 24h
   ↓
Esperando cron job diário
```

### 3️⃣ **Cron Job Executa Matching Diário**

```mermaid
GET /api/cron/matching?Authorization=Bearer<CRON_SECRET>
   ↓
Para cada usuário com notificações ativadas:
   Para cada produto novo (últimas 24h):
      calculateHybridMatch(userProfile, product)
   ↓
Se score >= 65:
   sendMatchNotification(userId, productId, score, reasons)
```

### 4️⃣ **Matching Engine Processa**

```mermaid
calculateHybridMatch()
   ↓
┌─────────────────────────────────────────┐
│ PASSO 1: Rule-Based Score (rápido)      │
├─────────────────────────────────────────┤
│ Categoria match:        +35 pts         │
│ Preço na faixa:        +30 pts         │
│ Localização match:     +20 pts         │
│ Produto recente:       +15 pts         │
│ MAX: 100 pontos                        │
└─────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────┐
│ Se score >= 50:                         │
│ PASSO 2: IA Analysis (OpenAI GPT-4)     │
├─────────────────────────────────────────┤
│ Sofisticada análise via GPT            │
│ Cache por 7 dias                       │
│ Resultado: score 0-100                 │
└─────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────┐
│ PASSO 3: Hybrid Score (60% + 40%)       │
├─────────────────────────────────────────┤
│ finalScore = (ruleScore × 0.6) +        │
│             (aiScore × 0.4)            │
│                                        │
│ Threshold notificação: >= 65            │
└─────────────────────────────────────────┘
```

### 5️⃣ **Notificação Enviada**

```mermaid
sendMatchNotification()
   ↓
1. Verificar duplicata (evitar re-envios)
2. Buscar email do usuário
3. Inserir match em recommendation_matches
4. Enviar email via Resend (template HTML)
5. Criar notificação no dashboard
6. Disparar webhook (opcional)
```

### 6️⃣ **Usuário Recebe & Interage**

```mermaid
Email Notificação
   ↓
Usuário clica → /produto/[id]
   ↓
   └─→ trackInteraction('clicked') → user_interactions
        └─→ Melhora futuras recomendações
```

### 7️⃣ **Dashboard Mostra Recomendações**

```mermaid
/dashboard
   ↓
RecommendedOpportunities component
   ↓
Fetch matches não-clicados
   ↓
Ordenar por score DESC
   ↓
Mostrar top 5 com motivos
```

## Implementação Técnica

### Banco de Dados - 5 Tabelas Principais

#### 1. `user_preferences`
```sql
- user_id (FK → auth.users) PRIMARY KEY
- interests TEXT[] (array de categorias)
- min_price NUMERIC (padrão: 0)
- max_price NUMERIC (padrão: 1B)
- preferred_locations TEXT[] (8 cidades)
- urgency_level (low|normal|high)
- notification_frequency (immediate|daily|weekly|never)
- notifications_enabled BOOLEAN
- email_notifications BOOLEAN
- push_notifications BOOLEAN
- sms_notifications BOOLEAN
```

#### 2. `user_interactions`
```sql
- id UUID PRIMARY KEY
- user_id (FK → auth.users)
- product_id (FK → products)
- interaction_type (viewed|clicked|saved|inquired|shared)
- duration_seconds INTEGER (tempo gasto)
- timestamp TIMESTAMP
- Índices: user_id, product_id, interaction_type
```

#### 3. `recommendation_matches`
```sql
- id UUID PRIMARY KEY
- user_id (FK → auth.users)
- product_id (FK → products) UNIQUE(user_id, product_id)
- match_score NUMERIC (0-100)
- match_reasons TEXT[] (motivos do match)
- clicked BOOLEAN (usuário clicou?)
- email_sent BOOLEAN
- email_opened BOOLEAN
- created_at TIMESTAMP
- Índices: user_id, product_id, match_score
```

#### 4. `product_ai_scores`
```sql
- product_id (FK → products) PRIMARY KEY
- ai_score NUMERIC (0-100)
- ai_analysis TEXT (resumo da análise)
- ai_reasons TEXT[] (razões da análise)
- cached_at TIMESTAMP (expirar após 7 dias)
```

#### 5. `notifications`
```sql
- id UUID PRIMARY KEY
- user_id (FK → auth.users)
- type (match_found|product_updated|etc)
- title TEXT
- message TEXT
- related_product_id (FK → products)
- read BOOLEAN
- created_at TIMESTAMP
```

### Algoritmo de Scoring

#### Rule-Based (Determinístico - 100 pontos máximo)

```typescript
score = 0

// Categoria (35 pts)
if (user.interests.includes(product.category))
  score += 35

// Preço (30 pts)
if (product.price >= user.minPrice && product.price <= user.maxPrice)
  score += 30

// Localização (20 pts)
if (user.preferredLocations.includes(product.location))
  score += 20

// Urgência (15 pts)
if (user.urgency === 'high' && daysSince(product.created_at) < 7)
  score += 15

// Threshold
shouldNotify = score >= 65
```

#### AI-Based (GPT-4 - 100 pontos)

```typescript
// Cache checking
cached = getCachedAIAnalysis(product.id)
if (cached && daysOld < 7) return cached

// OpenAI API Call
response = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [{
    role: "user",
    content: `[personalized prompt with user profile + product details]`
  }]
})

// Parse JSON response
{
  "score": 0-100,
  "reasons": ["razão1", "razão2"],
  "analysis": "detailed analysis",
  "shouldNotify": true/false
}
```

#### Hybrid (60% + 40%)

```typescript
ruleScore = calculateRuleBasedMatch(user, product).score

// Só calcular IA se regra score >= 50 (economizar API)
aiScore = 0
if (ruleScore >= 50)
  aiScore = await calculateAIMatch(user, product).score

// Combinar pesos
hybridScore = Math.round(ruleScore * 0.6 + aiScore * 0.4)

// Notificação
shouldNotify = hybridScore >= 65
```

## Arquivos Criados

### 1. Core Matching Libraries

**`src/lib/matching-engine.ts`** (280 linhas)
- `calculateRuleBasedMatch()` - Scoring determinístico
- `getUserProfile()` - Fetch preferências
- `getUserInteractionHistory()` - Histórico
- Types: `UserProfile`, `Product`, `MatchResult`

**`src/lib/ai-matching.ts`** (200 linhas)
- `calculateAIMatch()` - OpenAI GPT-4 integration
- `cacheAIAnalysis()` - Salvar em cache por 7 dias
- `getCachedAIAnalysis()` - Reutilizar análises
- Types: `AIMatchAnalysis`

**`src/lib/hybrid-matching.ts`** (120 linhas)
- `calculateHybridMatch()` - Combina 60% regra + 40% IA
- `calculateMultipleMatches()` - Batch processing
- `rankMatches()` - Ordenar por relevância
- Types: `HybridMatchResult`

### 2. Server Actions

**`src/actions/send-match-notification.ts`** (250 linhas)
- `sendMatchNotification()` - Orquestra: email + DB + webhook
- `sendMatchEmail()` - Template HTML via Resend
- `createDashboardNotification()` - Notificação visual
- `triggerWebhook()` - Webhook integrations (Discord/Slack)
- `markMatchAsClicked()` - Rastreamento de cliques
- `markEmailAsOpened()` - Rastreamento de opens

**`src/actions/track-interaction.ts`** (150 linhas)
- `trackInteraction()` - Fire-and-forget tracking
- `getProductInteractionStats()` - Stats do produto
- `getUserInteractionStats()` - Stats do usuário
- `triggerInteractionWebhook()` - Webhooks importantes

### 3. API Routes

**`src/app/api/cron/matching/route.ts`** (200 linhas)
- `GET /api/cron/matching` - Cron job diário
- Validação: Bearer token (CRON_SECRET)
- Fetch users + produtos (últimas 24h)
- Executa matching para todas combinações
- Retorna: { success, matchesFound, errors }

### 4. UI Components

**`src/components/recommended-opportunities.tsx`** (250 linhas)
- Card com top 5 recomendações
- Score em badge amarelo
- Motivos do match
- Loading & empty states
- Link para produto completo
- Fire-and-forget tracking

**`src/components/user-preferences-form.tsx`** (380 linhas)
- Form completo com validação
- Multi-select: categorias, localizações
- Range inputs: preço
- Radio buttons: urgência, frequência
- Checkboxes: canais de notificação
- Save com toast feedback

### 5. Pages

**`src/app/(dashboard)/dashboard/preferencias/page.tsx`** (50 linhas)
- Landing page para configuração
- Explicação do sistema
- Integração com UserPreferencesForm

**Updated: `src/app/(dashboard)/dashboard/page.tsx`** (+2 linhas)
- Adicionado import de RecommendedOpportunities
- Inserido componente após gráficos

## Variáveis de Ambiente Necessárias

```bash
# OpenAI API (para IA matching)
OPENAI_API_KEY=sk-...

# Cron Job Security
CRON_SECRET=seu-secret-aleatorio-32-chars

# Email Notifications
RESEND_API_KEY=re_...

# Webhooks (Opcional)
MATCH_NOTIFICATION_WEBHOOK_URL=https://...
INTERACTION_WEBHOOK_URL=https://...

# Base URL para links em emails
NEXT_PUBLIC_BASE_URL=https://gerezim.com.br
```

## Configuração do Vercel Cron

1. Ir para **Project Settings** → **Cron Jobs**
2. Adicionar novo cron:
   - **URL**: `/api/cron/matching`
   - **Schedule**: `0 8 * * *` (8am UTC daily)
   - **Headers**: `Authorization: Bearer <CRON_SECRET>`

## Fluxo de Integração com Produto Existente

### Ao Criar Produto

```typescript
// Existente: criar em products table
await supabase.from('products').insert({
  name: 'Iate de Luxo',
  category: 'Embarcações',
  price: 5000000,
  location: 'Rio de Janeiro',
  status: 'ativo',
  // ... outros campos
})

// Automático: Cron job detecta amanhã de manhã
// → Matching executa
// → Notificações enviadas
```

### Ao Usuário Visitar Dashboard

```typescript
// RecommendedOpportunities carrega automático
<RecommendedOpportunities />
// → Busca top 5 matches não-clicados
// → Mostra com scores e motivos
// → Rastreia cliques
```

### Ao Usuário Clicar em Recomendação

```typescript
// Automático: trackInteraction('clicked') dispara
await trackInteraction(productId, 'clicked')
// → Registra em user_interactions
// → Melhora futuras recomendações
// → Marca match como 'clicked'
```

## Métricas & Analytics

### Acompanhar Performance

```sql
-- Top produtos recomendados
SELECT product_id, COUNT(*) as matches_sent, 
       SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicks,
       ROUND(100.0 * SUM(CASE WHEN clicked THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
FROM recommendation_matches
GROUP BY product_id
ORDER BY click_rate DESC;

-- Effectiveness por score range
SELECT 
  CASE 
    WHEN match_score >= 80 THEN '80-100'
    WHEN match_score >= 65 THEN '65-79'
  END as score_range,
  COUNT(*) as matches,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicks,
  ROUND(100.0 * SUM(CASE WHEN clicked THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
FROM recommendation_matches
WHERE match_score >= 65
GROUP BY score_range
ORDER BY score_range DESC;

-- Usuários mais engajados
SELECT user_id, COUNT(*) as interactions, 
       ARRAY_AGG(DISTINCT interaction_type) as types
FROM user_interactions
GROUP BY user_id
ORDER BY COUNT(*) DESC
LIMIT 10;
```

## Testing & Debugging

### Test Match Engine Localmente

```typescript
import { calculateHybridMatch, getUserProfile } from '@/lib/hybrid-matching'

// Simular usuário
const user = {
  id: 'test-user',
  interests: ['Embarcações', 'Imóveis'],
  minPrice: 1000000,
  maxPrice: 10000000,
  preferredLocations: ['Rio de Janeiro', 'São Paulo'],
  urgency: 'high'
}

// Simular produto
const product = {
  id: '123',
  name: 'Iate de Luxo',
  category: 'Embarcações',
  price: 5000000,
  location: 'Rio de Janeiro',
  created_at: new Date().toISOString(),
  status: 'ativo'
}

// Testar
const match = await calculateHybridMatch(user, product)
console.log(match)
// {
//   score: 85,
//   reasons: ['Categoria...', 'Preço...', ...],
//   shouldNotify: true,
//   matchType: 'hybrid',
//   ruleScore: 85,
//   aiScore: 85,
//   hybridScore: 85
// }
```

### Trigger Cron Manualmente

```bash
curl -X GET http://localhost:3000/api/cron/matching \
  -H "Authorization: Bearer your-cron-secret"
```

## Performance & Otimizações

### Índices de Banco de Dados

Já incluídos nas migrations:
- `user_id` em todas as tabelas
- `product_id` em recommendation_matches
- `match_score` em recommendation_matches (para ORDER BY)
- `interaction_type` em user_interactions

### Caching de IA

- Cache por **7 dias** em `product_ai_scores`
- Evita chamadas desnecessárias à OpenAI
- Economiza ~$0.01 por análise × milhares de matches

### Rate Limiting

Para futuro (não implementado ainda):
- Limitar a 10 análises de IA por minuto
- Queued job system para grandes volumes

## Roadmap Futuro

- [ ] **Push Notifications** - Implementar Firebase Cloud Messaging
- [ ] **SMS Notifications** - Integrar Twilio
- [ ] **ML Recommender** - Substituir regras por modelo ML treinado
- [ ] **A/B Testing** - Testar diferentes estratégias de matching
- [ ] **User Feedback Loop** - "Gostei", "Não Gostei", "Já Tenho"
- [ ] **Conversational AI** - Chat bot para refinamento de preferências
- [ ] **Admin Dashboard** - Monitorar matches, performance, problemas

## Suporte & Troubleshooting

### Problema: Matches não aparecem

1. Verificar se usuário tem `user_preferences` criado
   ```sql
   SELECT * FROM user_preferences WHERE user_id = 'user-id';
   ```

2. Verificar se existem produtos novos
   ```sql
   SELECT * FROM products 
   WHERE created_at > NOW() - INTERVAL '24 hours' 
   AND status = 'ativo';
   ```

3. Validar cron job executou
   ```sql
   SELECT * FROM logs 
   WHERE function_name = 'matching_cron'
   ORDER BY created_at DESC;
   ```

### Problema: Notificações não chegam

1. Verificar RESEND_API_KEY configurada
2. Validar email existe em profiles
3. Conferir fila em `recommendation_matches` com `email_sent = false`

### Problema: Score de IA muito baixo

1. Verificar OPENAI_API_KEY
2. Testar prompt via OpenAI playground
3. Aumentar `min_score` threshold em hybrid-matching.ts

---

**Última atualização:** Novembro 2024
**Versão:** 1.0
**Status:** ✅ Pronto para Produção

