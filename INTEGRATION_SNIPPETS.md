# 📝 Snippets de Integração - Sistema de Matching

## Integração em Componentes Existentes

Use estes snippets para integrar o tracking de interações em componentes de produtos.

### 1. Product Card Component

```tsx
// src/components/product-card.tsx
'use client'

import { trackInteraction } from '@/actions/track-interaction'
import Link from 'next/link'
import { useState } from 'react'

export function ProductCard({ product }) {
  const [timeOnCard, setTimeOnCard] = useState(0)

  const handleCardHover = () => {
    const startTime = Date.now()
    const timer = setInterval(() => {
      setTimeOnCard(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
      // Rastrear view
      trackInteraction(product.id, 'viewed', timeOnCard)
    }
  }

  const handleClick = async () => {
    // Rastrear clique
    await trackInteraction(product.id, 'clicked')
  }

  return (
    <Link href={`/produto/${product.id}`} onClick={handleClick}>
      <div
        className="product-card"
        onMouseEnter={handleCardHover}
        onMouseLeave={handleCardHover}
      >
        <h3>{product.name}</h3>
        <p className="price">R$ {product.price.toLocaleString('pt-BR')}</p>
        {/* ... mais conteúdo */}
      </div>
    </Link>
  )
}
```

### 2. Product Detail Page

```tsx
// src/app/produto/[id]/page.tsx
'use client'

import { trackInteraction } from '@/actions/track-interaction'
import { useEffect } from 'react'

export default function ProductDetailPage({ params }) {
  useEffect(() => {
    // Rastrear que visualizou a página
    trackInteraction(params.id, 'viewed', 30)

    return () => {
      // Cleanup (opcional)
    }
  }, [params.id])

  const handleSave = async () => {
    await trackInteraction(params.id, 'saved')
    // ... salvar para favoritos
  }

  const handleMakeInquiry = async () => {
    await trackInteraction(params.id, 'inquired')
    // ... abrir form de inquérito
  }

  const handleShare = async () => {
    await trackInteraction(params.id, 'shared')
    // ... compartilhar em redes sociais
  }

  return (
    <div className="product-detail">
      {/* ... conteúdo */}
      <button onClick={handleSave}>💾 Salvar</button>
      <button onClick={handleMakeInquiry}>📧 Fazer Inquérito</button>
      <button onClick={handleShare}>📤 Compartilhar</button>
    </div>
  )
}
```

### 3. Search Results Page

```tsx
// src/components/search-results.tsx
'use client'

import { trackInteraction } from '@/actions/track-interaction'

export function SearchResults({ results }) {
  const handleResultClick = async (productId) => {
    // Rastrear clique vindo de busca
    await trackInteraction(productId, 'clicked')
  }

  return (
    <div className="results">
      {results.map(product => (
        <a
          key={product.id}
          href={`/produto/${product.id}`}
          onClick={() => handleResultClick(product.id)}
        >
          {product.name} - R$ {product.price}
        </a>
      ))}
    </div>
  )
}
```

### 4. Favorites/Saved Page

```tsx
// src/app/favoritos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { trackInteraction } from '@/actions/track-interaction'

export default function FavoritesPage() {
  const [saved, setSaved] = useState([])

  useEffect(() => {
    loadSaved()
  }, [])

  async function loadSaved() {
    const supabase = createClient()
    const { data } = await supabase
      .from('user_interactions')
      .select('product_id')
      .eq('interaction_type', 'saved')
    
    setSaved(data || [])
  }

  const handleRemoveFromFavorites = async (productId) => {
    // Rastrear remoção (opcional: adicionar tipo 'unfaved')
    await trackInteraction(productId, 'saved') // toggle
    setSaved(saved.filter(s => s.product_id !== productId))
  }

  return (
    <div>
      <h1>Meus Favoritos</h1>
      {saved.map(item => (
        <div key={item.product_id}>
          {/* ... mostrar produto */}
          <button onClick={() => handleRemoveFromFavorites(item.product_id)}>
            ❌ Remover
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Integração com Pages Existentes

### 1. Dashboard com Recomendações

```tsx
// src/app/(dashboard)/dashboard/page.tsx (JÁ FEITO)

import { RecommendedOpportunities } from '@/components/recommended-opportunities'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* ... existing content ... */}
      
      {/* Adicionar depois dos gráficos */}
      <div className="mt-8">
        <RecommendedOpportunities />
      </div>
    </div>
  )
}
```

### 2. Settings/Profile Page

```tsx
// src/app/perfil/settings/page.tsx (SUGESTÃO)

import { UserPreferencesForm } from '@/components/user-preferences-form'

export default function SettingsPage() {
  return (
    <div className="max-w-4xl">
      <h1>Configurações</h1>
      
      <div className="tabs">
        <div id="preferences-tab">
          <h2>Preferências de Recomendação</h2>
          <UserPreferencesForm />
        </div>
        
        {/* ... outras tabs ... */}
      </div>
    </div>
  )
}
```

### 3. Nav Link para Preferências

```tsx
// src/components/sidebar.tsx (ADICIONAR)

import Link from 'next/link'
import { Settings } from 'lucide-react'

export function Sidebar() {
  return (
    <nav>
      {/* ... existing links ... */}
      
      <Link href="/dashboard/preferencias" className="flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Preferências
      </Link>
    </nav>
  )
}
```

## Integração com API Routes Existentes

### 1. Webhook de Novo Produto

```typescript
// src/app/api/products/new/route.ts (SUGESTÃO)

export async function POST(req: Request) {
  const product = await req.json()
  
  // Existing logic...
  
  // Trigger matching (será pego pelo cron)
  // Nada precisa ser feito aqui - cron pega automático
  
  return Response.json({ success: true, product })
}
```

### 2. Webhook de Produto Atualizado

```typescript
// src/app/api/products/[id]/update/route.ts (SUGESTÃO)

export async function PATCH(req: Request, { params }) {
  const updates = await req.json()
  
  // Update product...
  
  // Se preço mudou e ficou dentro da faixa de alguém
  // Invalidar cache de matching para este produto
  if (updates.price) {
    const supabase = createClient()
    await supabase
      .from('product_ai_scores')
      .delete()
      .eq('product_id', params.id)
  }
  
  return Response.json({ success: true })
}
```

## Admin Utilities

### 1. Manual Match Trigger

```typescript
// src/app/api/admin/trigger-matching/route.ts (ADMIN ONLY)

import { createClient } from '@/lib/supabase/server'
import { calculateHybridMatch } from '@/lib/hybrid-matching'
import { sendMatchNotification } from '@/actions/send-match-notification'
import { requireAdminOrRedirect } from '@/lib/server-admin'

export async function POST(req: Request) {
  const supabase = createClient()
  
  // Validar que é admin
  await requireAdminOrRedirect(supabase)
  
  // Params
  const { productId, userId } = await req.json()
  
  // Fetch data
  const [{ data: product }, { data: user }] = await Promise.all([
    supabase.from('products').select('*').eq('id', productId).single(),
    supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
  ])
  
  if (!product || !user) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  
  // Calculate match
  const match = await calculateHybridMatch(user, product)
  
  // Send notification
  const result = await sendMatchNotification({
    userId,
    productId,
    matchScore: match.score,
    reasons: match.reasons,
    product,
  })
  
  return Response.json({ success: result.success, match })
}
```

### 2. View Matching Stats

```typescript
// src/app/admin/matching-stats/page.tsx

export default async function MatchingStatsPage() {
  const supabase = createClient()
  
  // Verificar perms
  await requireAdminOrRedirect(supabase)
  
  const { data: stats } = await supabase
    .from('recommendation_matches')
    .select('match_score, clicked, email_sent, email_opened')
  
  const totalMatches = stats?.length || 0
  const clickRate = stats?.filter(m => m.clicked).length || 0
  const emailRate = stats?.filter(m => m.email_sent).length || 0
  const openRate = stats?.filter(m => m.email_opened).length || 0
  
  return (
    <div>
      <h1>Estatísticas de Matching</h1>
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p>Total de Matches</p>
          <p className="text-2xl font-bold">{totalMatches}</p>
        </Card>
        <Card>
          <p>Taxa de Clique</p>
          <p className="text-2xl font-bold">
            {totalMatches ? ((clickRate / totalMatches) * 100).toFixed(1) : 0}%
          </p>
        </Card>
        <Card>
          <p>Emails Enviados</p>
          <p className="text-2xl font-bold">
            {totalMatches ? ((emailRate / totalMatches) * 100).toFixed(1) : 0}%
          </p>
        </Card>
        <Card>
          <p>Emails Abertos</p>
          <p className="text-2xl font-bold">
            {totalMatches ? ((openRate / totalMatches) * 100).toFixed(1) : 0}%
          </p>
        </Card>
      </div>
    </div>
  )
}
```

## Customizações Úteis

### 1. Customizar Threshold de Notificação

```typescript
// src/lib/matching-engine.ts

// Mudar linha:
// shouldNotify: score >= 65,

// Para:
// shouldNotify: score >= 70, // Mais restritivo
// ou
// shouldNotify: score >= 60, // Mais permissivo
```

### 2. Customizar Pesos do Hybrid

```typescript
// src/lib/hybrid-matching.ts

// Mudar linha:
// hybridScore = Math.round(ruleScore * 0.6 + aiScore * 0.4)

// Para:
// hybridScore = Math.round(ruleScore * 0.7 + aiScore * 0.3) // Confiar mais em regras
// ou
// hybridScore = Math.round(ruleScore * 0.5 + aiScore * 0.5) // Peso igual
// ou
// hybridScore = Math.round(ruleScore * 0.4 + aiScore * 0.6) // Confiar mais em IA
```

### 3. Customizar Regras de Scoring

```typescript
// src/lib/matching-engine.ts

// Aumentar peso da categoria:
// score += 35 → score += 45

// Aumentar peso do preço:
// score += 30 → score += 40

// Adicionar nova regra (ex: rating):
// if (product.rating >= 4.5)
//   score += 10
```

### 4. Customizar Frequência do Cron

No Vercel Dashboard → Cron Jobs:

```
0 8 * * *     → 8am UTC (5am BRT)
0 2,8,14 * *  → 2am, 8am, 2pm UTC (múltiplos runs)
0 */6 * * *   → A cada 6 horas
```

## Testing Utilities

### 1. Teste Local do Cron

```bash
# Terminal 1: Iniciar dev server
npm run dev

# Terminal 2: Chamar cron endpoint
curl -X GET http://localhost:3000/api/cron/matching \
  -H "Authorization: Bearer test-secret-123"
```

### 2. Teste de Email

```typescript
// Criar arquivo: scripts/test-email.ts

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendTestEmail() {
  const result = await resend.emails.send({
    from: 'matches@gerezim.com.br',
    to: 'seu-email@test.com',
    subject: '✨ Nova oportunidade encontrada!',
    html: `
      <h1>Teste de Email</h1>
      <p>Este é um email de teste do sistema de matching.</p>
    `
  })
  
  console.log(result)
}

sendTestEmail()

// Executar: npx ts-node scripts/test-email.ts
```

### 3. Teste de OpenAI

```typescript
// Criar arquivo: scripts/test-openai.ts

import { calculateAIMatch } from '@/lib/ai-matching'

const testData = {
  user: {
    id: 'test',
    interests: ['Embarcações'],
    minPrice: 1000000,
    maxPrice: 10000000,
    preferredLocations: ['Rio de Janeiro'],
    urgency: 'high'
  },
  product: {
    id: '123',
    name: 'Iate de Luxo',
    category: 'Embarcações',
    price: 5000000,
    location: 'Rio de Janeiro',
    description: 'Iate moderno com 40 metros',
    created_at: new Date().toISOString(),
    status: 'ativo'
  }
}

async function testAI() {
  const result = await calculateAIMatch(testData.user, testData.product)
  console.log('AI Match Result:', result)
}

testAI()

// Executar: npx ts-node scripts/test-openai.ts
```

---

**Use esses snippets como referência para integração com seu código existente!**

