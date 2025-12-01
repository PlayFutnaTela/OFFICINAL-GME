"use server"

import { createClient } from "@/lib/supabase/server"
import { createLog } from "./logs"

export type Task = {
  id: string
  opportunity_id: string
  user_id: string
  title: string
  description: string | null
  status: "todo" | "doing" | "done"
  priority: "low" | "normal" | "high"
  due_date: string | null
  created_at: string
  updated_at: string
}

export type CreateTaskData = {
  opportunity_id: string
  title: string
  description?: string
  status?: "todo" | "doing" | "done"
  priority?: "low" | "normal" | "high"
  due_date?: string
}

export type UpdateTaskData = {
  title?: string
  description?: string
  status?: "todo" | "doing" | "done"
  priority?: "low" | "normal" | "high"
  due_date?: string
}

export async function getTasks(opportunity_id: string): Promise<Task[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("opportunity_id", opportunity_id)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    throw new Error(error?.message || JSON.stringify(error) || "Erro ao buscar tarefas")
  }

  return data as Task[]
}

export async function getAllTasks(): Promise<Task[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  let query = supabase
    .from("tasks")
    .select("*")

  if (profile?.role !== "adm") {
    query = query.eq("user_id", user.id)
  }

  const { data, error } = await query.order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching all tasks:", error)
    throw new Error(error?.message || JSON.stringify(error) || "Erro ao buscar todas as tarefas")
  }

  return data as Task[]
}

export async function createTask(taskData: CreateTaskData): Promise<Task> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuario nao autenticado")
  }

  if (!taskData.opportunity_id) {
    throw new Error("Campo opportunity_id e obrigatorio")
  }

  const { data: oppCheck, error: oppError } = await supabase
    .from("opportunities")
    .select("id")
    .eq("id", taskData.opportunity_id)
    .single()

  if (oppError) {
    console.error("Error validating opportunity:", oppError)
    throw new Error(oppError?.message || JSON.stringify(oppError) || "Erro ao validar oportunidade")
  }

  if (!oppCheck) {
    throw new Error("Oportunidade nao encontrada")
  }

  let insertResult
  try {
    insertResult = await supabase
      .from("tasks")
      .insert({
        ...taskData,
        user_id: user.id,
        status: taskData.status || "todo",
        priority: taskData.priority || "normal",
      })
      .select()
      .single()
  } catch (insertErr) {
    console.error("Unexpected error inserting task:", insertErr)
    throw new Error(insertErr?.message || String(insertErr) || "Erro inesperado ao criar tarefa")
  }

  const { data: insertedData, error: insertError } = insertResult || {}
  if (insertError) {
    console.error("Error creating task (supabase):", insertError)
    throw new Error(insertError?.message || JSON.stringify(insertError) || "Erro ao criar tarefa")
  }

  try {
    await createLog(taskData.opportunity_id, `Tarefa criada: "${taskData.title}"`)
  } catch (logError) {
    console.error("Error creating log:", logError)
  }

  return insertedData as Task
}

export async function updateTask(task_id: string, taskData: UpdateTaskData): Promise<Task> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...taskData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task_id)
    .select()
    .single()

  if (error) {
    console.error("Error updating task:", error)
    throw new Error(error?.message || JSON.stringify(error) || "Erro ao atualizar tarefa")
  }

  return data as Task
}

export async function updateTaskStatus(task_id: string, status: "todo" | "doing" | "done"): Promise<Task> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task_id)
    .select()
    .single()

  if (error) {
    console.error("Error updating task status:", error)
    throw new Error(error?.message || JSON.stringify(error) || "Erro ao atualizar status da tarefa")
  }

  if (status === "done" && data) {
    try {
      const { data: task } = await supabase
        .from("tasks")
        .select("opportunity_id, title")
        .eq("id", task_id)
        .single()

      if (task) {
        await createLog(task.opportunity_id, `Tarefa concluida: "${task.title}"`)
      }
    } catch (logError) {
      console.error("Error creating log:", logError)
    }
  }

  return data as Task
}

export async function deleteTask(task_id: string): Promise<void> {
  const supabase = createClient()

  const { data: task } = await supabase
    .from("tasks")
    .select("opportunity_id, title")
    .eq("id", task_id)
    .single()

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", task_id)

  if (error) {
    console.error("Error deleting task:", error)
    throw new Error(error?.message || JSON.stringify(error) || "Erro ao deletar tarefa")
  }

  if (task) {
    try {
      await createLog(task.opportunity_id, `Tarefa removida: "${task.title}"`)
    } catch (logError) {
      console.error("Error creating log:", logError)
    }
  }
}

export async function getTasksWithOpportunities(): Promise<any[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  let query = supabase.from("tasks").select(`*, opportunities(id, title, category, value, status), products(id, title, category, value, status)`)

  if (profile?.role !== "adm") {
    query = query.eq("user_id", user.id)
  }

  const { data, error } = await query.order("due_date", { ascending: true })

  if (error) {
    console.warn("Nested select failed, falling back to manual join. Error:", error)

    try {
      const { data: tasksOnly, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .order("due_date", { ascending: true })

      if (tasksError) throw tasksError

      const itemIds = Array.from(new Set((tasksOnly || []).map((t: any) => t.opportunity_id).filter(Boolean)))

      let opportunitiesMap: Record<string, any> = {}
      let productsMap: Record<string, any> = {}

      if (itemIds.length > 0) {
        const { data: oppData } = await supabase
          .from("opportunities")
          .select("id, title, category, value, status")
          .in("id", itemIds)

        const { data: prodData } = await supabase
          .from("products")
          .select("id, title, category, value, status")
          .in("id", itemIds)

        opportunitiesMap = (oppData || []).reduce((acc: Record<string, any>, o: any) => {
          acc[o.id] = o
          return acc
        }, {})

        productsMap = (prodData || []).reduce((acc: Record<string, any>, p: any) => {
          acc[p.id] = p
          return acc
        }, {})
      }

      const merged = (tasksOnly || []).map((t: any) => ({
        ...t,
        opportunities: t.opportunity_id ? opportunitiesMap[t.opportunity_id] || null : null,
        products: t.opportunity_id ? productsMap[t.opportunity_id] || null : null,
      }))

      return merged
    } catch (fallbackError) {
      console.error("Error in fallback:", fallbackError)
      throw new Error("Erro ao buscar tarefas")
    }
  }

  return data
}