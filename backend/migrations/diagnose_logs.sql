-- ============================================
-- QUERY: Diagnosticar problema de logs
-- ============================================

-- Execute no SQL Editor do Supabase e compartilhe os resultados:

-- 1. CONTAR LOGS
SELECT COUNT(*) as total_logs_na_tabela FROM opportunity_logs;

-- 2. LISTAR TODOS OS LOGS (mais recentes primeiro)
SELECT 
    id,
    opportunity_id,
    message,
    created_at,
    user_id
FROM opportunity_logs
ORDER BY created_at DESC
LIMIT 100;

-- 3. VERIFICAR SE EXISTE LOG PARA TAREFA CONCLUÍDA
-- (Se a tarefa foi concluída, deveria haver um log dizendo "Tarefa concluida:")
SELECT 
    t.id as task_id,
    t.title as task_title,
    t.opportunity_id,
    t.status,
    t.updated_at as task_updated_at,
    ol.message as log_message,
    ol.created_at as log_created_at
FROM tasks t
LEFT JOIN opportunity_logs ol 
    ON t.opportunity_id = ol.opportunity_id 
    AND ol.message LIKE CONCAT('%', t.title, '%')
WHERE t.status = 'done'
ORDER BY t.updated_at DESC;

-- 4. VERIFICAR RLS: Testar se você consegue ler logs de um produto específico
-- Substitua 'ID_DO_PRODUTO_AQUI' pelo ID do produto:
-- SELECT * FROM opportunity_logs 
-- WHERE opportunity_id = 'ID_DO_PRODUTO_AQUI'
-- ORDER BY created_at DESC;

