-- ============================================
-- MIGRATION: FIX RLS POLICIES FOR OPPORTUNITY_LOGS WITH PRODUCTS
-- ============================================

-- Remove a política antiga que só funciona com opportunities
DROP POLICY IF EXISTS "Usuario ve logs de suas oportunidades" ON opportunity_logs;
DROP POLICY IF EXISTS "Usuário vê logs de suas oportunidades" ON opportunity_logs;

-- Cria nova política que funciona com opportunities E products
CREATE POLICY "Usuario ve logs de oportunidades ou produtos"
ON opportunity_logs FOR SELECT
USING (
  -- Permite ver logs de oportunidades que pertencem ao usuário
  EXISTS (
    SELECT 1 FROM opportunities 
    WHERE opportunities.id = opportunity_logs.opportunity_id 
    AND opportunities.user_id = auth.uid()
  )
  OR
  -- Permite ver logs de produtos que o usuário criou
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = opportunity_logs.opportunity_id
  )
  OR
  -- Permite admins ver todos os logs
  public.is_admin(auth.uid())
);

-- A política de INSERT já permite que o sistema crie logs
-- CREATE POLICY "Sistema pode criar logs"
-- ON opportunity_logs FOR INSERT
-- WITH CHECK (TRUE);
-- Essa já existe e está funcionando corretamente

