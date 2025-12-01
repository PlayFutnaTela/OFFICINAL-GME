"use server"

import { createClient } from '@/lib/supabase/server'
import { createLog } from './logs'

export type Task = {
  id: string
  opportunity_id: string
  user_id: string
  title: string
  description: string | null
  status: 'todo' | 'doing' | 'done'
  priority: 'low' | 'normal' | 'high'
  due_date: string | null
  created_at: string
  updated_at: string
}

export type CreateTaskData = {
  opportunity_id: string
  title: string
  description?: string
  status?: 'todo' | 'doing' | 'done'
  priority?: 'low' | 'normal' | 'high'
  due_date?: string
}

export type UpdateTaskData = {
  title?: string
  description?: string
  status?: 'todo' | 'doing' | 'done'
  priority?: 'low' | 'normal' | 'high'
  due_date?: string
}

/**
 * Lista todas as tarefas de uma oportunidade específica
 */
export async function getTasks(opportunity_id: string): Promise<Task[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunity_id)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching tasks:', error)
    throw error
  }

  return data as Task[]
}

/**
 * Lista todas as tarefas do usuário ou todas (para admins)
 */
export async function getAllTasks(): Promise<Task[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Busca o perfil do usuário para verificar se é admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('tasks')
    .select('*')

  // Se não for admin, filtra apenas tarefas do usuário
  if (profile?.role !== 'adm') {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query.order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching all tasks:', error)
    throw error
  }

  return data as Task[]
}

/**
 * Cria uma nova tarefa
 */
export async function createTask(taskData: CreateTaskData): Promise<Task> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...taskData,
      user_id: user.id,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'normal',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    throw error
  }

  // Criar log na linha do tempo
  try {
    await createLog(
      taskData.opportunity_id,
      `📌 Tarefa criada: "${taskData.title}"`
    )
  } catch (logError) {
    console.error('Error creating log:', logError)
  }

  return data as Task
}

/**
 * Atualiza uma tarefa existente
 */
export async function updateTask(task_id: string, taskData: UpdateTaskData): Promise<Task> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...taskData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', task_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating task:', error)
    throw error
  }

  return data as Task
}

/**
 * Atualiza apenas o status de uma tarefa
 */
export async function updateTaskStatus(task_id: string, status: 'todo' | 'doing' | 'done'): Promise<Task> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', task_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating task status:', error)
    throw error
  }

  // Criar log na linha do tempo quando concluída
  if (status === 'done' && data) {
    try {
      // Buscar opportunity_id da tarefa
      const { data: task } = await supabase
        .from('tasks')
        .select('opportunity_id, title')
        .eq('id', task_id)
        .single()

      if (task) {
        await createLog(
          task.opportunity_id,
          `✅ Tarefa concluída: "${task.title}"`
        )
      }
    } catch (logError) {
      console.error('Error creating log:', logError)
    }
  }

  return data as Task
}

/**
 * Deleta uma tarefa
 */
export async function deleteTask(task_id: string): Promise<void> {
  const supabase = createClient()

  // Buscar info da tarefa antes de deletar para criar log
  const { data: task } = await supabase
    .from('tasks')
    .select('opportunity_id, title')
    .eq('id', task_id)
    .single()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', task_id)

  if (error) {
    console.error('Error deleting task:', error)
    throw error
  }

  // Criar log na linha do tempo
  if (task) {
    try {
      await createLog(
        task.opportunity_id,
        `🗑️ Tarefa removida: "${task.title}"`
      )
    } catch (logError) {
      console.error('Error creating log:', logError)
    }
  }
}

/**
 * Busca tarefas com informações da oportunidade vinculada
 */
export async function getTasksWithOpportunities(): Promise<any[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Busca o perfil do usuário para verificar se é admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('tasks')
    .select(`
      *,
      opportunities (
        id,
        title,
        category,
        value,
        status
      )
    `)

  // Se não for admin, filtra apenas tarefas do usuário
  if (profile?.role !== 'adm') {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query.order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching tasks with opportunities:', error)
    throw error
  }

  return data
}
