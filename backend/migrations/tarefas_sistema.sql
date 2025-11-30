-- ============================================
-- COMANDOS SQL PARA SISTEMA DE TAREFAS
-- Execute estes comandos no painel do Supabase
-- ============================================

-- ============================================
-- 1. CRIAÇÃO DA TABELA DE TAREFAS
-- ============================================

-- Tabela de tarefas vinculadas a oportunidades
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ROW LEVEL SECURITY (RLS) - TASKS
-- ============================================

-- Habilita RLS na tabela tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Usuário só vê suas próprias tarefas
CREATE POLICY "Usuário só vê suas tarefas"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Usuário só cria suas próprias tarefas
CREATE POLICY "Usuário só cria suas tarefas"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuário só atualiza suas próprias tarefas
CREATE POLICY "Usuário só atualiza suas tarefas"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

-- Usuário só deleta suas próprias tarefas
CREATE POLICY "Usuário só deleta suas tarefas"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- Administradores podem ver todas as tarefas
CREATE POLICY "Admins podem ver todas as tarefas"
ON tasks FOR SELECT
USING (public.is_admin(auth.uid()));

-- Administradores podem atualizar todas as tarefas
CREATE POLICY "Admins podem atualizar todas as tarefas"
ON tasks FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Administradores podem deletar todas as tarefas
CREATE POLICY "Admins podem deletar todas as tarefas"
ON tasks FOR DELETE
USING (public.is_admin(auth.uid()));

-- ============================================
-- 3. TABELA DE LOGS (OPCIONAL - LINHA DO TEMPO)
-- ============================================

-- Tabela de logs/linha do tempo da negociação
CREATE TABLE IF NOT EXISTS opportunity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) - OPPORTUNITY_LOGS
-- ============================================

-- Habilita RLS
ALTER TABLE opportunity_logs ENABLE ROW LEVEL SECURITY;

-- Policies para opportunity_logs
CREATE POLICY "Usuário vê logs de suas oportunidades"
ON opportunity_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM opportunities 
    WHERE opportunities.id = opportunity_logs.opportunity_id 
    AND opportunities.user_id = auth.uid()
  )
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Sistema pode criar logs"
ON opportunity_logs FOR INSERT
WITH CHECK (TRUE);

-- ============================================
-- FIM DOS COMANDOS SQL
-- ============================================

-- OBSERVAÇÕES:
-- 1. A função public.is_admin() já deve existir no banco (criada em supabase_schema.sql)
-- 2. A tabela opportunities já deve existir (criada em backend/schema.sql)
-- 3. Execute os comandos na ordem apresentada
-- 4. Verifique se não há erros após cada bloco de comandos
