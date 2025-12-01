-- ============================================
-- MIGRATION: Criar função para ignorar RLS ao ler logs
-- ============================================

-- Criar uma função que lê logs ignorando RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_opportunity_logs(p_opportunity_id UUID)
RETURNS TABLE (
    id UUID,
    opportunity_id UUID,
    user_id UUID,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    full_name TEXT
) 
SECURITY DEFINER
LANGUAGE SQL
AS $$
    SELECT 
        ol.id,
        ol.opportunity_id,
        ol.user_id,
        ol.message,
        ol.created_at,
        p.full_name
    FROM opportunity_logs ol
    LEFT JOIN profiles p ON ol.user_id = p.id
    WHERE ol.opportunity_id = p_opportunity_id
    ORDER BY ol.created_at DESC;
$$;

-- Dar permissão para qualquer usuário chamar essa função
GRANT EXECUTE ON FUNCTION get_opportunity_logs(UUID) TO authenticated, anon;

