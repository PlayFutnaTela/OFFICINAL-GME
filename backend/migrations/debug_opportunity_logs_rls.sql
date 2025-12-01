-- ============================================
-- MIGRATION: PERMISSIVE RLS FOR OPPORTUNITY_LOGS (DEBUG)
-- ============================================

-- IMPORTANTE: Esta é uma versão de DEBUG com RLS mais permissiva
-- Após validar que está funcionando, você pode fazer a RLS mais restritiva

-- Remove políticas antigas
DROP POLICY IF EXISTS "Usuario ve logs de oportunidades ou produtos" ON opportunity_logs;
DROP POLICY IF EXISTS "Usuario ve logs de suas oportunidades" ON opportunity_logs;
DROP POLICY IF EXISTS "Usuário vê logs de suas oportunidades" ON opportunity_logs;
DROP POLICY IF EXISTS "Sistema pode criar logs" ON opportunity_logs;

-- VERSÃO 1: Permissiva para DEBUG (remova após confirmar que funciona)
-- Qualquer usuário autenticado pode ver todos os logs
CREATE POLICY "Usuarios autenticados ve logs (DEBUG)"
ON opportunity_logs FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Sistema pode sempre criar logs
CREATE POLICY "Sistema cria logs (INSERT)"
ON opportunity_logs FOR INSERT
WITH CHECK (TRUE);

-- Depois de confirmar que está funcionando, substitua a política SELECT por algo mais restritivo:
/*
CREATE POLICY "Usuario ve logs de suas oportunidades ou produtos"
ON opportunity_logs FOR SELECT
USING (
  -- Permite ver logs de oportunidades que pertencem ao usuário
  EXISTS (
    SELECT 1 FROM opportunities 
    WHERE opportunities.id = opportunity_logs.opportunity_id 
    AND opportunities.user_id = auth.uid()
  )
  OR
  -- Permite ver logs de produtos 
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = opportunity_logs.opportunity_id
  )
  OR
  -- Permite admins ver todos os logs
  public.is_admin(auth.uid())
);
*/

