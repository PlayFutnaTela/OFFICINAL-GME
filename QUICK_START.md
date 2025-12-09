# 🎯 QUICK START - Sistema de Matching Inteligente

## ⚡ 5 Minutos para Começar

### 1️⃣ Configurar Variáveis (2 min)

```bash
# .env.local

# Obter em: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxxxx

# Gerar com: openssl rand -hex 16
CRON_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Obter em: https://resend.com → API Keys
RESEND_API_KEY=re_xxxxx

# Seu domínio (onde a API roda)
NEXT_PUBLIC_BASE_URL=https://gerezim.com.br
```

### 2️⃣ Deploy para Vercel (1 min)

```bash
git add .
git commit -m "feat: intelligent matching system"
git push origin main
# Vercel faz deploy automático
```

### 3️⃣ Setup Cron Job (1 min)

1. [Vercel Dashboard](https://vercel.com) → Seu projeto
2. **Settings** → **Cron Jobs**
3. **Create New Cron Job**:
   - **Schedule:** `0 8 * * *`
   - **URL:** `/api/cron/matching`
   - **Headers:** `Authorization: Bearer a1b2c3d4e5f6g7h8...`

### 4️⃣ Testar (1 min)

```bash
# Terminal
curl -X GET https://gerezim.com.br/api/cron/matching \
  -H "Authorization: Bearer seu-cron-secret"

# Deve retornar: { "success": true, "users_processed": X, ... }
```

**✅ Pronto! Sistema ativo e funcionando.**

---

## 📍 Onde Tudo Está

### 🎨 UI para Compradores

- **Meu Dashboard** → `/dashboardg`
  - Vê: Top 5 recomendações personalizadas
  - Vê: Favoritos, solicitações, negociações
  - Vê: Agendamentos e ofertas

- **Preferências** → `/perfil/preferencias`
  - Configura: Categorias, preço, localização
  - Ativa: Email, push, SMS (em breve)

### 🎨 UI para Admins

- **Dashboard Admin** → `/dashboard`
  - Vê: Gráficos de vendas
  - Vê: Métricas e análises

### ⚙️ Backend (Automático)

- **Cron Job** → `/api/cron/matching`
  - Executa: Diariamente às 8am UTC
  - Processa: Todos users × produtos novos
  - Envia: Emails com matches

### 📊 Dados

- **Supabase** → 5 tabelas novas
  - `user_preferences` - Configurações
  - `user_interactions` - Rastreamento
  - `recommendation_matches` - Matches encontrados
  - `product_ai_scores` - Cache IA
  - `notifications` - Notificações

---

## 🔧 Customizações Rápidas

### Aumentar/Diminuir Sensibilidade

```typescript
// src/lib/matching-engine.ts, linha ~30

// Threshold baixo = mais matches notificados
shouldNotify: score >= 60  // Menos restritivo (show tudo)
shouldNotify: score >= 65  // Default (equilibrado)
shouldNotify: score >= 75  // Mais restritivo (show melhores)
```

### Mudar Horário do Cron

No Vercel → Cron Jobs → Edit:

```
0 8 * * *    → 8am UTC (5am BRT) ← DEFAULT
0 6 * * *    → 6am UTC (3am BRT)
0 2,8,14 * * → 2am, 8am, 2pm UTC (3x/dia)
0 */6 * * *  → A cada 6 horas
```

### Customizar Template de Email

Editar: `src/actions/send-match-notification.ts`

Procurar `const html = \`...` e mudar HTML/estilos.

### Adicionar Novo Tipo de Interação

```typescript
// src/actions/track-interaction.ts
export type InteractionType = 'viewed' | 'clicked' | 'saved' | 'inquired' | 'shared' | 'seu-novo-tipo'
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| **Variáveis undefined** | Reiniciar dev server: `npm run dev` |
| **Cron retorna 401** | Verificar CRON_SECRET no Vercel settings |
| **Email não chega** | Verificar RESEND_API_KEY, domínio validado |
| **IA retorna score 0** | Verificar OPENAI_API_KEY, créditos OpenAI |
| **Componente não aparece** | Importou `RecommendedOpportunities`? |
| **Matches não aparecem** | User tem `user_preferences` criado? |

---

## 📱 Usar no seu Código

### Adicionar Tracking a um Botão

```tsx
import { trackInteraction } from '@/actions/track-interaction'

<button onClick={() => trackInteraction(productId, 'clicked')}>
  Ver Detalhes
</button>
```

### Mostrar Top 5 Recomendações

```tsx
import { RecommendedOpportunities } from '@/components/recommended-opportunities'

<RecommendedOpportunities />
```

### Deixar Usuário Configurar Preferências

```tsx
import { UserPreferencesForm } from '@/components/user-preferences-form'

<UserPreferencesForm />
```

---

## 🎓 Aprender Mais

- 📖 **Documentação completa:** `INTELLIGENT_MATCHING_SYSTEM.md`
- ✅ **Setup passo-a-passo:** `SETUP_CHECKLIST.md`
- 📝 **Exemplos de código:** `INTEGRATION_SNIPPETS.md`
- 🎯 **Resumo executivo:** `IMPLEMENTATION_SUMMARY.md`

---

## ❓ Próximas Perguntas?

### "Como adiciono mais regras de matching?"
→ Editar `src/lib/matching-engine.ts`, adicionar lógica em `calculateRuleBasedMatch()`

### "Como mudo o peso da IA?"
→ Editar `src/lib/hybrid-matching.ts`, linha da fórmula: `ruleScore * 0.6 + aiScore * 0.4`

### "Como integro com meu email provider?"
→ Mudar em `src/actions/send-match-notification.ts`, função `sendMatchEmail()`

### "Como rodo cron a cada hora?"
→ Vercel Cron: schedule `0 * * * *` (0 minuto de cada hora)

### "Como vejo logs de erros?"
→ Vercel Dashboard → Deployment → Logs (ou Supabase SQL Editor para DB logs)

---

## 🚀 Você Está Pronto!

O sistema está:
- ✅ Criado
- ✅ Testado
- ✅ Documentado
- ✅ Deployável
- ✅ Monitorável

**Próximo passo:** Configurar variáveis de ambiente e fazer deploy! 🎉

---

**Dúvidas?** Consultei documentação nos arquivos `.md` acima ou check `src/lib/` para código!

