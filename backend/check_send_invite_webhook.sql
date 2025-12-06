-- ============================================================================
-- Verificar URL do webhook de envio de convite
-- ============================================================================

SELECT 
  id,
  event_type,
  webhook_url,
  active,
  created_at,
  updated_at
FROM public.webhook_configurations
WHERE event_type = 'send_invite_to_client';

-- ============================================================================
