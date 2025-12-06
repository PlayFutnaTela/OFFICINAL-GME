-- ============================================================================
-- Criação da Tabela: invite_requests
-- Data: 2025-12-05
-- Descrição: Armazena solicitações de convites feitas por usuários
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invite_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  motivo TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_whatsapp CHECK (whatsapp ~ '^\d{10,}$'),
  CONSTRAINT valid_nome CHECK (nome != ''),
  CONSTRAINT valid_motivo CHECK (motivo != '')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invite_requests_status ON public.invite_requests(status);
CREATE INDEX IF NOT EXISTS idx_invite_requests_created_at ON public.invite_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invite_requests_email ON public.invite_requests(email);

-- RLS (Row Level Security)
ALTER TABLE public.invite_requests ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir solicitações
CREATE POLICY "Anyone can create invite requests"
ON public.invite_requests
FOR INSERT
WITH CHECK (true);

-- Apenas admins podem ver, atualizar e deletar
CREATE POLICY "Admins can manage invite requests"
ON public.invite_requests
FOR SELECT
USING ( public.is_admin(auth.uid()) );

CREATE POLICY "Admins can update invite requests"
ON public.invite_requests
FOR UPDATE
USING ( public.is_admin(auth.uid()) )
WITH CHECK ( public.is_admin(auth.uid()) );

CREATE POLICY "Admins can delete invite requests"
ON public.invite_requests
FOR DELETE
USING ( public.is_admin(auth.uid()) );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT * FROM public.invite_requests LIMIT 1;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
