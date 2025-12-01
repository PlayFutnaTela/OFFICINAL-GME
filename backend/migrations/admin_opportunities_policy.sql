-- ============================================
-- PERMISSÕES DE ADMIN PARA OPORTUNIDADES
-- ============================================

-- Permitir que administradores vejam TODAS as oportunidades
CREATE POLICY "Admins podem ver todas as oportunidades"
ON opportunities FOR SELECT
USING (public.is_admin(auth.uid()));

-- Permitir que administradores atualizem TODAS as oportunidades
CREATE POLICY "Admins podem atualizar todas as oportunidades"
ON opportunities FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Permitir que administradores deletem TODAS as oportunidades
CREATE POLICY "Admins podem deletar todas as oportunidades"
ON opportunities FOR DELETE
USING (public.is_admin(auth.uid()));
