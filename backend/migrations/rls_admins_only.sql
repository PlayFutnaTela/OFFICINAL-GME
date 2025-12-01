-- ============================================
-- MIGRATION: RLS simplificada para opportunity_logs
-- ============================================

-- Remove todas as políticas antigas
DROP POLICY IF EXISTS "Usuarios autenticados podem ler logs" ON opportunity_logs;
DROP POLICY IF EXISTS "Usuario ve logs de oportunidades ou produtos" ON opportunity_logs;
DROP POLICY IF EXISTS "Usuarios autenticados ve logs (DEBUG)" ON opportunity_logs;
DROP POLICY IF EXISTS "Usuario vê logs de suas oportunidades" ON opportunity_logs;
DROP POLICY IF EXISTS "Usuário vê logs de suas oportunidades" ON opportunity_logs;
DROP POLICY IF EXISTS "Sistema cria logs (INSERT)" ON opportunity_logs;
DROP POLICY IF EXISTS "Sistema pode criar logs" ON opportunity_logs;

-- ============================================
-- Nova estratégia: Apenas ADMs podem ler
-- ============================================

-- POLÍTICA 1: LEITURA (SELECT) - Apenas ADMs
CREATE POLICY "Apenas admins podem ler logs"
ON opportunity_logs FOR SELECT
USING (public.is_admin(auth.uid()));

-- POLÍTICA 2: CRIAÇÃO (INSERT) - Sistema pode criar (sem restrição)
CREATE POLICY "Sistema pode criar logs"
ON opportunity_logs FOR INSERT
WITH CHECK (TRUE);

-- Verificar as políticas criadas
SELECT policyname, permissive, roles, qual 
FROM pg_policies 
WHERE tablename = 'opportunity_logs'
ORDER BY policyname;

