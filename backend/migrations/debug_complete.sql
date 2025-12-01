-- ============================================
-- DEBUG COMPLETO: Verificar logs de tarefas concluídas
-- ============================================

-- 1. Ver TODOS os logs
SELECT COUNT(*) as total_logs FROM opportunity_logs;

-- 2. Ver logs mais recentes (últimos 50)
SELECT 
    id,
    opportunity_id,
    message,
    created_at,
    user_id
FROM opportunity_logs
ORDER BY created_at DESC
LIMIT 50;

-- 3. Ver especificamente logs com "Tarefa concluida"
SELECT 
    id,
    opportunity_id,
    message,
    created_at
FROM opportunity_logs
WHERE message LIKE '%concluida%'
ORDER BY created_at DESC;

-- 4. Ver tarefas com status 'done'
SELECT 
    id,
    opportunity_id,
    title,
    status,
    updated_at
FROM tasks
WHERE status = 'done'
ORDER BY updated_at DESC;

-- 5. Correlacionar tarefas concluídas com logs
SELECT 
    t.id as task_id,
    t.title,
    t.opportunity_id,
    t.status,
    t.updated_at as task_updated,
    ol.message,
    ol.created_at as log_created
FROM tasks t
LEFT JOIN opportunity_logs ol 
    ON t.opportunity_id = ol.opportunity_id 
    AND ol.message LIKE CONCAT('%', t.title, '%')
    AND ol.message LIKE '%concluida%'
WHERE t.status = 'done'
ORDER BY t.updated_at DESC;

