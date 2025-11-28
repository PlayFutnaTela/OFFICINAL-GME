# Análise de Performance e Lentidão

## Diagnóstico Atual
Identificamos 3 gargalos críticos que estão impactando severamente a performance da aplicação:

### 1. Bloqueio no Carregamento Inicial (Layout Blocking)
**Onde:** `src/app/layout.tsx`
**Problema:** O layout raiz aguarda a verificação de sessão do Supabase (`await supabase.auth.getSession()`) antes de renderizar qualquer HTML.
**Impacto:** O usuário vê uma tela branca (TTFB alto) até que a conexão com o banco de dados seja estabelecida e retornada. Isso bloqueia a [remove]aa[remove] renderização de toda a aplicação...

### 2. Consultas Sequenciais (Waterfall Request)
**Onde:** `src/app/oportunidades/page.tsx`
**Problema:** O código executa chamadas ao banco de dados em fila:
1.  Busca Perfil do Usuário (`await`)
2.  **SÓ DEPOIS** busca Produtos (`await`)
**Impacto:** O tempo de carregamento é a soma das duas requisições (`Tempo A + Tempo B`), quando deveria ser apenas o tempo da mais lenta (`Max(Tempo A, Tempo B)`).

### 3. Imagens Não Otimizadas
**Onde:** Diversos componentes (`opportunities-store.tsx`, `image-hero-carousel.tsx`)
**Problema:** Uso da tag HTML padrão `<img>` em vez do componente nativo do Next.js `<Image />`.
**Impacto:** O navegador baixa imagens em resolução total (ex: 4MB) para exibir em cards pequenos, consumindo muita banda e processamento, especialmente em dispositivos móveis.

---

## Solução Recomendada (Segura e Eficiente)

### Passo 1: Paralelismo de Dados (Prioridade Alta)
Refatorar `src/app/oportunidades/page.tsx` para usar `Promise.all`.
**Como:** Iniciar as requisições de `userProfile` e `products` simultaneamente.
**Resultado:** Redução imediata no tempo de carregamento da página principal.

### Passo 2: Otimização de Imagens (Prioridade Média)
Substituir as tags `<img>` pelo componente `<Image />` do `next/image`.
**Como:**
*   Configurar domínios permitidos no `next.config.js` (Supabase Storage).
*   Substituir tags e adicionar propriedades `width`, `height` e `sizes`.
**Resultado:** Carregamento visual muito mais rápido e menor consumo de dados.

### Passo 3: Estratégia de Carregamento de Auth (Prioridade Alta/Complexa)
Remover o bloqueio do `layout.tsx` para permitir que o HTML inicial seja enviado imediatamente.
**Como:**
1.  Mover a verificação de sessão para um componente cliente ou usar `Suspense`.
2.  Permitir que a UI carregue em estado de "carregando" (skeleton) enquanto a autenticação resolve em segundo plano.
**Resultado:** Sensação de carregamento instantâneo para o usuário.
