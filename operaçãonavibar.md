Operação: navibar mobile — Plano de ação completo

Objetivo
--------
Criar uma NavBar mobile fixa no rodapé com 5 opções: Dashboard, Favoritos, Oportunidades (botão central elevado com logo do projeto), Perfil e Concierge GME. O visual deve seguir a paleta do projeto (fundo azul/navy, ícones dourados), o botão central tem dimensão maior (72px) e ícone interno com ~52px, bordas levemente arredondadas e animação de elevação na opção ativa.

Wireframe / especificações visuais
---------------------------------
- Paleta: use `navy` (ex.: `navy.500` / `navy.600`) como fundo. Ícones na cor `gold.500` (ou `gold.300` para hover). Estas cores já existem em `frontend/tailwind.config.ts`.
- Formato e tamanho:
  - Barra: altura total 72px (quando aberta / inativa), ocupando 100% largura, fixa no rodapé.
  - Painel de itens: 5 slots, cada ~74px de largura (encaixe visual uniforme).
  - Botão central: 72px de diâmetro, círculo com leve ‘lift’ (elevation); icon-size interno ~24–52px (visual: o ícone/logo ocupa maior parte do botão). O botão deve ficar levemente deslocado pra cima (−10 a −14px) para dar ênfase.
  - Ícone e label: tamanhos de ícones menores 24px, labels em 12px quando visíveis.
- Estados:
  - Inativo: ícones dourados com 60–80% de opacidade sobre fundo navy.
  - Hover/Active: ícone dourado (`gold.500`) com glow leve / borda dourada 1-2px no item ativo.
  - Botão central: leve elevação com transformação translateY(−6px) e box-shadow mais forte quando ativo.
  - Transições suaves (200–300ms ease) para cor e transform.

Acessibilidade (a11y)
---------------------
- Cada item com label `aria-label` e role `button`/`link` conforme o caso.
- Foco por teclado: anel visível (outline) com contraste suficiente (usar `ring` classe do Tailwind configurada no projeto).
- Tamanhos clicáveis >= 44x44px (diretriz Apple) — já cobertas pelas dimensões acima.

Arquivos alvos e estratégia de alteração
---------------------------------------
1. Localizar o componente atualmente responsável pelo layout mobile e/ou sidebar — pontos prováveis:
   - `frontend/src/app/concierge/components/chat-area.tsx`
   - `frontend/src/components/sidebar.tsx` ou `frontend/src/components/topbar.tsx`
   - `frontend/src/components/*-nav*` (buscar `nav`, `navbar`, `mobile`)
2. Criar um novo componente focado para a nav mobile: `frontend/src/components/mobile-nav/` com:
   - `index.tsx` (component)
   - `mobile-nav.module.css` ou uso de Tailwind classes (preferência: Tailwind — já presente no projeto)
   - testes: `mobile-nav.test.tsx`
3. Não modificaremos o layout desktop — o novo componente aparecerá apenas via breakpoint (Tailwind `sm`/`md`/`lg`) ou pela detecção atual já implementada para mobile.

Implementação técnica (passo-a-passo)
-------------------------------------
1. Design & assets
   - Extrair/confirmar a logo do projeto (substituir o `+` do botão central com logo). Onde estiver o SVG do logo, garantir um SVG otimizado (em `public/` ou `src/components/icons`).
   - Confirmar tokens de cor `navy` e `gold` no `tailwind.config.ts` (já presentes) — usar `bg-navy-500`, `text-gold-500`, `hover:text-gold-300` etc.
2. Componentização
   - Criar `frontend/src/components/mobile-nav/index.tsx`.
   - Expor props úteis: `active?: 'dashboard' | 'favoritos' | 'oportunidades' | 'perfil' | 'concierge'`, `onNavigate: (key) => void`.
3. Markup e Tailwind classes (exemplo base)
   - Container fixo no bottom: `fixed bottom-4 left-0 right-0 px-4 flex justify-center pointer-events-none z-[100]`
   - Barra: `pointer-events-auto w-full max-w-[720px] bg-navy-600/95 backdrop-blur-sm rounded-[14px] h-[72px] flex items-center justify-between px-4 shadow-xl`
   - Slot dos itens: `w-[74px] flex flex-col items-center justify-center gap-1` — ícone `w-6 h-6` (24px) e label `text-[12px]`.
   - Botão central (elevado): `relative -top-4 h-[72px] w-[72px] rounded-full bg-navy-500 flex items-center justify-center shadow-2xl transform transition-all duration-200 ease-out` e quando ativo `-translate-y-2` + `shadow-[0_10px_20px_rgba(0,0,0,0.25)]`.
4. Iconography & logo
   - Colocar logo SVG no centro: `w-[52px] h-[52px]` (ou `w-[56px]` dependendo do visual) — usar `fill: currentColor` e `text-gold-500`.
5. Animações
   - On click / active: `active` trigger com `translateY(-6px)` e `scale(1.02)` leve. Hover no ícone muda cor `text-gold-300` e aumenta `filter: drop-shadow(0 6px 12px rgba(183,144,46,0.12))`.
6. Responsividade
   - Render somente em mobile: `hidden md:flex` (ou condição de user-agent / state detector já usado no projeto). Se o app usa uma detecção JS, integrar com o mesmo hook/context para manter consistência.
7. Acessibilidade & keyboard
   - `role="navigation" aria-label="Mobile primary navigation"`
   - Each item: keyboard focus visible (`focus:outline-none focus:ring-2 focus:ring-gold-300`)
8. Tests
   - Unit tests com `@testing-library/react` para: renderização, active item state, click navigation, keyboard accessibility.
   - Visual checks: snapshots e a11y (axe-core) se já existir pipeline.
9. QA checklist & cross-device
   - Testar em iPhone SE / iPhone 12 / Android Pixel em estilos e escala.
   - Testar no modo horizontal.
   - Testar no canto seguro (iOS notch / home indicator) com CSS safe-area-inset.

Deploy & roll-out
-----------------
- Branch: `feat/mobile-navbar` com commits atômicos (design -> implementation -> styles -> tests -> docs).
- PR: template com imagens de antes/depois, descrição técnica, e checklist de QA.
- Merging: após aprovação, canary deploy se possível (ou deploy normal). Monitorar analytics de event `mobile_nav_interaction` nos primeiros 48h.

Checklist de revisão (PR)
-------------------------
- [ ] Cores e dimensões batem com o guia visual (72px / 74px slots / icon sizes)
- [ ] Logo central substitui o `+` e está otimizada (SVG de alta qualidade)
- [ ] Responsividade e breakpoints OK (esconder em >= md)
- [ ] Keyboard navigation e ARIA labels OK
- [ ] Tests automatizados passando
- [ ] Visual regression (snapshots) aprovadas
- [ ] Documentação atualizada (README ou changelog de UI)

Notas finais e considerações
----------------------------
- Use Tailwind (já é o padrão do projeto) — evita CSS duplicado.
- Preferir SVGs inline para ícones para possibilitar `currentColor` e fácil recoloração.
- Considere sessões A/B para testar o efeito do botão central nas métricas de conversão (cliques em oportunidades) antes de um deploy amplo.

Tempo estimado (coarse)
------------------------
- Design / assets: 1–2 horas
- Implementação: 3–5 horas
- Tests + QA: 2–4 horas
- PR + deploy: 1–2 horas

---
Arquivo gerado automaticamente pelo plano solicitado — siga os passos em ordem e com checkpoints curtos para reduzir risco.
