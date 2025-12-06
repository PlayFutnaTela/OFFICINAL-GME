-- ============================================================================
-- SQL: Verificar dados de teste
-- Após clicar em "Aprovar" no modal e enviar convite, verifique:
-- ============================================================================

-- 1. Ver os convites marcados como enviados
SELECT 
  code,
  status,
  notes,
  created_at,
  updated_at
FROM public.invites
WHERE status = 'used' AND notes LIKE '%Enviado para%'
ORDER BY updated_at DESC;

-- 2. Ver as solicitações aprovadas (sem data de revisão ainda - será preenchida quando aprovar no modal)
SELECT 
  id,
  nome,
  email,
  status,
  reviewed_at,
  created_at
FROM public.invite_requests
WHERE status IN ('approved', 'rejected')
ORDER BY created_at DESC;

-- 3. Contar convites disponíveis
SELECT COUNT(*) as convites_disponiveis
FROM public.invites
WHERE status = 'unused' AND notes IS NULL;

-- ============================================================================
-- Notas de Implementação:
-- ============================================================================
-- 
-- ✅ Novo arquivo criado: src/actions/send-invite.ts
--    - getAvailableInvites() → busca convites com status='unused' e notes=NULL
--    - getSendInviteWebhookUrl() → busca URL do webhook em webhook_configurations
--    - updateSendInviteWebhookUrl() → atualiza URL do webhook no banco
--    - sendInviteToClient() → dispara webhook com payload
--    - markInviteAsSent() → marca convite como usado após envio
--
-- ✅ Novo componente criado: src/components/send-invite-modal.tsx
--    - Modal com campos pré-preenchidos (Nome, WhatsApp)
--    - Dropdown com convites disponíveis
--    - Botão "Enviar Convite" que dispara webhook
--    - Pop-up de sucesso/erro
--
-- ✅ Atualizado: src/app/(dashboard)/admin/convites/page.tsx
--    - Importado SendInviteModal e funções de envio
--    - Adicionado estado para controlar modal
--    - Handlers: handleOpenSendInviteModal, handleCloseSendInviteModal, etc.
--    - Seção "Envio de Convite ao Cliente" em webhook
--    - Tabela de solicitações agora abre modal ao clicar "Aprovar"
--
-- ✅ Webhook configurado em webhook_configurations:
--    - event_type: 'send_invite_to_client'
--    - URL: https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/enviar-convite
--
-- ============================================================================
-- FLUXO DE USO:
-- ============================================================================
-- 
-- 1. Admin vai para /admin/convites → aba "Pendentes"
-- 2. Clica em "Aprovar" na linha de uma solicitação
-- 3. Modal abre com:
--    - Nome: Teste de Planilha (pré-preenchido)
--    - WhatsApp: 5511978665701 (pré-preenchido)
--    - Convite: dropdown com convites disponíveis
-- 4. Seleciona um convite
-- 5. Clica em "Enviar Convite"
-- 6. Webhook é disparado com os dados
-- 7. Pop-up exibe sucesso ou erro
-- 8. Convite é marcado como "used" com nota "Enviado para 5511978665701"
-- 9. Lista de solicitações é recarregada
--
-- ============================================================================
