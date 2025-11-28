# Guia de Deploy e Performance na Vercellll

Este documento detalha os requisitos para corrigir erros de deploy e garantir alta performance do projeto Gerezim na Vercel.

## 1. Por que o Deploy Falha? (Erros Comuns)

A Vercel executa o comando `npm run build` antes de colocar o site no ar. Se este comando falhar, o deploy é cancelado.

### Principais Causas:
*   **Erros de TypeScript:** O Next.js é rigoroso. Qualquer erro de tipagem (ex: variáveis `any` implícitas, propriedades inexistentes) impedirá o build.
    *   *Solução:* Rode `npm run build` localmente e corrija **todos** os erros antes de subir.
*   **Erros de ESLint:** Avisos de linting podem ser tratados como erros na Vercel.
    *   *Solução:* Verifique se não há variáveis não utilizadas ou imports quebrados.
*   **Variáveis de Ambiente Ausentes:** O build falha se tentar acessar uma variável (como `NEXT_PUBLIC_SUPABASE_URL`) que não foi configurada no painel da Vercel.

---

## 2. Requisitos para Alta Performance

Para que o site carregue instantaneamente na Vercel, você precisa alinhar a arquitetura do Next.js com a infraestrutura Serverless da Vercel.

### A. Otimização de Imagens (Crítico)
A Vercel cobra por otimização de imagem, mas é essencial para velocidade.
*   **Obrigatório:** Usar o componente `<Image />` do `next/image` em vez de `<img>`.
*   **Configuração:** Adicione o domínio do Supabase no `next.config.js`:
    ```javascript
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'seu-projeto.supabase.co',
        },
      ],
    },
    ```

### B. Conexão com Banco de Dados (Supabase)
Em ambiente Serverless (Vercel), funções são criadas e destruídas rapidamente. Se cada função abrir uma conexão direta com o banco, você atingirá o limite de conexões do Postgres rapidamente e o site cairá.
*   **Solução:** Use o **Connection Pooler** do Supabase (PgBouncer).
*   **Como:** Na string de conexão do banco (`DATABASE_URL` na Vercel), use a porta **6543** (Transaction Mode) em vez da 5432.

### C. Região do Servidor (Latência)
*   **Regra de Ouro:** A região da sua Function na Vercel deve ser a mesma (ou muito próxima) da região do seu banco Supabase.
*   *Exemplo:* Se o Supabase está em `sa-east-1` (São Paulo), configure seu projeto na Vercel para rodar em `sa-east-1`. Se estiverem em continentes diferentes, cada requisição terá um atraso de ~200ms.

### D. Estratégia de Renderização
*   **Evite `use client` desnecessário:** Componentes de cliente não são renderizados no servidor (SSR) da mesma forma eficiente. Mantenha o máximo de lógica possível no servidor (Server Components).
*   **Suspense e Streaming:** Não bloqueie a página inteira esperando dados. Use `Suspense` para mostrar o esqueleto da página enquanto partes mais lentas carregam.

## Checklist para Deploy de Sucesso

1.  [ ] Rodar `npm run build` localmente e garantir que passa com **sucesso**.
2.  [ ] Configurar todas as variáveis do `.env.local` nas configurações do projeto na Vercel.
3.  [ ] Verificar se `next.config.js` permite imagens do domínio do Supabase.
4.  [ ] Ajustar a `DATABASE_URL` para usar a porta 6543 (Pooler).
