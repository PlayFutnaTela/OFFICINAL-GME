# Análise Detalhada da Plataforma de Intermediação de Negócios (GEREZIM)

## Visão Geral do Projeto

O sistema GEREZIM é um MVP (Produto Mínimo Viável) de uma plataforma para gestão de oportunidades de negócios, contatos e pipeline de vendas. O sistema permite o gerenciamento de oportunidades de negócios em diferentes categorias (carros, imóveis, empresas e itens premium), gestão de contatos com leads e clientes, e visualização do pipeline de vendas em formato Kanban.

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

### Backend
- **Backend as a Service**: Supabase (Autenticação, Banco de Dados, Armazenamento)
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage para imagens

### Infraestrutura
- **Frontend**: Next.js App Router com Server Actions para operações que requerem autenticação
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estilo**: Tailwind CSS com componentes acessíveis

### Ferramentas / Bibliotecas adicionais (adicionadas / utilizadas recentemente)
- **react-three-fiber / three.js** — usado para efeitos gráficos 3D e planos com shaders (ex.: `style/shader1.tsx`, `style/shader-bg.tsx`).
- **ShaderMaterials personalizados** — componentes que usam GLSL (vertex/fragment shaders) para efeitos visuais avançados.
- **Sonner** — biblioteca usada para os toasts informativos (ex.: `src/components/ui/sonner.tsx`).
- **Framer Motion** — animações e transições (diversos componentes UI como `style/appmenu.tsx`, `style/efeito-sidebar.tsx` e outros).  
- **@supabase/ssr / createBrowserClient** — utilização do cliente Supabase para browser/SSR (com atenção para uso em server-side - ver observações de build).

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Frontend (`/frontend`)
- `src/app/` - Páginas e layouts do Next.js App Router
- `src/components/` - Componentes reutilizáveis
- `src/lib/supabase/` - Configuração e clientes do Supabase
- `src/components/ui/` - Componentes de UI do shadcn

### Backend (`/backend`)
- `schema.sql` - Script de criação do banco de dados com RLS (Row Level Security)
- `seed.sql` - Dados de exemplo para testes
- `migrations/` - Pasta para futuras migrações de banco

## Atualizações e correções recentes (resumo técnico)

- Repositório limpo e enviado ao GitHub (remoção de `node_modules` do histórico, criação de `.gitignore` adequada). Importante: arquivos grandes (ex.: binários do SWC) impossibilitavam push — histórico reescrito e push forçado para `https://github.com/PlayFutnaTela/OFFICINAL-GME.git`.
- Hooks e clientes Supabase corrigidos para serem seguros durante builds/SSR — adicionada verificação para `document` antes de acessar cookies no cliente (arquivo: `src/lib/supabase/client.ts`).
- Adicionado `src/app/not-found.tsx` para corrigir falhas no export/static generation que ocorriam em builds na Vercel.
- Correções de tipagem e compatibilidade TypeScript em vários componentes para passar as checagens de tipo durante `next build` (ex.: `src/components/auth-monitor.tsx`, `src/components/ui/avatar.tsx`, `src/components/opportunities-store.tsx`, `src/components/product-list.tsx`).
- Ajustes em componentes com Framer Motion para respeitar tipos e evitar erros de compilação (`style/appmenu.tsx`, `style/efeito-sidebar.tsx`).
- Integração com shaders (react-three) tipada via `args` para o `shaderMaterial` (ex.: `style/shader1.tsx`) evitando erros de tipos durante build.

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

#### 2. `contacts` (Contatos)
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

## Segurança e Permissões

O sistema utiliza Row Level Security (RLS) do Supabase para garantir que:

1. Usuários só possam ver, editar ou excluir seus próprios dados
2. Oportunidades podem ser vistas publicamente (importante para listagem)
3. Apenas proprietários podem fazer alterações em seus registros
4. Interações estão vinculadas aos contatos e, por extensão, ao usuário
5. Acesso a imagens é controlado (upload por autenticados, leitura pública)

## Funcionalidades do Sistema

### 1. Autenticação e Autorização
- Login por e-mail/senha via Supabase Auth
- Sessão persistente
- Segurança baseada em RLS para proteger dados de cada usuário

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

### 4. Gestão de Contatos
- Cadastro e visualização de contatos
- Classificação por status (quente, morno, frio)
- Histórico de interações
- Cadastro de novos contatos

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

### 8. Integrações
- Supabase Storage para imagens
- Integração com WhatsApp para compartilhamento de oportunidades
- Google Charts para visualização de dados
- Supabase Auth para autenticação

### Observações de Build / Deploy (Vercel)

- O projeto roda em Next.js 14 — Vercel executa `npm run build` em cada deploy e precisa das variáveis públicas do Supabase definidas na interface da Vercel.  Configurar **exatamente**: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (valores públicos do projeto supabase) para `Preview` e `Production`.
- Evite comitar `node_modules` e arquivos build (`.next`) — eles foram removidos do histórico do repo e listados no `.gitignore`.
- Teste o build localmente antes do push: `npm run build` — durante desenvolvimento verifique mensagens sobre SSR (ex.: `document is not defined`) que indicam código que toca `window`/`document` no lado do servidor.

## Boas práticas e recomendações (deploy / infra)

- Em ambientes serverless (Vercel) prefira clientes Supabase que funcionem no servidor ou proteja acessos dependentes do DOM (cookies/`localStorage`) com guards — isso evita erros durante a exportação/prerender.
- Mantenha a região das Functions na Vercel próxima ou igual à região do Supabase para reduzir latência entre funções e banco.
- Para arquivos grandes ou binários nativos (p.ex.: `next-swc` em `node_modules`), não mantenha versões binárias no histórico do Git — use `.gitignore` e Git LFS se precisar armazenar arquivos maiores que 100MB.

## Características Técnicas

### Padrões de Código
- TypeScript para tipagem estática
- Componentes React reutilizáveis
- Uso de Server Components para operações que requerem autenticação
- Client Components para interatividade
- Componentes UI acessíveis via Radix UI e Shadcn

### Performance e Escalabilidade
- Uso de Server Actions para operações que requerem autenticação
- Fetch otimizado no servidor para dados protegidos
- Lazy loading potencial nos componentes
- CDN para assets estáticos via Next.js

### Segurança
- RLS configurado no Supabase para isolamento de dados por usuário
- Autenticação centralizada via Supabase
- Proteção contra acesso não autorizado
- Validação de dados no banco de dados

### Design e Usabilidade
- Interface responsiva com Tailwind CSS
- Design moderno e limpo
- Componentes acessíveis
- Animações suaves com Framer Motion
- Gráficos interativos com tooltips explicativos

## Recursos Implementados

### Dashboard Avançado
- 8 tipos diferentes de gráficos
- Animações fluidas e transições suaves
- Tooltips explicativos em todos os gráficos
- Seleção dinâmica de período
- Dados em tempo real do banco de dados

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

### Scripts Disponíveis
- `npm run dev` - Iniciar servidor de desenvolvimento
- `npm run build` - Criar build de produção
- `npm run start` - Iniciar servidor de produção
- `npm run lint` - Executar linter

## Considerações e Recomendações

### Pontos Fortes
- Arquitetura bem definida com separação clara de responsabilidades
- Segurança implementada com RLS no banco de dados
- Interface moderna e responsiva
- Dashboard completo com múltiplas visualizações
- Integração com serviços externos (Supabase, WhatsApp)
- Tipagem estática com TypeScript

### Melhorias Potenciais
- Implementação de testes unitários e de integração
- Adição de funcionalidades de notificação
- Sistema de relatórios mais avançado com exportação
- Integração com calendário para agendamentos
- Funcionalidades de colaboração para equipes
- Sistema de permissões mais granular
- Histórico de alterações detalhado

### Escalabilidade
- O sistema está bem estruturado para escalar horizontalmente
- Uso de Supabase facilita o gerenciamento de banco de dados
- Componentes modulares permitem adição de novas funcionalidades

## Conclusão

O sistema GEREZIM é um MVP bem estruturado e funcional que atende às necessidades básicas de uma plataforma de intermediação de negócios. Com um dashboard completo e gráficos interativos, o sistema oferece insights valiosos sobre o desempenho de vendas. A arquitetura baseada em Next.js e Supabase fornece uma base sólida para extensões e melhorias futuras.