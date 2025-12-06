-- ============================================================================
-- FIX: Corrigir RLS Policy para invite_requests
-- Problema: Service role não conseguia ler os dados
-- ============================================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Admins can view all invite requests" ON public.invite_requests;
DROP POLICY IF EXISTS "Admins can update invite requests" ON public.invite_requests;
DROP POLICY IF EXISTS "Anyone can insert invite requests" ON public.invite_requests;

-- Recriar policies corrigidas

-- 1. Qualquer um pode inserir solicitações
CREATE POLICY "Anyone can insert invite requests"
ON public.invite_requests
FOR INSERT
WITH CHECK (true);

-- 2. Admins (usuários autenticados com is_admin=true) podem ler
CREATE POLICY "Admins can view invite requests"
ON public.invite_requests
FOR SELECT
USING ( public.is_admin(auth.uid()) );

-- 3. Service role (admin client) pode ler tudo
-- Isso é necessário para que o servidor action consiga buscar os dados
CREATE POLICY "Service role can view all invite requests"
ON public.invite_requests
FOR SELECT
USING ( auth.role() = 'service_role' );

-- 4. Admins (usuários autenticados) podem atualizar
CREATE POLICY "Admins can update invite requests"
ON public.invite_requests
FOR UPDATE
USING ( public.is_admin(auth.uid()) )
WITH CHECK ( public.is_admin(auth.uid()) );

-- 5. Service role (admin client) pode atualizar
CREATE POLICY "Service role can update invite requests"
ON public.invite_requests
FOR UPDATE
USING ( auth.role() = 'service_role' )
WITH CHECK ( auth.role() = 'service_role' );

-- ============================================================================
-- Verificação das policies
-- ============================================================================

SELECT 
  policyname,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'invite_requests'
ORDER BY policyname;

-- ============================================================================
-- FIM DA CORREÇÃO
-- ============================================================================
