-- ============================================
-- MIGRATION: Fix RLS for opportunity_logs to allow products
-- ============================================

-- Remove todas as políticas antigas
DROP POLICY IF EXISTS "Usuario ve logs de oportunidades ou produtos" ON opportunity_logs;
DROP POLICY IF EXISTS "Usuarios autenticados ve logs (DEBUG)" ON opportunity_logs;
DROP POLICY IF EXISTS "Usuario vê logs de suas oportunidades" ON opportunity_logs;
DROP POLICY IF EXISTS "Usuário vê logs de suas oportunidades" ON opportunity_logs;
DROP POLICY IF EXISTS "Sistema cria logs (INSERT)" ON opportunity_logs;
DROP POLICY IF EXISTS "Sistema pode criar logs" ON opportunity_logs;

-- ============================================
-- Nova estratégia: RLS com suporte completo a produtos
-- ============================================

-- POLÍTICA 1: LEITURA (SELECT) - Qualquer usuário autenticado pode ler
-- Nota: Se precisar mais restrição depois, pode-se refinar
CREATE POLICY "Usuarios autenticados podem ler logs"
ON opportunity_logs FOR SELECT
USING (auth.uid() IS NOT NULL);

-- POLÍTICA 2: CRIAÇÃO (INSERT) - Sistema pode criar
CREATE POLICY "Sistema pode criar logs"
ON opportunity_logs FOR INSERT
WITH CHECK (TRUE);

-- Verificar as políticas
SELECT policyname, permissive, roles, qual 
FROM pg_policies 
WHERE tablename = 'opportunity_logs'
ORDER BY policyname;

