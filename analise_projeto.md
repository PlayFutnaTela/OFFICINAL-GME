# Análise Detalhada da Plataforma de Intermediação de Negócios (GEREZIM)

## Visão Geral do Projeto

O sistema GEREZIM é um MVP (Produto Mínimo Viável) de uma plataforma completa para gestão de oportunidades de negócios, **clientes**, pipeline de vendas, sistema de convites privados, assistente concierge e solicitações de produtos/serviços. O sistema permite o gerenciamento de oportunidades de negócios em diferentes categorias (carros, imóveis, empresas e itens premium), gestão de clientes (leads), visualização do pipeline de vendas em formato Kanban, sistema de convites privados exclusivos com aprovação administrativa e funcionalidades de concierge para suporte personalizado.

## Arquitetura e Tecnologias Utilizadas

### Frontend
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

## Banco de Dados

### Tabelas Principais

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

## Conclusão

O sistema GEREZIM é um MVP bem estruturado e funcional que atende às necessidades avançadas de uma plataforma de intermediação de negócios. Com um dashboard completo e gráficos interativos, sistema de convites privados exclusivos, assistente concierge e funcionalidades de solicitação de pedidos, o sistema oferece insights valiosos sobre o desempenho de vendas e uma experiência premium para usuários selecionados. A arquitetura baseada em Next.js e Supabase fornece uma base sólida para extensões e melhorias futuras.

 Com as melhorias recentes — tarefas com logging, timeline administrativa, sistema de convites com aprovação, concierge para suporte premium, RPC segura, RLS robusta, efeitos visuais e feedback instantâneo — o projeto está pronto para evoluir com confiabilidade e uma experiência de usuário superior em todos os aspectos do negócio.