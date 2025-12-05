-- ============================================================================
-- Criação da Tabela: webhook_configurations
-- Data: 2025-12-05
-- Descrição: Armazena URLs de webhooks por tipo de evento
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.webhook_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL UNIQUE, -- 'user_registered_with_invite', 'invite_used', etc
  webhook_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_event_type CHECK (event_type != ''),
  CONSTRAINT valid_url CHECK (webhook_url LIKE 'http%')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_config_event_type ON public.webhook_configurations(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_config_active ON public.webhook_configurations(active);

-- RLS (Row Level Security)
ALTER TABLE public.webhook_configurations ENABLE ROW LEVEL SECURITY;

-- Somente admins podem gerenciar webhooks
CREATE POLICY "Admins can manage webhook configurations"
ON public.webhook_configurations
FOR ALL
USING ( public.is_admin(auth.uid()) )
WITH CHECK ( public.is_admin(auth.uid()) );

-- Inserir configuração padrão para convites
INSERT INTO public.webhook_configurations (event_type, webhook_url, active)
VALUES ('user_registered_with_invite', 'https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/convitegerezim', true)
ON CONFLICT (event_type) DO NOTHING;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT * FROM public.webhook_configurations;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
