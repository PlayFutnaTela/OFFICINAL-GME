# Análise Estratégica e Técnica da Plataforma GEREZIM Private Club

## SEÇÃO 1: POSICIONAMENTO ESTRATÉGICO

### 1.1. Manifesto do Produto GEREZIM

#### O que é GEREZIM?
GEREZIM é um **clube privado digital exclusivo** para intermediação de oportunidades de negócios de alto valor, onde membros selecionados acessam um ecossistema curado de deals, investimentos e negociações que não estão disponíveis ao mercado comum.

#### O que NÃO é GEREZIM?
- Marketplace aberto (não é OLX, Imobiliário.com ou Amazon)
- Plataforma de crowdfunding
- Rede social de negócios (não é LinkedIn)
- Plataforma de e-commerce
- Sistema genérico de CRM
- Serviço de consultoria

#### Qual problema resolve?
**Para investidores, empresários e tomadores de decisão:**
- Dificuldade de acessar oportunidades exclusivas e vetadas (off-market)
- Falta de intermediários confiáveis e curados
- Impossibilidade de terceirizar análise de viabilidade de deals
- Desperdício de tempo em filtragem manual de oportunidades
- Incerteza sobre reputação e confiabilidade de contatos

**Para intermediadores e consultores:**
- Necessidade de plataforma profissional para gerenciar clientes
- Dificuldade em rastrear deals e fechar negociações
- Falta de sistema para controlar acesso exclusivo a oportunidades
- Perda de oportunidades por desorganização

#### Para quem é?
**Membros Premium:**
1. **Investidores Anjos / Family Offices** - buscam deals pré-filtrados de alto padrão
2. **Empresários** - procuram aquisições, expansão e parcerias estratégicas
3. **Construtoras / Incorporadoras** - buscam terrenos e projetos exclusivos
4. **Consultores de Negócios** - usam como ferramenta de gestão
5. **Family Offices** - buscam gestão patrimonial e investimentos

**Intermediadores:**
- Corretores high-end
- Consultores de negócios
- Agentes imobiliários premium
- Consultores de investimento
- M&A Advisors

#### Como gera valor?
1. **Para Membros:**
   - Acesso a deals exclusivos 80% mais cedo que o mercado
   - Triagem profissional por intermediadores de confiança
   - Validação de viabilidade via módulo de análise
   - Contatos pré-verificados e confiáveis
   - Histórico de comportamento para recomendações personalizadas

2. **Para Intermediadores:**
   - Gestão centralizada de clientes e oportunidades
   - Sistema de aprovação para controlar acesso
   - Auditoria completa de atividades
   - Integração com concierge para suporte premium
   - Comissões transparentes e rastreáveis

3. **Para a Plataforma:**
   - Rede de efeito (mais membros = mais oportunidades = mais valor)
   - Dados de comportamento para IA de matching
   - Múltiplas fontes de receita (assinatura, taxa de sucesso, serviços premium)

---

### 1.2. Estrutura de Planos / Camadas de Acesso

GEREZIM opera em três camadas de membros exclusivos, cada uma com direitos e privilégios específicos:

#### **NÍVEL SILVER** (Membro Iniciante)
- **Custo:** R$ 4.900/ano ou R$ 490/mês
- **Uso:** Explorador de oportunidades, primeiro contato
- **Acessos:**
  - ✓ Visualização de 60% das oportunidades públicas
  - ✓ Até 5 pedidos especiais por mês
  - ✓ Acesso ao concierge com limite de 2h/mês
  - ✓ Histórico básico (últimos 90 dias)
  - ✓ 1 relatório de valuation express/mês
  - ✗ Acesso a deals off-market
  - ✗ Análise prioritária
  - ✗ Matching automático

#### **NÍVEL GOLD** (Membro Ativo)
- **Custo:** R$ 14.900/ano ou R$ 1.490/mês
- **Uso:** Negociador ativo, portfolio acompanhador
- **Acessos:**
  - ✓ Visualização de 100% das oportunidades públicas
  - ✓ Acesso a 30% das oportunidades off-market (deals privados)
  - ✓ Até 20 pedidos especiais por mês
  - ✓ Acesso prioritário ao concierge (8h/mês)
  - ✓ Histórico completo (últimos 12 meses)
  - ✓ Unlimited relatórios de valuation express
  - ✓ Matching inteligente 2x/semana
  - ✓ Notificações de "match perfeito"
  - ✗ Deals 100% privados (Black Book)
  - ✗ Acesso a investment club exclusivo
  - ✗ Concierge dedicado

#### **NÍVEL BLACK** (Membro Institucional)
- **Custo:** R$ 49.900/ano ou R$ 4.990/mês (+ taxa de sucesso variável)
- **Uso:** Grandes alocadores, investidores institucionais, multi-deal
- **Acessos:**
  - ✓ Visualização de 100% de TODAS as oportunidades
  - ✓ Acesso total ao Black Book (deals 100% privados + confidenciais)
  - ✓ Unlimited pedidos especiais
  - ✓ Concierge dedicado 24h (gestor de relacionamento)
  - ✓ Histórico completo com analytics avançadas
  - ✓ Valuation completa (não apenas express)
  - ✓ Matching inteligente contínuo (daily)
  - ✓ Deal origination customizado (GEREZIM procura deals para você)
  - ✓ Investment club exclusivo (networking premium)
  - ✓ Due diligence facilitada
  - ✓ Prioridade máxima em processamento
  - ✓ Consultoria estratégica inclusa

#### Benefícios Transversais Todos os Níveis:
- Dashboard personalizado por tipo de usuário
- Notificações em tempo real
- Mobile app completo
- Suporte por email 24h
- Acesso ao blog e research
- Comunidade restrita de membros

---

## SEÇÃO 2: VISÃO TÉCNICA INTEGRADA

O sistema GEREZIM é um MVP robusto de uma plataforma de intermediação de negócios com suporte a múltiplos níveis de acesso, permitindo o gerenciamento de oportunidades exclusivas, clientes, pipeline de vendas, sistema de convites privados, assistente concierge e solicitações de produtos/serviços curados.

---

## SEÇÃO 3: MAPA DE FLUXOS DO USUÁRIO

### 3.1. Fluxo de Onboarding com Convite

```
Visitante Público
    ↓
Preenche formulário de solicitação (nome, email, WhatsApp, interesse)
    ↓
Insere código de convite (validação em tempo real)
    ↓
Solicita acesso → Email de confirmação enviado
    ↓
[PAUSA] Aguarda aprovação de administrador
    ↓
Admin revisa perfil → Aprovar/Rejeitar
    ↓
SE APROVADO:
  - Conta criada automaticamente
  - Email com credenciais temporárias
  - Acesso imediato com nível Silver (padrão)
  - Onboarding em 3 etapas (produto, interface, recursos)
    ↓
SE REJEITADO:
  - Email com motivo da rejeição
  - Sugestão de tentar novamente em X dias
```

**Tabelas Envolvidas:**
- `pending_members` (candidatos em revisão)
- `profiles` (perfil criado após aprovação)
- `invites` (rastreio de código usado)
- `audit_logs` (registro de cada etapa)

---

### 3.2. Fluxo de Upgrade de Nível

```
Membro Silver (atual)
    ↓
Acessa "Upgrade" no painel
    ↓
Vê opções: Gold (R$ 1.490/mês) ou Black (R$ 4.990/mês)
    ↓
Clica em "Solicitar Upgrade"
    ↓
Preenche justificativa (opcional)
    ↓
[CASO SILVER→GOLD]
  - Aprovação automática em até 2h
  - Email de boas-vindas
  - Acesso ativado imediatamente
    ↓
[CASO SILVER/GOLD→BLACK ou GOLD→BLACK]
  - Vai para fila de aprovação manual
  - Admin verifica histórico, atividade, reputação
  - Email com decisão e data de ativação
```

**Tabelas Envolvidas:**
- `profiles` (update de `membership_tier`)
- `subscription_requests` (novo: rastreio de solicitações)
- `audit_logs` (registro de upgrades)

---

### 3.3. Fluxo de Acesso a Oportunidades por Nível

```
MEMBRO SILVER:
  Acessa /oportunidades
  ↓
  Vê filtro por categoria
  ↓
  Visualiza 60% das oportunidades públicas
  ↓
  Clica em uma → Vê detalhes completos
  ↓
  Botão "Solicitar Apresentação" → vai para Concierge

MEMBRO GOLD:
  Acessa /oportunidades
  ↓
  Vê filtro por: categoria, faixa de valor, localização, confidencialidade
  ↓
  Visualiza 100% das oportunidades públicas + 30% do Black Book
  ↓
  Deals que você "match" aparecem com "🔥 Perfect Match" (via IA)
  ↓
  Notificações diárias de novos matches

MEMBRO BLACK:
  Acessa /black-book (seção privada 100%)
  ↓
  Vê TODAS as oportunidades (públicas + privadas + confidenciais)
  ↓
  Filtros avançados: volume de deal, ROI esperado, tipo de investidor etc
  ↓
  Contato direto com intermediador
  ↓
  Atribui gestor de relacionamento (concierge dedicado)
  ↓
  Recebe deal origination customizado
```

**Tabelas Envolvidas:**
- `products` / `opportunities` (com campo `confidentiality_level`: public, gold, black)
- `user_matches` (novo: rastreio de matches automáticos via IA)
- `view_history` (novo: rastreio do que usuário visualizou)

---

### 3.4. Fluxo de Solicitação de Pedido Especial (Concierge)

```
Membro (qualquer nível)
    ↓
Acessa /solicitar-pedido
    ↓
Preenche:
  - Tipo de oportunidade desejada (ex: "Imóvel em SP com 500m² acima de 5M")
  - Prazo
  - Orçamento aproximado
  - Detalhes adicionais
    ↓
Submete → Criação de ticket no sistema
    ↓
[FILA DE PROCESSAMENTO]
  Black: Prioridade máxima (0-24h de retorno)
  Gold: Prioridade alta (0-48h)
  Silver: Prioridade normal (3-5 dias)
    ↓
Concierge pesquisa na rede + Black Book
    ↓
Envia sugestões (até 5 por padrão)
    ↓
Membro feedback → Refina busca
    ↓
Quando encontrar algo: "Deal Match" → Apresentação formal
    ↓
Intermediador faz contato direto
```

**Tabelas Envolvidas:**
- `pedido_requests` (com campo `priority_level`)
- `request_comments` (novo: conversa sobre o pedido)
- `request_matches` (novo: deals sugeridos para cada pedido)

---

### 3.5. Fluxo de Conciergeria Dedicada (Black)

```
Membro Black
    ↓
Acessa /concierge
    ↓
Vê gestor atribuído (nome, telefone, email)
    ↓
Opções:
  1. Chat com gestor (mensagens em tempo real)
  2. Agendar call (integração com calendário)
  3. Enviar documentos (upload seguro)
  4. Ver histórico de atendimentos
    ↓
Gestor recebe notificação → Prioridade máxima
    ↓
Atendimento: consultoria, análise de viabilidade, negotiation support
    ↓
Caso gere negócio: Registro de conclusão + feedback
```

**Tabelas Envolvidas:**
- `concierge_conversations` (com campo `assigned_concierge`)
- `concierge_chats` (novo: mensagens em tempo real)
- `concierge_calls` (novo: histórico de chamadas)
- `request_matches` (atualizado: resultado do atendimento)

---

### 3.6. Fluxo de Criação de Oportunidade por Intermediador

```
Intermediador (autenticado)
    ↓
Acessa /dashboard/oportunidades/nova
    ↓
Preenche:
  - Título, categoria, valor, localização
  - Descrição detalhada
  - Fotos/documentos
  - Nível de confidencialidade (público / gold / black)
  - Interessados específicos (opcional)
    ↓
Salva como RASCUNHO
    ↓
Pré-visualização com dados fictícios
    ↓
Publica (de imediato ou agenda para data específica)
    ↓
[SE PUBLIC]
  - Visível para todos Ouro+
  - Notificação automática para matches
  - Contador de visualizações
    ↓
[SE GOLD]
  - Visível somente para Ouro
  - Notificação exclusiva para Ouro que combinam
    ↓
[SE BLACK]
  - Visível somente para Black
  - Notificação exclusiva com "Deal Origination"
  - Contato direto (sem intermediários adicionais)
```

**Tabelas Envolvidas:**
- `products` / `opportunities` (com status draft/published)
- `product_views` (novo: análise de quantas vezes foi visualizado)
- `product_notifications` (novo: rastreio de quem foi notificado)

---

### 3.7. Fluxo de Análise de Viabilidade (Valuation Express)

```
Membro (Gold+ autorizado a solicitar)
    ↓
Acessa /valuation-express
    ↓
Seleciona tipo: Empresa / Imóvel / Carro de Luxo
    ↓
Preenche dados básicos (localização, tamanho, receita, etc)
    ↓
Faz upload de documentos (opcional)
    ↓
Submete solicitação
    ↓
[FILA ANÁLISE]
  Black: 0-4h
  Gold: 0-24h
    ↓
IA processa (preliminary assessment)
    ↓
Analista revisa + adiciona insights
    ↓
Gera relatório em PDF (executive summary)
    ↓
Envia email com resultado + contato de especialista
    ↓
Membro pode:
  - Solicitar análise mais profunda (upgrade)
  - Marcar como "interessado" (salva histórico)
  - Compartilhar com sócios (link seguro)
```

**Tabelas Envolvidas:**
- `valuation_requests` (novo: rastreio de solicitações)
- `valuation_reports` (novo: armazenamento de relatórios)
- `valuation_analysis` (novo: dados técnicos da análise)

---

### 3.8. Fluxo de Compartilhamento e Rastreio de Conversão

```
Membro
    ↓
Vê oportunidade interessante → Clica "Compartilhar"
    ↓
Opções:
  1. WhatsApp (gera link único rastreável)
  2. Email (mesmo)
  3. Copiar link (mesmo)
  4. Enviar para contato no GEREZIM
    ↓
Link único criado + QR Code
    ↓
Intermediador vê em tempo real:
  - Quem compartilhou
  - Com quem foi compartilhado (se contato GEREZIM)
  - Quantas vezes o link foi aberto
  - Se resultou em contato/interesse
    ↓
Rastreio na timeline:
  - "João compartilhou com Maria (aberto 3x)"
  - "Maria clicou para contato" 
  - "Negociação iniciada"
    ↓
Dashboard de conversão:
  - Taxa de conversão por oportunidade
  - Intermediadores mais eficientes
  - Padrões de comportamento
```

**Tabelas Envolvidas:**
- `links` (atualizado: com tracking de cliques e compartilhamentos)
- `link_clicks` (novo: rastreio detalhado)
- `conversion_funnel` (novo: análise de conversão)

---

### 3.9. Fluxo de Histórico e DNA de Compra

```
Membro Black/Gold (após 30 dias na plataforma)
    ↓
Acessa /my-profile/buying-dna
    ↓
Visualiza:
  1. Categorias mais visualizadas (% do tempo)
  2. Faixa de valor preferida (gráfico)
  3. Localidades de interesse (mapa)
  4. Tipos de deal que geram cliques (listagem)
  5. Taxa de conversão pessoal vs média
  6. Oportunidades salvas / em negociação / fechadas
    ↓
Sistema oferece:
  - "Recomendações baseadas no seu perfil"
  - "Você tem 3 deals similares a este"
  - "Novo deal em SP te aguarda"
    ↓
IA usa dados para:
  - Melhorar matching automático
  - Sugerir upgrades de nível
  - Personalizar notificações
  - Criar relatórios de insight
```

**Tabelas Envolvidas:**
- `view_history` (novo: rastreio de visualizações)
- `click_history` (novo: rastreio de cliques)
- `user_preferences` (novo: preferências inferidas)
- `recommendations` (novo: sugestões geradas por IA)

---

## SEÇÃO 4: ESTRUTURA TÉCNICA
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **UI Framework**: Tailwind CSS
- **Componentes UI**: Shadcn/UI, Radix UI
- **Ícones**: Lucide React
- **Gráficos**: Google Charts, Recharts
- **Animações**: Framer Motion
- **Gerenciamento de Dependências**: npm
 - **Toasts**: Sonner
 - **3D/GLSL**: react-three-fiber, three.js, ShaderMaterials personalizados
 - **Menus e Interações**: componentes customizados em `style/` (ex.: `appmenu.tsx`, `efeito-sidebar.tsx`)
 - **Emails**: Resend para envio de comunicações
 - **Drag and Drop**: @dnd-kit para funcionalidades interativas
 - **UI Avançada**: @ark-ui/react para componentes acessíveis

### Backend
- **Backend as a Service**: Supabase (Autenticação, Banco de Dados, Armazenamento)
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage para imagens
 - **RLS (Row Level Security)**: políticas finas por tabela com funções auxiliares
 - **RPC Functions**: funções definidas no banco para leitura administrativa segura

### Infraestrutura
- **Frontend**: Next.js App Router com Server Actions para operações que requerem autenticação
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estilo**: Tailwind CSS com componentes acessíveis
 - **Deploy**: Vercel, com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurados

### Ferramentas / Bibliotecas adicionais (adicionadas / utilizadas recentemente)
- **react-three-fiber / three.js** — usado para efeitos gráficos 3D e planos com shaders (ex.: `style/shader1.tsx`, `style/shader-bg.tsx`).
- **ShaderMaterials personalizados** — componentes que usam GLSL (vertex/fragment shaders) para efeitos visuais avançados.
- **Sonner** — biblioteca usada para os toasts informativos (ex.: `src/components/ui/sonner.tsx`).
- **Framer Motion** — animações e transições (diversos componentes UI como `style/appmenu.tsx`, `style/efeito-sidebar.tsx` e outros).  
- **@supabase/ssr / createBrowserClient** — utilização do cliente Supabase para browser/SSR (com atenção para uso em server-side - ver observações de build).
 - **Lucide React** — ícones consistentes em toda a UI.
 - **Radix UI** — acessibilidade e patterns de UI robustos (dropdowns, dialogs).
 - **Tailwind Plugins** — configuração central em `tailwind.config.ts` e `postcss.config.js`.

### Ferramentas Adicionadas Recentemente (Sistema de Tarefas e Timeline)
- **Server Actions** — implementadas para gerenciamento de tarefas de forma segura no servidor
- **Supabase RLS Policies** — políticas de segurança em nível de linha para controle de acesso baseado em role (admin)
- **Supabase RPC Functions** — funções PostgreSQL que ignoram RLS para leitura de logs administrativos
 - **Admin Checks** — endpoint `GET /api/auth/check-admin` para verificação de permissões.
 - **Logs com bypass seguro** — `get_opportunity_logs()` com SECURITY DEFINER.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Frontend (`/frontend`)
- `src/app/` - Páginas e layouts do Next.js App Router
- `src/components/` - Componentes reutilizáveis
- `src/lib/supabase/` - Configuração e clientes do Supabase
- `src/components/ui/` - Componentes de UI do shadcn
 - `src/actions/` - Server Actions para tarefas, convites, membros, links e logs
 - `src/app/api/` - Rotas API (ex.: `auth/check-admin`)
 - `style/` - Componentes visuais e efeitos (3D, shaders, carrossel)

### Backend (`/backend`)
- `schema.sql` - Script de criação do banco de dados com RLS (Row Level Security)
- `seed.sql` - Dados de exemplo para testes
- `migrations/` - Pasta para futuras migrações de banco
  - `20251126_add_currency_to_products.sql`
  - `20251126_add_products_rls_policies.sql`
  - `20251126_add_role_to_profiles.sql`
  - `20251126_fix_profiles_rls_with_is_admin.sql`
  - `20251130_add_interests_to_profiles.sql`
  - `20251201_add_invite_code_to_profiles.sql`
  - `20251201_create_invites_system.sql`
  - `20251201_fix_invites_rls_for_users.sql`
  - `20251201_fix_invites_update_policy.sql`
  - `20251201_fix_profiles_insert_policy.sql`
  - `20251202_add_whatsapp_to_profiles.sql`
  - `admin_opportunities_policy.sql`
  - `allow_tasks_for_products.sql`
  - `check_and_populate_logs.sql`
  - `check_policy.sql`
  - `check_user_role.sql`
  - `create_get_logs_function.sql`
  - `create_increment_function.sql`
  - `create_links_table.sql`
  - `debug_complete.sql`
  - `debug_opportunity_logs_rls.sql`
  - `debug_rls.sql`
  - `diagnose_logs.sql`
  - `fix_admins_full_control.sql`
  - `fix_invites_policy_final.sql`
  - `fix_invites_policy.sql`
  - `fix_opportunity_logs_rls_for_products.sql`
  - `fix_profiles_constraint.sql`
  - `fix_rls_complete.sql`
  - `rls_admins_only.sql`
  - `tarefas_sistema.sql`
  - `verify_logs_and_tasks.sql`
  - `concierge_folders_table.sql`
  - `concierge_conversations_table.sql`
  - `pedido_requests_table.sql`
  - `concierge_settings_table.sql`
  - `audit_logs_system.sql`

## Atualizações e correções recentes (resumo técnico)

- Repositório limpo e enviado ao GitHub (remoção de `node_modules` do histórico, criação de `.gitignore` adequada). Importante: arquivos grandes (ex.: binários do SWC) impossibilitavam push — histórico reescrito e push forçado para `https://github.com/PlayFutnaTela/OFFICINAL-GME.git`.
- Hooks e clientes Supabase corrigidos para serem seguros durante builds/SSR — adicionada verificação para `document` antes de acessar cookies no cliente (arquivo: `src/lib/supabase/client.ts`).
- Adicionado `src/app/not-found.tsx` para corrigir falhas no export/static generation que ocorriam em builds na Vercel.
- Correções de tipagem e compatibilidade TypeScript em vários componentes para passar as checagens de tipo durante `next build` (ex.: `src/components/auth-monitor.tsx`, `src/components/ui/avatar.tsx`, `src/components/opportunities-store.tsx`, `src/components/product-list.tsx`).
- Ajustes em componentes com Framer Motion para respeitar tipos e evitar erros de compilação (`style/appmenu.tsx`, `style/efeito-sidebar.tsx`).
- Integração com shaders (react-three) tipada via `args` para o `shaderMaterial` (ex.: `style/shader1.tsx`) evitando erros de tipos durante build.
 - Organização do `style/` com efeitos visuais (carrossel infinito, hover, shader background, gráfico Regional HTML).
 - Configuração de Tailwind e PostCSS atualizada para suportar o design system.

### Correções do Sistema de Tarefas e Timeline (Novo)

- **Remoção de `.single()` em queries Supabase** — Corrigido o método `.single()` que causava erro "Cannot coerce result to a single JSON object" quando retornava arrays. Implementado padrão de extração: `const data = Array.isArray(result) ? result[0] : result`.

- **Codificação UTF-8** — Recodificado arquivo `src/actions/tasks.ts` para UTF-8 válido, removidos caracteres emoji e especiais problemáticos.

- **RLS Policies para Timeline** — Implementadas políticas de Row Level Security para restringir leitura de logs apenas a usuários com role 'adm'.

- **Função RPC com SECURITY DEFINER** — Criada função PostgreSQL `get_opportunity_logs()` que contorna RLS de forma segura, permitindo que admins leiam logs sem restrições.

- **Verificação de Permissões Assíncrona** — Implementado endpoint `/api/auth/check-admin` e integração no componente `OpportunityTimeline` com handling correto de race conditions (retorna `null` durante verificação).

- **Logging Detalhado** — Adicionados console.logs prefixados (ex.: `[functionName]`) em todas as operações de tarefas e logs para facilitar debugging em produção.
 - **Políticas de tarefas** — Permissão explícita para associação de tarefas a produtos com `allow_tasks_for_products.sql`.
 - **Diagnóstico e verificação** — Scripts auxiliares para auditar RLS e logs (`diagnose_logs.sql`, `verify_logs_and_tasks.sql`).

---

## SEÇÃO 5: DESIGN SYSTEM FORMALIZADO

### 5.1. Paleta de Cores (Tokens)

```css
/* PRIMARY - Ouro Premium */
--color-gold-50: #FEF9F3
--color-gold-100: #FCF1E3
--color-gold-200: #F9DFC0
--color-gold-300: #F5CB9C
--color-gold-400: #F1B878
--color-gold-500: #C59A00  /* Primary Brand */
--color-gold-600: #9D7A00
--color-gold-700: #755A00
--color-gold-800: #4D3A00

/* SECONDARY - Neutro Elegante */
--color-slate-50: #F8FAFC
--color-slate-100: #F1F5F9
--color-slate-200: #E2E8F0
--color-slate-300: #CBD5E1
--color-slate-400: #94A3B8
--color-slate-500: #64748B
--color-slate-600: #475569
--color-slate-700: #334155
--color-slate-800: #1E293B
--color-slate-900: #0F172A

/* ACCENT - Status e Alertas */
--color-success: #10B981 (Verde)
--color-warning: #F59E0B (Laranja)
--color-error: #EF4444 (Vermelho)
--color-info: #3B82F6 (Azul)

/* SEMANTIC - Membros */
--color-silver: #C0C0C0 (Cinza metalizado)
--color-gold: #FFD700 (Ouro)
--color-black: #1A1A1A (Preto premium)
```

### 5.2. Tipografia

```css
/* Headings */
h1: Poppins Bold 48px / 120%
h2: Poppins Bold 36px / 120%
h3: Poppins SemiBold 28px / 120%
h4: Poppins SemiBold 20px / 120%
h5: Poppins Medium 16px / 120%
h6: Poppins Medium 14px / 120%

/* Body */
Body Large: Inter Regular 16px / 150%
Body Regular: Inter Regular 14px / 150%
Body Small: Inter Regular 12px / 150%

/* Labels */
Label Large: Inter Medium 14px / 150%
Label Regular: Inter Medium 12px / 150%

/* Monospace (para dados técnicos) */
Code: JetBrains Mono 12px / 150%
```

### 5.3. Espaçamento (8px Grid)

```
--space-0: 0px
--space-1: 4px (ícones pequenos)
--space-2: 8px (default padding interno)
--space-3: 12px
--space-4: 16px (padding padrão)
--space-6: 24px (margin entre seções)
--space-8: 32px (margin entre componentes maiores)
--space-12: 48px (margin entre grandes áreas)
--space-16: 64px (margin de seções principais)
--space-20: 80px (espaçamento de página)
```

### 5.4. Layout Padrão

```
Desktop: 1920px (viewport máxima)
Tablet: 1024px
Mobile: 375px (mínimo)

Container max-width: 1440px
Gutter (lateral): 2 x --space-6 (24px)
Coluna: 12 colunas (Tailwind grid)

Breakpoints:
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 5.5. Componentes Padronizados

#### Card Premium
```tsx
<Card className="bg-white dark:bg-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gold-200 dark:border-gold-700">
  <CardHeader className="border-b border-gold-100 dark:border-gold-800">
    <CardTitle className="text-gold-900 dark:text-gold-100">Título</CardTitle>
  </CardHeader>
  <CardContent className="pt-6">
    {/* conteúdo */}
  </CardContent>
</Card>
```

#### Badge por Nível
```tsx
/* Silver */
<Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
  Silver
</Badge>

/* Gold */
<Badge className="bg-gold-100 text-gold-900 border-gold-300">
  Gold
</Badge>

/* Black */
<Badge className="bg-slate-900 text-white border-slate-800">
  Black
</Badge>
```

#### Button Primário
```tsx
<Button className="bg-gold-500 hover:bg-gold-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
  Ação Primária
</Button>
```

#### Input Premium
```tsx
<Input 
  className="border-gold-300 focus:border-gold-500 focus:ring-gold-500 rounded-lg"
  placeholder="Digite aqui..."
/>
```

### 5.6. Dark Mode
- Implementado via classe `dark` no `html`
- Suporte completo a todo o design system
- Transição suave entre temas (300ms)
- Preferência do usuário salva em localStorage

---

## SEÇÃO 6: DASHBOARDS DIFERENCIADOS POR TIPO DE USUÁRIO

### 6.1. Dashboard do Membro Silver

**Layout:**
- Seção 1: Boas-vindas + Status de onboarding
- Seção 2: Oportunidades recomendadas (últimas 3)
- Seção 3: Minhas solicitações (pedidos abertos)
- Seção 4: Como funciona GEREZIM (guia)
- Seção 5: Upgradar para Gold (CTA destacado)

**Gráficos:**
- Nenhum gráfico técnico (não aplicável em Silver)
- Cards informativos simples
- Timeline de últimas atividades (leitura)

**Funcionalidades Disponíveis:**
- Visualizar 60% das oportunidades
- Fazer até 5 pedidos/mês
- Acessar concierge (2h/mês)
- Ver perfil pessoal

### 6.2. Dashboard do Membro Gold

**Layout:**
- Seção 1: Estatísticas pessoais (visualizações, matches, conversões)
- Seção 2: Meus Matches (deals que te interessam)
- Seção 3: Pedidos Abertos (com status)
- Seção 4: Oportunidades Salvas (favoritos)
- Seção 5: Histórico (últimos 30 dias)

**Gráficos:**
- 📊 Categorias mais visualizadas (donut chart)
- 📈 Faixa de valor preferida (histogram)
- 🗺️ Localidades de interesse (geo chart)
- 📉 Taxa de conversão pessoal vs média
- ⏱️ Timeline de atividades

**Funcionalidades Disponíveis:**
- Visualizar 100% das oportunidades públicas
- Acesso a 30% do Black Book
- Matching inteligente 2x/semana
- Até 20 pedidos/mês
- Concierge 8h/mês
- Análise de viabilidade (unlimited)
- Relatórios de DNA de compra

### 6.3. Dashboard do Membro Black

**Layout:**
- Seção 1: Visão Geral Black (headline KPIs)
- Seção 2: Black Book (todas as oportunidades privadas)
- Seção 3: Gestor de Relacionamento (contato dedicado)
- Seção 4: Pedidos Customizados (deal origination)
- Seção 5: Due Diligence (arquivos e análises)

**Gráficos:**
- 📊 Análise detalhada de portfolio (segmentação)
- 📈 ROI esperado vs realizado (scatter plot)
- 🎯 Pipeline de negociação (Kanban visual)
- 💰 Distribuição de capital (treemap)
- ⏰ Timeline de deals (Gantt chart)
- 🔐 Deals fechados (com confidencialidade)

**Funcionalidades Disponíveis:**
- Acesso 100% ao Black Book
- Deal origination personalizado
- Concierge dedicado 24h
- Due diligence facilitada
- Investment club
- Consultoria estratégica
- Unlimited pedidos
- Prioridade máxima

### 6.4. Dashboard Administrativo (Gerenciador/Intermediador)

**Layout:**
- Seção 1: KPIs gerenciais (total de membros, deals, comissões)
- Seção 2: Pipeline de aprovações (membros pendentes)
- Seção 3: Análise de conversão (por deal, por intermediador)
- Seção 4: Auditoria (logs de ações)
- Seção 5: Gestão de concierge (workload)

**Gráficos:**
- 📊 Membros por nível (distribuição)
- 📈 Crescimento de membros (timeline)
- 💰 Comissões estimadas (por deal)
- 🎯 Taxa de conversão por deal
- ⏱️ Tempo médio para fechamento
- 👥 Workload de concierge (horas/dia)
- 🔐 Auditoria de acessos (quem viu o quê)

**Funcionalidades Disponíveis:**
- Criar/editar/deletar oportunidades
- Gerenciar membros e aprovações
- Definir níveis de confidencialidade
- Ver análises completas
- Gerenciar concierge
- Auditoria total
- Exportar relatórios
- Integração com webhooks

---

## SEÇÃO 7: MELHORIAS DE BACKEND

### 7.1. Separação entre Dados Públicos e Exclusivos

**Nova Tabela: `private_opportunities`**
```sql
CREATE TABLE private_opportunities (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  value NUMERIC,
  confidentiality_level TEXT ('gold', 'black'), -- Define acesso
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  description TEXT,
  location TEXT,
  images TEXT[],
  status TEXT DEFAULT 'published',
  -- Campos adicionais específicos de deals privados
  deal_type TEXT ('acquisition', 'investment', 'partnership'),
  roi_expected NUMERIC,
  timeline TEXT
);

-- RLS Policy: Apenas usuários com membership_tier >= nível do deal podem ver
```

**Nova Tabela: `private_contacts`**
```sql
CREATE TABLE private_contacts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  contact_info JSONB, -- email, phone, whatsapp (encrypted)
  relationship TEXT, -- 'investor', 'buyer', 'partner', 'strategic'
  net_worth NUMERIC, -- confidencial
  interests TEXT[],
  confidentiality_level TEXT ('internal', 'team', 'admin'),
  created_at TIMESTAMP DEFAULT NOW(),
  -- Auditoria
  last_contacted TIMESTAMP,
  interaction_count INT DEFAULT 0
);

-- RLS Policy: Somente admin e intermediador atribuído podem ver
```

### 7.2. Tabelas para Rastreamento de Comportamento

**Nova Tabela: `user_activities`**
```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  activity_type TEXT ('view', 'click', 'save', 'share', 'contact', 'deal_closed'),
  entity_type TEXT ('opportunity', 'product', 'deal'),
  entity_id UUID,
  metadata JSONB, -- detalhes adicionais
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX idx_user_activities_user_id_type ON user_activities(user_id, activity_type);
CREATE INDEX idx_user_activities_entity ON user_activities(entity_type, entity_id);
```

**Nova Tabela: `user_preferences`**
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  -- Inferred from behavior
  preferred_categories TEXT[],
  preferred_value_range JSONB, -- {min, max}
  preferred_locations TEXT[],
  preferred_deal_types TEXT[],
  -- Explícito
  notification_frequency TEXT, -- 'daily', 'weekly', 'monthly'
  sharing_permissions JSONB,
  -- Timestamps
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7.3. Tabelas para IA e Recomendações

**Nova Tabela: `recommendations`**
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  opportunity_id UUID REFERENCES products(id),
  match_score NUMERIC(3,2), -- 0 a 1.00
  match_reason TEXT, -- "Categoria que você mais visualiza", etc
  created_at TIMESTAMP DEFAULT NOW(),
  interacted_at TIMESTAMP, -- quando o usuário viu a recomendação
  resulted_in_contact BOOLEAN DEFAULT FALSE
);

-- Índices
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id, created_at DESC);
```

**Nova Tabela: `valuation_requests`**
```sql
CREATE TABLE valuation_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  deal_type TEXT ('company', 'property', 'luxury_car'),
  basic_info JSONB, -- dados básicos (localização, tamanho, receita)
  documents TEXT[],  -- URLs de uploads
  status TEXT ('pending', 'analyzing', 'completed', 'failed'),
  priority TEXT ('normal', 'urgent'), -- depende do nível do membro
  assigned_analyst UUID REFERENCES profiles(id),
  result_document TEXT, -- URL do PDF gerado
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### 7.4. Consolidação de Migrations

**Estrutura Proposta:**

```
backend/migrations/
├── 001_base_schema.sql (contém: users, profiles, opportunities, contacts, etc)
├── 002_products_and_categories.sql
├── 003_rls_and_security.sql
├── 004_tasks_and_timeline.sql
├── 005_invites_system.sql
├── 006_concierge_system.sql
├── 007_private_opportunities.sql (novo)
├── 008_user_behavior_tracking.sql (novo)
├── 009_ai_recommendations.sql (novo)
├── 010_valuation_module.sql (novo)
└── 011_fixes_and_optimizations.sql

# Em produção:
-- Antes (multiplos arquivos resolvendo o mesmo problema)
-- Depois (migrations sequenciais e claras)
```

### 7.5. Melhorias de Performance

**Índices Críticos Recomendados:**

```sql
-- Oportunidades
CREATE INDEX idx_products_status_category ON products(status, category);
CREATE INDEX idx_products_created_at_desc ON products(created_at DESC);

-- Búsca full-text
ALTER TABLE products ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, ''))
) STORED;
CREATE INDEX idx_products_search ON products USING gin(search_vector);

-- Membership tiers para acesso
CREATE INDEX idx_profiles_membership_tier ON profiles(membership_tier);

-- Auditoria
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## SEÇÃO 8: INTELIGÊNCIA ARTIFICIAL E AUTOMAÇÃO

### 8.1. IA Interna (GPT via Server Actions)

**Módulo 1: Geração Automática de Descrição**
```tsx
/* Server Action: src/actions/ai/generate-description.ts */
export async function generateOpportunityDescription(params: {
  category: string,
  basicInfo: string,
  tone: 'formal' | 'casual' | 'premium'
}): Promise<string> {
  // Chama OpenAI API com prompt estruturado
  // Retorna descrição otimizada
}

// Uso no formulário:
<Button onClick={() => generateOpportunityDescription({...})}>
  ✨ Gerar descrição com IA
</Button>
```

**Módulo 2: Avaliação Automática de Risco**
```tsx
export async function assessDealRisk(opportunityId: UUID): Promise<{
  riskScore: number,  // 0-100
  warnings: string[],
  recommendations: string[]
}> {
  // Analisa dados da oportunidade
  // Compara com histórico
  // Retorna assessment
}
```

**Módulo 3: Classificação Automática de Lead**
```tsx
export async function scoreLead(memberId: UUID): Promise<{
  leadScore: number,    // 0-100
  propensityToBuy: number,
  avgDealSize: number,
  preferredCategories: string[]
}> {
  // Analisa behavior do membro
  // Calcula score de probabilidade
  // Retorna insights
}
```

**Módulo 4: IA Concierge para Pré-Atendimento**
```tsx
export async function aiConciergeResponse(message: string): Promise<string> {
  // Membro Black pergunta algo
  // IA tenta responder (FAQ, dados públicos)
  // Se complexo: escalona para human
}
```

### 8.2. Assistente Proativo

**Notificações Inteligentes (Server-side job):**

```tsx
// Job rodando a cada 1h (Vercel Cron ou externa)
export async function runProactiveAssistant() {
  // Busca membros com:
  // - Oportunidades salvas há 10+ dias sem ação
  // - Matching score alto mas sem abertura do deal
  // - Pedidos pendentes há 15+ dias
  
  // Envia notificação personalizada:
  // "João, encontramos 3 deals que combinam com seu perfil"
  // "Seu pedido de imóvel em SP está quase pronto!"
}
```

---

## SEÇÃO 9: ROADMAP PRIORIZADO

### Fase 1 – Fechar o MVP Premium (Q1 2025)

**Objetivo:** Estabelecer fundação de um clube exclusivo funcional

- [ ] Design System formalizado (tokens, componentes, guias)
- [ ] Dashboard diferenciado por tipo de usuário
- [ ] Matching inteligente básico (regra + IA simples)
- [ ] Área privada de oportunidades (Gold/Black Book)
- [ ] Onboarding com convite + aprovação (refinado)
- [ ] Mobile-first otimizado completo

**Deliverables:**
- Guia de componentes (Storybook ou Figma)
- 3 dashboards funcionales
- Algoritmo de matching testado
- Política RLS para private_opportunities
- App mobile com 95% de funcionalidades

### Fase 2 – Clube Privado Premium (Q2 2025)

**Objetivo:** Virar um clube verdadeiro com tiers e perks reais

- [ ] Planos Silver/Gold/Black operacionais (billing integrado)
- [ ] Concierge avançado com automação (chatbot + human handoff)
- [ ] Deals off-market 100% privado
- [ ] IA Concierge + sugestões automáticas
- [ ] Valuation express integrado (com analistas)
- [ ] Histórico de comportamento / DNA de compra
- [ ] Rate limiting e proteção contra spam

**Deliverables:**
- Stripe/PagSeguro integrado
- Chatbot com OpenAI
- 50+ deals privados curados
- Relatórios de valuation automáticos
- Sistema de scoring de leads

### Fase 3 – Marketplace High Ticket Inteligente (Q3-Q4 2025)

**Objetivo:** Escalar para ser o maior clube de deals privados do Brasil

- [ ] Automação completa de leads (scoring, matching, outreach)
- [ ] Recomendações automáticas baseadas em comportamento
- [ ] Notificações de "matching" em tempo real
- [ ] Módulo de análise de viabilidade completo
- [ ] Deal flow organizado por origem e intermediador
- [ ] Analytics avançadas (para admins e membros Black)
- [ ] Integrações com sistemas externos (Zapier, Make, etc)

**Deliverables:**
- 1000+ membros ativos
- 100+ intermediadores
- 500+ deals em pipeline
- Dashboard com 20+ métricas
- API pública para parceiros

---

## SEÇÃO 10: FUNCIONALIDADES AINDA FALTANDO

### 10.1. Visualização Premium de Oportunidades

**Nova seção: /oportunidades/[id]**

```tsx
// Hero section com fotos em carrossel
<HeroCarousel images={opportunity.images} />

// Info premium
<div className="grid grid-cols-3 gap-6">
  <PriceCard value={opportunity.value} currency="BRL" />
  <LocationCard location={opportunity.location} mapUrl="..." />
  <ConfidentialityBadge level={opportunity.confidentiality} />
</div>

// Timeline de valores (histórico)
<PriceTimeline />

// Documentos e análises
<DocumentSection documents={opportunity.documents} />

// Contato com intermediador
<IntermediadorCard intermediador={opportunity.created_by} />

// Botões de ação por nível
{membership === 'black' && <Button>Solicitar DD</Button>}
{membership === 'gold' && <Button>Solicitar Apresentação</Button>}
{membership === 'silver' && <Button>Upgrade para Ouro</Button>}
```

### 10.2. Rate Limiting

```tsx
// Middleware: src/middleware.ts
export async function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const limit = 100 // requisições por hora
  
  const count = await redis.incr(`rate-limit:${ip}`)
  if (count > limit) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  
  return NextResponse.next()
}
```

### 10.3. Mobile App

- React Native ou Flutter
- Funcionalidades core: listar oportunidades, salvar, compartilhar, chat
- Push notifications
- Biometria para segurança
- Camera para scan de QR codes

---

## SEÇÃO 11: OBSERVAÇÕES TÉCNICAS FINAIS

### Build & Deploy

- `npm run build` deve passar sem warnings
- TypeScript strict mode ativado
- Tests rodam em CI/CD (implementar)
- Vercel configurado com variáveis de ambiente
- Supabase em produção com backups diários

### Escalabilidade

- Database: PostgreSQL escala bem até 1M+ registros (com índices corretos)
- Cache com Redis para queries frequentes (recomendado em Q2)
- CDN para assets estáticos (já configurado via Vercel)
- Rate limiting e DDoS protection via Vercel ou Cloudflare

### Segurança

- RLS obrigatório em todas as tabelas
- Tokens JWT com validade curta (15min)
- Refresh tokens com maior validade (7 dias)
- Audit logs de todas as ações administrativas
- Criptografia de dados sensíveis (contatos, CPF, net worth)

---

**Documento revisado em:** 8 de dezembro de 2025
**Status:** Pronto para implementação

#### 1. `opportunities` (Oportunidades)
- `id`: UUID (chave primária)
- `user_id`: UUID (referência para auth.users) - segurança baseada em usuário
- `title`: Texto (título da oportunidade)
- `category`: Texto (valores permitidos: 'carro', 'imovel', 'empresa', 'item_premium')
- `value`: Numérico (valor da oportunidade)
- `description`: Texto (descrição detalhada)
- `photos`: Array de textos (URLs das fotos armazenadas no Supabase Storage)
- `location`: Texto (localização do item)
- `status`: Texto (valores: 'novo', 'em_negociacao', 'vendido')
- `pipeline_stage`: Texto (valores: 'Novo', 'Interessado', 'Proposta enviada', 'Negociação', 'Finalizado')
- `created_at`: Timestamp com fuso horário

#### 2. `contacts` (Clientes)
- `id`: UUID (chave primária)
- `user_id`: UUID (referência para auth.users)
- `name`: Texto (nome do contato)
- `phone`: Texto (telefone do contato)
- `source`: Texto (origem do contato)
- `interests`: Texto (interesses do contato)
- `status`: Texto (valores: 'novo', 'quente', 'morno', 'frio')
- `created_at`: Timestamp com fuso horário

#### 3. `interactions` (Interações)
- `id`: UUID (chave primária)
- `contact_id`: UUID (referência para contacts, com delete cascade)
- `content`: Texto (descrição da interação)
- `created_at`: Timestamp com fuso horário

#### 4. `tasks` (Tarefas) [NOVO]
- `id`: UUID (chave primária)
- `user_id`: UUID (referência para auth.users)
- `opportunity_id`: UUID (referência para opportunities ou products, flexível)
- `title`: Texto (título da tarefa)
- `description`: Texto (descrição detalhada)
- `status`: Texto (valores: 'novo', 'em_progresso', 'concluida', 'atrasada')
- `priority`: Texto (valores opcionais: 'baixa', 'média', 'alta')
- `due_date`: Timestamp (data de vencimento)
- `created_at`: Timestamp com fuso horário
- `updated_at`: Timestamp com fuso horário

#### 5. `opportunity_logs` (Registro de Atividades) [NOVO]
- `id`: UUID (chave primária)
- `opportunity_id`: UUID (referência para opportunities)
- `user_id`: UUID (referência para auth.users)
- `message`: Texto (descrição da atividade)
- `created_at`: Timestamp com fuso horário

**RLS Policies:**
- Leitura restrita a usuários com role 'adm' (verificado via função `public.is_admin()`)
- Criação de logs permitida para todas operações do sistema
- Função RPC `get_opportunity_logs(p_opportunity_id UUID)` com SECURITY DEFINER para contorno seguro de RLS
 
 #### 6. `profiles` (Perfis) [ATUALIZADO]
 - Campos adicionais: `role` (admin/usuario), `invite_code`, `whatsapp`, `interests`
 - Políticas corrigidas para inserção e leitura segura, com checks de admin.
 
 #### 7. `links` (Links compartilháveis) [NOVO]
 - Tabela criada por `create_links_table.sql` para gerenciamento de links externos.
 
 #### 8. `products` (Produtos) [ATUALIZADO]
 - Campo `currency` adicionado, RLS ajustadas para leitura/associação com tarefas.

#### 9. `invites` (Convites) [NOVO]
- `id`: UUID (chave primária)
- `code`: Texto (código único do convite no formato GZM-XXXXX)
- `created_by`: UUID (usuário que criou o convite)
- `status`: Texto (status do convite: 'unused', 'used')
- `category`: Texto (categoria do convite: 'standard', etc.)
- `max_uses`: Inteiro (número máximo de usos permitidos)
- `times_used`: Inteiro (contador de usos)
- `notes`: Texto (notas adicionais sobre o convite)
- `created_at`: Timestamp (data de criação)
- `used_by`: UUID (usuário que utilizou o convite)
- `used_at`: Timestamp (data de utilização)
- `expires_at`: Timestamp (data de expiração opcional)
- `created_by_profile`: UUID (perfil do criador)
- `invite_type`: Texto (tipo do convite)

#### 10. `pending_members` (Membros Pendentes) [NOVO]
- `id`: UUID (chave primária)
- `invite_code`: Texto (código do convite utilizado)
- `name`: Texto (nome do candidato)
- `phone`: Texto (telefone do candidato)
- `email`: Texto (email do candidato)
- `status`: Texto (status: 'pending', 'approved', 'rejected')
- `extra_info`: JSON (informações adicionais)
- `reviewed_by`: UUID (usuário que revisou)
- `reviewed_at`: Timestamp (data de revisão)
- `rejection_reason`: Texto (motivo da rejeição)
- `applied_at`: Timestamp (data da aplicação)

#### 11. `audit_logs` (Logs de Auditoria) [NOVO]
- `id`: UUID (chave primária)
- `action`: Texto (ação realizada)
- `table_name`: Texto (nome da tabela)
- `record_id`: UUID (ID do registro)
- `old_values`: JSON (valores antigos)
- `new_values`: JSON (novos valores)
- `user_id`: UUID (usuário que realizou a ação)
- `ip_address`: Texto (endereço IP)
- `user_agent`: Texto (user agent)
- `timestamp`: Timestamp (data da ação)

#### 12. `concierge_folders` (Pastas de Concierge) [NOVO]
- `id`: UUID (chave primária)
- `name`: Texto (nome da pasta)
- `description`: Texto (descrição da pasta)
- `position`: Inteiro (ordem de exibição)
- `user_id`: UUID (usuário proprietário)
- `created_at`: Timestamp (data de criação)

#### 13. `concierge_conversations` (Conversas de Concierge) [NOVO]
- `id`: UUID (chave primária)
- `folder_id`: UUID (pasta de origem)
- `title`: Texto (título da conversa)
- `description`: Texto (descrição)
- `status`: Texto (status da conversa)
- `assigned_to`: UUID (usuário atribuído)
- `created_at`: Timestamp (data de criação)
- `updated_at`: Timestamp (data de atualização)

#### 14. `concierge_settings` (Configurações de Concierge) [NOVO]
- `id`: UUID (chave primária)
- `key`: Texto (chave da configuração)
- `value`: Texto (valor da configuração)
- `description`: Texto (descrição)
- `updated_at`: Timestamp (data de atualização)

#### 15. `pedido_requests` (Solicitações de Pedidos) [NOVO]
- `id`: UUID (chave primária)
- `user_id`: UUID (usuário que solicitou)
- `title`: Texto (título do pedido)
- `description`: Texto (descrição do pedido)
- `category`: Texto (categoria do pedido)
- `status`: Texto (status: 'pending', 'in_progress', 'completed', 'rejected')
- `created_at`: Timestamp (data de criação)
- `updated_at`: Timestamp (data de atualização)
- `assigned_to`: UUID (usuário atribuído)
- `response`: Texto (resposta fornecida)

## Segurança e Permissões

O sistema utiliza Row Level Security (RLS) do Supabase para garantir que:

1. Usuários só possam ver, editar ou excluir seus próprios dados
2. Oportunidades podem ser vistas publicamente (importante para listagem)
3. Apenas proprietários podem fazer alterações em seus registros
4. Interações estão vinculadas aos contatos e, por extensão, ao usuário
5. Acesso a imagens é controlado (upload por autenticados, leitura pública)
 6. Verificação assíncrona de admin via API (`/api/auth/check-admin`) e função `public.is_admin()`
 7. RPC com SECURITY DEFINER para leitura administrativa de logs

## Funcionalidades do Sistema

### 1. Autenticação e Autorização
- Login por e-mail/senha via Supabase Auth
- Sessão persistente
- Segurança baseada em RLS para proteger dados de cada usuário
- Registro de novos usuários com validação de código de convite
- Recuperação de senha com tokens temporários
- Sistema de aprovação de novos membros com fluxo administrativo
- Perfis com diferentes níveis de acesso (usuário/admin)
- Armazenamento de informações adicionais nos perfis (interesses, WhatsApp)

### 2. Dashboard
- Visão geral com métricas resumidas:
  - Total de Oportunidades
  - Contatos Ativos
  - Volume em Negociação
  - Volume Total
- Gráficos interativos com Google Charts:
  - Taxa de Conversão por Estágio do Funil
  - Valor Médio por Oportunidade por Categoria
  - Distribuição de Oportunidades por Valor
  - Produtos Mais Vendidos
  - Oportunidades por Categoria (gráfico de pizza)
  - Top 5 produtos mais caros
  - Evolução no Faturamento
  - Pipeline de Vendas
- Seleção de período para análise (7d, 30d, 90d, 365d)
- Tooltips explicativos para todos os gráficos

### 3. Gestão de Oportunidades
- Listagem de oportunidades de negócios
- Cadastro de oportunidades com:
  - Título, categoria, valor
  - Descrição e localização
  - Fotos (armazenadas no Supabase Storage)
  - Status e estágio no pipeline
- Filtros e ordenação
- Integração com WhatsApp para compartilhamento
 - Suporte a links públicos com `links` e políticas adequadas

### 4. Gestão de Clientes
- Cadastro e visualização de clientes
- Classificação por status (quente, morno, frio)
- Histórico de interações
- Cadastro de novos clientes

### 5. Pipeline de Vendas
- Visualização Kanban com os estágios:
  - Novo
  - Interessado
  - Proposta enviada
  - Em Negociação
  - Finalizado
- Drag & drop entre estágios (potencialmente implementado)
- Acompanhamento visual do fluxo de vendas

### 6. Relatórios
- Métricas de desempenho:
  - Total vendido
  - Comissão estimada
  - Itens vendidos vs total
- Análise de desempenho de vendas
- Cálculo de comissões (exemplo com 5%)

### 7. Produtos
- Gestão de catálogo de produtos
- Informações como título, subtítulo, preço, comissão
- Controle de estoque
- Categorização
 - Moeda configurável por produto

### 8. Integrações
- Supabase Storage para imagens
- Integração com WhatsApp para compartilhamento de oportunidades
- Google Charts para visualização de dados
- Supabase Auth para autenticação
 - RPCs e Server Actions para operações seguras
 - Sonner para feedback instantâneo ao usuário
 - Radix UI e Shadcn para acessibilidade e consistência visual
 - React Three Fiber para efeitos visuais diferenciados
 - Resend para envio de emails automatizados
 - Webhooks para integração com Discord/Make e outros serviços
 - @dnd-kit para funcionalidades de arrastar e soltar
 - Navegação responsiva com mobile menu
 - Componentes de sidebar e topbar com animações
 - Design mobile-first com suporte a todos os dispositivos

### 9. Sistema de Tarefas e Timeline (Novo)
- Gestão de tarefas associadas a oportunidades/produtos:
  - Criação, edição e exclusão de tarefas
  - Atribuição de status (novo, em progresso, concluída, atrasada)
  - Rastreamento automático de mudanças de status
- Timeline de atividades (Linha do Tempo):
  - Registro automático de eventos: criação de tarefas, conclusão de tarefas, remoção de tarefas, alterações de status
  - Visibilidade restrita a usuários com role 'adm' (administrador)
  - Tooltips informativos explicando quais atividades são registradas
  - Timestamps com formatação de tempo relativo (minutos, horas, dias)
- Logging centralizado via Server Actions com tratamento de erros robusto
- API endpoint `/api/auth/check-admin` para verificação assíncrona de permissões
 - Associação de tarefas a oportunidades e produtos
 - Filtros por status e ordenação
 - Ações com feedback via toasts

### 10. Sistema de Convites Privados (Novo)
- Geração de códigos de convite exclusivos para acesso premium:
  - Criação de convites com categorias e limites de uso
  - Controle de uso (quantidade de utilizações)
  - Histórico de utilização e status (usado, não usado)
- Página pública de solicitação de convite:
  - Formulário com campos: nome, email, WhatsApp, motivo da solicitação
  - Validação de código de convite
  - Processo de cadastro com informações do candidato
- Aprovação administrativa de candidatos:
  - Painel de administração para revisão de solicitações
  - Aprovação/rejeição com motivos
  - Criação automática de contas para candidatos aprovados
  - Envio automático de emails com credenciais temporárias
- Sistema de auditoria:
  - Registro de todas as operações (criação de convites, solicitações, aprovações)
  - Log de ações administrativas
- Integração com webhook:
  - Notificações para canais externos (Discord, Make, etc.)
  - Integração com serviços de email (Resend)
- Controle de perfis:
  - Armazenamento de código de convite de origem
  - Armazenamento de informações adicionais de interesse
  - Contato de WhatsApp no perfil do usuário

### 11. Sistema de Concierge (Novo)
- Painel administrativo exclusivo para suporte premium:
  - Interface de gerenciamento de conversas e clientes
  - Sistema de pastas organizacionais para categorização
  - Configurações de webhook para integrações externas
  - Atribuição de conversas a perfis de administradores
- Gerenciamento de conversas:
  - Criação e organização de conversas por cliente
  - Histórico de interações
  - Organização por pastas e categorias
- Integrações externas:
  - Configuração de URLs de webhook para notificações
  - Integração com sistemas externos de atendimento
- Acesso restrito:
  - Disponível apenas para usuários com role 'adm'

### 12. Sistema de Solicitação de Pedidos/Produtos (Novo)
- Interface para solicitação de produtos/serviços específicos:
  - Formulário para solicitação de itens não disponíveis na plataforma
  - Sistema de solicitações com status de acompanhamento
  - Painel administrativo para gerenciamento de solicitações
  - Funcionalidades CRUD para gerenciamento de pedidos

### Observações de Build / Deploy (Vercel)

- O projeto roda em Next.js 14 — Vercel executa `npm run build` em cada deploy e precisa das variáveis públicas do Supabase definidas na interface da Vercel.  Configurar **exatamente**: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (valores públicos do projeto supabase) para `Preview` e `Production`.
- Evite comitar `node_modules` e arquivos build (`.next`) — eles foram removidos do histórico do repo e listados no `.gitignore`.
- Teste o build localmente antes do push: `npm run build` — durante desenvolvimento verifique mensagens sobre SSR (ex.: `document is not defined`) que indicam código que toca `window`/`document` no lado do servidor.
 - Verifique clientes Supabase SSR (`@supabase/ssr`) e guards em `src/lib/supabase/client.ts`.
 - Mantenha variáveis de ambiente em Vercel para Preview/Production, com regiões próximas ao Supabase.

## Boas práticas e recomendações (deploy / infra)

- Em ambientes serverless (Vercel) prefira clientes Supabase que funcionem no servidor ou proteja acessos dependentes do DOM (cookies/`localStorage`) com guards — isso evita erros durante a exportação/prerender.
- Mantenha a região das Functions na Vercel próxima ou igual à região do Supabase para reduzir latência entre funções e banco.
- Para arquivos grandes ou binários nativos (p.ex.: `next-swc` em `node_modules`), não mantenha versões binárias no histórico do Git — use `.gitignore` e Git LFS se precisar armazenar arquivos maiores que 100MB.
 - Utilize scripts SQL de diagnóstico para validar políticas RLS em ambientes novos antes do tráfego real.
 - Centralize logs críticos via RPC para auditoria administrativa quando necessário.

## Características Técnicas

### Padrões de Código
- TypeScript para tipagem estática
- Componentes React reutilizáveis
- Uso de Server Components para operações que requerem autenticação
- Client Components para interatividade
- Componentes UI acessíveis via Radix UI e Shadcn
 - Efeitos 3D e shaders customizados quando aplicável
 - Toasts para feedback de usuário em ações sensíveis

### Performance e Escalabilidade
- Uso de Server Actions para operações que requerem autenticação
- Fetch otimizado no servidor para dados protegidos
- Lazy loading potencial nos componentes
- CDN para assets estáticos via Next.js
 - SSR com guards para evitar acesso indevido ao `window`/`document`

### Segurança
- RLS configurado no Supabase para isolamento de dados por usuário
- Autenticação centralizada via Supabase
- Proteção contra acesso não autorizado
- Validação de dados no banco de dados
 - Verificação e logs administrativos com segurança reforçada

### Design e Usabilidade
- Interface responsiva com Tailwind CSS
- Design moderno e limpo
- Componentes acessíveis
- Animações suaves com Framer Motion
- Gráficos interativos com tooltips explicativos
 - Ícones consistentes com Lucide
 - Carrossel e efeitos de hover/customização no `style/`
 - Efeitos 3D com react-three-fiber e three.js
 - Shaders personalizados para backgrounds e efeitos visuais
 - Componentes de UI avançados com @ark-ui/react
 - Carrossel de banners e imagens com efeitos especiais
 - Efeitos de sidebar e menu com animações personalizadas
 - Componentes de upload de avatar com preview
 - Layout responsivo com mobile-first approach
 - Componentes de formulário acessíveis com Radix UI
 - Feedback visual com Sonner para notificações
 - Efeitos hover e interações com Framer Motion

## Recursos Implementados

### Dashboard Avançado
- 8 tipos diferentes de gráficos
- Animações fluidas e transições suaves
- Tooltips explicativos em todos os gráficos
- Seleção dinâmica de período
- Dados em tempo real do banco de dados

### Páginas e Funcionalidades Adicionais
- Página pública de solicitação de convite com formulário completo
- Página de validação de convite com processo de cadastro
- Página de concierge exclusiva para administradores
- Página de solicitação de pedidos/produtos
- Painel administrativo para gerenciamento de convites
- Sistema de aprovação de membros com fluxo completo
- Gerenciamento de perfis com edição de informações
- Sistema de categorias e produtos
- Gerenciamento de links compartilháveis
- Funcionalidades de favoritos
- Sistema de insumos e categorias
- Componentes de upload de imagens com preview
- Modal de criação e edição de oportunidades
- Modal de compartilhamento via WhatsApp
- Sistema de recuperação de senha
- Formulário de registro com validação de convite
- Gerenciamento de tarefas com diferentes status
- Timeline de atividades com logs detalhados

### Gráficos Específicos
1. **Taxa de Conversão por Estágio do Funil**
   - Calcula e exibe a porcentagem de conversão entre estágios
   - Mostra eficiência do processo de vendas

2. **Valor Médio por Oportunidade por Categoria**
   - Calcula médias de valor para cada categoria
   - Ajuda a identificar categorias mais valiosas

3. **Distribuição de Oportunidades por Valor**
   - Agrupa oportunidades em faixas de valor
   - Fornece visão do perfil das negociações

4. **Produtos Mais Vendidos**
   - Conta oportunidades finalizadas por produto
   - Mostra os produtos mais populares

5. **Oportunidades por Categoria** (gráfico de pizza)
   - Distribuição percentual das oportunidades

6. **Top 5 produtos mais caros**
   - Lista os produtos com maiores valores

7. **Evolução no Faturamento**
   - Gráfico de linhas com histórico de vendas

8. **Pipeline de Vendas**
   - Visualização horizontal do funil de vendas

## Arquivos e Configurações

### Variáveis de Ambiente
- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase

### Arquivos Modificados e Criados Recentemente (Sistema de Tarefas)

#### Server Actions (`src/actions/`)
- **`tasks.ts`** (337 linhas) - Operações CRUD para tarefas
  - `getTasks(opportunity_id)` - Buscar tarefas de uma oportunidade/produto
  - `getAllTasks()` - Listar todas as tarefas do usuário ou todas se admin
  - `createTask()` - Criar nova tarefa e registrar no log
  - `updateTask()` - Atualizar dados da tarefa
  - `updateTaskStatus()` - Atualizar status e criar log de conclusão
  - `deleteTask()` - Deletar tarefa e registrar no log
  - `getTasksWithOpportunities()` - Listar tarefas com dados relacionados

- **`logs.ts`** (125 linhas) - Gerenciamento de logs de atividades
  - `createLog(opportunity_id, message)` - Criar registro de atividade
  - `getOpportunityLogs(opportunity_id)` - Buscar logs de uma oportunidade (admin only)
  - `getRecentLogs(limit)` - Buscar logs recentes (admin only)
  - Implementação com RPC fallback para tratamento de RLS

#### Componentes (`src/components/`)
- **`opportunity-timeline.tsx`** (248 linhas) - [NOVO] Linha do tempo de atividades
  - Exibe registro de criação, conclusão e remoção de tarefas
  - Restrito a usuários com role 'adm'
  - Tooltip explicativo com ícone de ajuda
  - Timestamps com formatação relativa (minutos, horas, dias)
  - Ícones diferenciados por tipo de atividade
  - Verificação assíncrona de permissões sem race conditions
    - Integração com Sonner para feedback

- **`task-form.tsx`** - [NOVO] Formulário para criar/editar tarefas
  - Campos: título, descrição, status, prioridade, data de vencimento
  - Validação de dados
  - Integração com Server Actions

- **`task-list.tsx`** - [NOVO] Lista de tarefas
  - Exibição de tarefas por oportunidade
  - Filtros por status
  - Ações: editar, deletar, mudar status

- **`task-status-dropdown.tsx`** - [NOVO] Seletor de status de tarefa
  - Dropdown com opções de status
  - Integração com `updateTaskStatus()`

#### API Routes (`src/app/api/`)
- **`auth/check-admin/route.ts`** (29 linhas) - [NOVO] Endpoint para verificar role
  - GET `/api/auth/check-admin`
  - Retorna `{ isAdmin: boolean }`
  - Consulta role do usuário na tabela `profiles`

#### Migrations SQL (`backend/migrations/`)
- **`rls_admins_only.sql`** - Políticas RLS para logs
  - Policy de leitura: apenas admins podem ler logs
  - Policy de criação: sistema pode criar logs livremente

- **`create_get_logs_function.sql`** - Função RPC para contorno seguro de RLS
  - `get_opportunity_logs(p_opportunity_id UUID)`
  - SECURITY DEFINER para bypass de RLS
  - Retorna logs com nomes de usuários via LEFT JOIN
 - **`allow_tasks_for_products.sql`** - Permite vincular tarefas a produtos
 - **`check_and_populate_logs.sql`** - Rotina para checagem/preenchimento de logs
 - **`verify_logs_and_tasks.sql`** - Verificações de integridade dos logs e tarefas

### Scripts Disponíveis
- `npm run dev` - Iniciar servidor de desenvolvimento
- `npm run build` - Criar build de produção
- `npm run start` - Iniciar servidor de produção
- `npm run lint` - Executar linter
 - (Opcional) `npm run typecheck` - Validar tipos durante CI/CD

## Considerações e Recomendações

### Pontos Fortes
- Arquitetura bem definida com separação clara de responsabilidades
- Segurança implementada com RLS no banco de dados
- Interface moderna e responsiva
- Dashboard completo com múltiplas visualizações
- Integração com serviços externos (Supabase, WhatsApp)
- Tipagem estática com TypeScript
- **[NOVO]** Sistema de tarefas com logging automático de atividades
- **[NOVO]** Timeline administrativo com registro detalhado de operações
- **[NOVO]** Controle de acesso baseado em roles com verificação assíncrona
 - **[NOVO]** Efeitos visuais 3D e shaders customizados
 - **[NOVO]** Feedback consistente com toasts (Sonner)
 - **[NOVO]** Políticas RLS abrangentes com scripts de diagnóstico
 - **[NOVO]** Integração de links compartilháveis e associação de tarefas a produtos
 - **[NOVO]** Sistema completo de convites privados com aprovação administrativa
 - **[NOVO]** Sistema de auditoria e logs detalhados de todas as operações
 - **[NOVO]** Integração com serviços de email (Resend) para comunicações automatizadas
 - **[NOVO]** Sistema de concierge para suporte premium com atribuição de conversas
 - **[NOVO]** Funcionalidade de solicitação de pedidos/produtos com acompanhamento
 - **[NOVO]** Webhooks e integrações com serviços externos (Discord, Make, etc.)
 - **[NOVO]** Sistema completo de aprovação de membros com fluxo de revisão
 - **[NOVO]** Drag and drop e interface avançada com @dnd-kit

### Melhorias Potenciais
- Implementação de testes unitários e de integração para Server Actions
- Adição de funcionalidades de notificação em tempo real para mudanças de tarefas
- Sistema de relatórios mais avançado com exportação de logs de atividades
- Integração com calendário para agendamentos de tarefas
- Funcionalidades de colaboração para equipes (atribuição de tarefas a outros usuários)
- Filtros avançados na timeline (por tipo de atividade, data, usuário)
- Exportação de timeline como PDF/CSV para auditoria
- Sistema de permissões mais granular além de admin/não-admin
 - Monitoramento de performance dos shaders e fallback para dispositivos mais simples
 - CI/CD com typecheck e validações de build em PRs

### Escalabilidade
- O sistema está bem estruturado para escalar horizontalmente
- Uso de Supabase facilita o gerenciamento de banco de dados
- Componentes modulares permitem adição de novas funcionalidades
 - Scripts e migrations organizados agilizam evolução de schema e políticas

---

## CONCLUSÃO: GEREZIM COMO CLUBE PRIVADO DE ELITE

### Status Atual

O GEREZIM possui uma **fundação técnica excelente** com:
- ✅ Autenticação e RLS robustos
- ✅ Sistema de convites com aprovação
- ✅ Dashboard com 8 tipos de gráficos
- ✅ Concierge básico operacional
- ✅ Tarefas e timeline com auditoria
- ✅ Stack moderno (Next.js, TypeScript, Tailwind, Supabase)
- ✅ Deploy em Vercel com CI/CD

### O que Falta Para Ser um Clube Verdadeiro

Porém, o projeto ainda **não possui a identidade estratégica** de um clube exclusivo:

1. **Sem diferenciação clara de tiers** → Não há "Silver", "Gold", "Black" com perks reais
2. **Sem matching inteligente** → Recomendações são genéricas, não personalizadas
3. **Sem módulo de valuation** → Não há análise de viabilidade de deals
4. **Sem "Black Book"** → Não há oportunidades 100% privadas/confidenciais
5. **Sem DNA de compra** → Não há histórico de comportamento do membro
6. **Design system inconsistente** → Componentes funcionam mas não escaláveis visualmente
7. **Sem IA** → Tudo manual, sem automação inteligente

### Impacto da Implementação Sugerida

Aplicando as melhorias propostas neste documento:

**Curto Prazo (Q1 2025):**
- Plataforma com identidade visual coerente (design system)
- 3 dashboards diferenciados por nível (Silver/Gold/Black)
- Algoritmo básico de matching (aumenta conversão em 30%)
- Documentação clara para onboarding (reduz tempo de adoção)

**Médio Prazo (Q2 2025):**
- Tiers operacionais com billing (receita recorrente)
- Concierge com IA para pré-atendimento (reduz carga de work)
- Deals privados com RLS separada (diferencia Gold vs Black)
- Valuation express integrado (agrega valor para Black)
- Histórico de comportamento (recomendações +50% melhores)

**Longo Prazo (Q3-Q4 2025):**
- Matching automático em tempo real (notificações push)
- Deal origination para Black (intermediadores procuram para você)
- Analytics avançadas (visibilidade total de negócios)
- 1000+ membros ativos + 100+ intermediadores
- Maior club de deals privados do Brasil

### Recomendação Final

O GEREZIM **não precisa ser reescrito** — está bem arquitetado. Mas precisa:

1. **Incorporar estratégia em cada layer** (não apenas funcionalidades)
2. **Implementar diferenciação clara de tiers** (faz sentido o membro pagar mais)
3. **Adicionar inteligência** (matching, valuation, scoring)
4. **Formalizar design e UX** (para escalar com qualidade)
5. **Automatizar o máximo possível** (reduzir trabalho manual)

Com isso, passa de ser um "sistema de gerenciamento de deals" para ser um **"Clube Privado Digital de Elite"** — e aí sim pode cobrar premium.

### Próximos Passos

1. **Semana 1:** Apresentar este documento ao time
2. **Semana 2-3:** Design system (tokens + componentes)
3. **Semana 4:** Dashboards por tier
4. **Semana 5:** Matching inteligente basic
5. **Semana 6:** Testes, refinamento, deploy

**Estimativa:** 6-8 semanas para transformar em clube verdadeiro.

---

**Documento revisado em:** 8 de dezembro de 2025
**Status:** Pronto para implementação