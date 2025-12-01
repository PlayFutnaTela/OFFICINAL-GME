-- ============================================
-- SCRIPT: Verificar e Popular Logs de Tarefas
-- ============================================

-- 1. VERIFICAR se existem logs na tabela opportunity_logs
-- Execute isso no SQL Editor do Supabase para ver o que existe:
SELECT id, opportunity_id, message, created_at 
FROM opportunity_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- 2. VERIFICAR quantas tarefas existem
SELECT id, opportunity_id, title, status, created_at 
FROM tasks 
WHERE status = 'done'
ORDER BY created_at DESC;

-- 3. CRIAR logs para tarefas concluídas que não têm log ainda
-- (Execute após verificar acima)
-- Substitua os IDs das tarefas conforme necessário:
/*
INSERT INTO opportunity_logs (opportunity_id, message, created_at)
SELECT 
  t.opportunity_id,
  'Tarefa concluida: "' || t.title || '"',
  t.updated_at
FROM tasks t
WHERE t.status = 'done'
  AND NOT EXISTS (
    SELECT 1 FROM opportunity_logs ol 
    WHERE ol.opportunity_id = t.opportunity_id 
    AND ol.message LIKE '%Tarefa concluida%'
  )
ORDER BY t.updated_at DESC;
*/

