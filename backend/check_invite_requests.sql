-- ============================================================================
-- Verificação da Tabela invite_requests
-- Execute este comando no Supabase SQL Editor para verificar os dados
-- ============================================================================

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'invite_requests'
) as tabela_existe;

-- 2. Mostrar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'invite_requests'
ORDER BY ordinal_position;

-- 3. Contar total de registros
SELECT COUNT(*) as total_registros FROM public.invite_requests;

-- 4. Contar por status
SELECT 
  status, 
  COUNT(*) as quantidade
FROM public.invite_requests
GROUP BY status;

-- 5. Mostrar todos os registros (sem filtro)
SELECT * FROM public.invite_requests ORDER BY created_at DESC;

-- 6. Mostrar apenas os pendentes
SELECT * FROM public.invite_requests WHERE status = 'pending' ORDER BY created_at DESC;

-- 7. Verificar RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'invite_requests'
ORDER BY policyname;

-- ============================================================================
-- FIM DO VERIFICAÇÃO
-- ============================================================================
