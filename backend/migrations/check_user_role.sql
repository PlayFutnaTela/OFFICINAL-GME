-- ============================================
-- VERIFICAR ROLE DO USUÁRIO ATUAL
-- ============================================

-- Ver qual é o seu user_id
SELECT auth.uid() as seu_user_id;

-- Ver qual é o seu role na tabela profiles
SELECT 
    id,
    full_name,
    role,
    email
FROM profiles
WHERE id = auth.uid();

-- Ver TODOS os usuários e seus roles
SELECT 
    id,
    full_name,
    role,
    email
FROM profiles
ORDER BY created_at DESC;

