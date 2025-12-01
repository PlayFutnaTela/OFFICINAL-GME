-- ============================================
-- MIGRATION: ALLOW TASKS FOR PRODUCTS
-- ============================================

-- 1. Remover constraint de Foreign Key da tabela tasks
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_opportunity_id_fkey;

-- 2. Remover constraint de Foreign Key da tabela opportunity_logs
ALTER TABLE opportunity_logs 
DROP CONSTRAINT IF EXISTS opportunity_logs_opportunity_id_fkey;

-- 3. (Opcional) Adicionar comentário explicando que opportunity_id agora pode ser Product ID
COMMENT ON COLUMN tasks.opportunity_id IS 'References opportunities(id) OR products(id)';
COMMENT ON COLUMN opportunity_logs.opportunity_id IS 'References opportunities(id) OR products(id)';
