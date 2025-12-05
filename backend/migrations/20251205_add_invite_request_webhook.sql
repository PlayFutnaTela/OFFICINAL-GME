-- ============================================================================
-- Inserir configuração de webhook para solicitações de convite
-- Data: 2025-12-05
-- ============================================================================

INSERT INTO public.webhook_configurations (event_type, webhook_url, active)
VALUES ('invite_request', 'https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/solicitacao-convite', true)
ON CONFLICT (event_type) DO NOTHING;

-- Verificação
SELECT * FROM public.webhook_configurations WHERE event_type IN ('user_registered_with_invite', 'invite_request');

-- ============================================================================
-- FIM
-- ============================================================================
