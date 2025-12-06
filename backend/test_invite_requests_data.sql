-- ============================================================================
-- Teste: Listar todos os dados da tabela invite_requests
-- Execute isto para ver TODOS os dados (sem restrições de RLS)
-- ============================================================================

-- Como você é admin, execute como service role para ver todos os dados
SELECT 
  id,
  nome,
  email,
  whatsapp,
  motivo,
  status,
  created_at,
  reviewed_by,
  reviewed_at
FROM public.invite_requests
ORDER BY created_at DESC;

-- Contar por status
SELECT 
  status,
  COUNT(*) as quantidade
FROM public.invite_requests
GROUP BY status
ORDER BY status;

-- Mostrar apenas os que estão pendentes
SELECT 
  id,
  nome,
  email,
  whatsapp,
  motivo,
  status,
  created_at
FROM public.invite_requests
WHERE status = 'pending'
ORDER BY created_at DESC;
