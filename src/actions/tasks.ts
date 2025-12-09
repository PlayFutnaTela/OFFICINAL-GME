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

  const { data: profileArray } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    
  const profile = Array.isArray(profileArray) ? profileArray[0] : profileArray as any

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

  // Verificar se é uma oportunidade ou um produto
  const { data: oppCheck } = await supabase
    .from("opportunities")
    .select("id")
    .eq("id", taskData.opportunity_id)
    

  const { data: prodCheck } = await supabase
    .from("products")
    .select("id")
    .eq("id", taskData.opportunity_id)
    

  if (!oppCheck && !prodCheck) {
    throw new Error("Oportunidade ou produto nao encontrado")
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
  } catch (insertErr) {
    console.error("Unexpected error inserting task:", insertErr)
    throw new Error(insertErr?.message || String(insertErr) || "Erro inesperado ao criar tarefa")
  }

  const { data: insertedArray, error: insertError } = insertResult || {}
  if (insertError) {
    console.error("Error creating task (supabase):", insertError)
    throw new Error(insertError?.message || JSON.stringify(insertError) || "Erro ao criar tarefa")
  }

  const insertedData = Array.isArray(insertedArray) ? insertedArray[0] : insertedArray
  if (!insertedData) {
    throw new Error("Erro ao criar tarefa: nenhum dado retornado")
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

  const { data: updateResult, error } = await supabase
    .from("tasks")
    .update({
      ...taskData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task_id)
    .select()

  if (error) {
    console.error("Error updating task:", error)
    throw new Error(error?.message || JSON.stringify(error) || "Erro ao atualizar tarefa")
  }

  const data = Array.isArray(updateResult) ? updateResult[0] : updateResult
  return data as Task
}

export async function updateTaskStatus(task_id: string, status: "todo" | "doing" | "done"): Promise<Task> {
  const supabase = createClient()

  console.log(`[updateTaskStatus] INICIANDO - task_id: ${task_id}, novo status: ${status}`)

  const { data: updateResult, error } = await supabase
    .from("tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task_id)
    .select()

  if (error) {
    console.error("[updateTaskStatus] ERRO ao atualizar:", error)
    throw new Error(error?.message || JSON.stringify(error) || "Erro ao atualizar status da tarefa")
  }

  const data = Array.isArray(updateResult) ? updateResult[0] : updateResult
  console.log(`[updateTaskStatus] Tarefa atualizada com sucesso. Status agora é: ${data?.status}`)

  if (status === "done" && data) {
    console.log(`[updateTaskStatus] Status é 'done', buscando dados para criar log...`)
    try {
      const { data: taskArray, error: fetchError } = await supabase
        .from("tasks")
        .select("opportunity_id, title")
        .eq("id", task_id)

      if (fetchError) {
        console.error("[updateTaskStatus] ERRO ao buscar tarefa:", fetchError)
        throw fetchError
      }

      const task = Array.isArray(taskArray) ? taskArray[0] : taskArray

      if (task) {
        console.log(`[updateTaskStatus] Tarefa encontrada: ${task.title}, opportunity_id: ${task.opportunity_id}`)
        console.log(`[updateTaskStatus] Criando log...`)
        await createLog(task.opportunity_id, `Tarefa concluida: "${task.title}"`)
        console.log(`[updateTaskStatus] Log criado com sucesso!`)
      } else {
        console.warn(`[updateTaskStatus] AVISO: Nenhuma tarefa encontrada com id ${task_id}`)
      }
    } catch (logError) {
      console.error("[updateTaskStatus] ERRO ao criar log:", logError)
      console.error("[updateTaskStatus] Detalhes:", JSON.stringify(logError, null, 2))
    }
  } else {
    console.log(`[updateTaskStatus] Status não é 'done' ou data é null. Status: ${status}, Data existe: ${!!data}`)
  }

  return data as Task
}

export async function deleteTask(task_id: string): Promise<void> {
  const supabase = createClient()

  const { data: taskArray } = await supabase
    .from("tasks")
    .select("opportunity_id, title")
    .eq("id", task_id)
    
  const task = Array.isArray(taskArray) ? taskArray[0] : taskArray as any

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
      console.log(`[deleteTask] Criando log para tarefa removida: ${task.title} (opportunity_id: ${task.opportunity_id})`)
      await createLog(task.opportunity_id, `Tarefa removida: "${task.title}"`)
      console.log(`[deleteTask] Log criado com sucesso`)
    } catch (logError) {
      console.error("[deleteTask] Erro ao criar log:", logError)
    }
  }
}

export async function getTasksWithOpportunities(): Promise<any[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: profileArray } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    
  const profile = Array.isArray(profileArray) ? profileArray[0] : profileArray as any

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

      const opportunityIdSet = new Set<string>()
      ;(tasksOnly || []).forEach((t: any) => {
        if (t.opportunity_id) opportunityIdSet.add(t.opportunity_id)
      })
      const itemIds = Array.from(opportunityIdSet)

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