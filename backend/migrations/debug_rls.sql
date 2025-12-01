-- ============================================
-- DEBUG: Verificar RLS e logs
-- ============================================

-- 1. Ver TODOS os logs (sem filtro)
SELECT COUNT(*) as total_logs FROM opportunity_logs;

-- 2. Ver logs mais recentes
SELECT 
    id,
    opportunity_id,
    message,
    created_at
FROM opportunity_logs
ORDER BY created_at DESC
LIMIT 20;

-- 3. Ver tarefas concluídas
SELECT 
    id,
    opportunity_id,
    title,
    status,
    updated_at
FROM tasks
WHERE status = 'done'
ORDER BY updated_at DESC
LIMIT 10;

-- 4. Ver RLS policies na tabela opportunity_logs
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'opportunity_logs'
ORDER BY policyname;

