-- ============================================
-- QUERY: Verificar logs e tarefas concluídas
-- ============================================

-- 1. Ver quantos logs existem na tabela
SELECT COUNT(*) as total_logs FROM opportunity_logs;

-- 2. Ver todos os logs (últimos 50)
SELECT 
    id,
    opportunity_id,
    user_id,
    message,
    created_at
FROM opportunity_logs
ORDER BY created_at DESC
LIMIT 50;

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
LIMIT 20;

-- 4. Ver logs para um produto específico (substitua o UUID)
-- SELECT * FROM opportunity_logs WHERE opportunity_id = 'SEU_PRODUCT_ID_AQUI';

-- 5. Verificar se há discrepância entre tarefas concluídas e logs
SELECT 
    t.id as task_id,
    t.opportunity_id,
    t.title,
    t.status,
    COUNT(ol.id) as log_count
FROM tasks t
LEFT JOIN opportunity_logs ol ON t.opportunity_id = ol.opportunity_id
WHERE t.status = 'done'
GROUP BY t.id, t.opportunity_id, t.title, t.status
ORDER BY t.updated_at DESC;

