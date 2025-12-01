"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, Clock, Circle, AlertTriangle } from 'lucide-react'
import { getTasksWithOpportunities } from '@/actions/tasks'
import TaskList from '@/components/task-list'
import TaskForm from '@/components/task-form'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

type TaskWithOpportunity = {
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
    opportunities: {
        id: string
        title: string
        category: string
        value: number
        status: string
    } | null
    products: {
        id: string
        title: string
        category: string
        value: number
        status: string
    } | null
}

export default function TarefasPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [tasks, setTasks] = useState<TaskWithOpportunity[]>([])
    const [filteredTasks, setFilteredTasks] = useState<TaskWithOpportunity[]>([])
    const [opportunities, setOpportunities] = useState<Array<{ id: string; title: string; type: 'opportunity' | 'product' }>>([])

    // Estado para edição
    const [editingTask, setEditingTask] = useState<TaskWithOpportunity | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // Filtros
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterPriority, setFilterPriority] = useState<string>('all')

    // Verificar se o usuário é admin
    const checkAdminAccess = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                toast.error('Você precisa estar autenticado para acessar esta página')
                router.push('/login')
                return false
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'adm') {
                toast.error('Acesso negado. Esta página é restrita a administradores.')
                router.push('/dashboard')
                return false
            }

            setIsAdmin(true)
            return true
        } catch (error) {
            console.error('Error checking admin access:', error)
            toast.error('Erro ao verificar permissões')
            router.push('/dashboard')
            return false
        }
    }, [supabase, router])

    // Carregar tarefas e oportunidades
    const loadData = useCallback(async () => {
        try {
            setLoading(true)

            // Carregar tarefas com informações das oportunidades
            const tasksData = await getTasksWithOpportunities()
            setTasks(tasksData)
            setFilteredTasks(tasksData)

            // Extrair lista única de oportunidades e produtos
            const uniqueItems = tasksData
                .map((task) => {
                    if (task.opportunities) {
                        return {
                            id: task.opportunities.id,
                            title: task.opportunities.title,
                            type: 'opportunity' as const
                        }
                    }
                    if (task.products) {
                        return {
                            id: task.products.id,
                            title: task.products.title,
                            type: 'product' as const
                        }
                    }
                    return null
                })
                .filter((item): item is { id: string; title: string; type: 'opportunity' | 'product' } => item !== null)
                .filter((item, index, self) =>
                    index === self.findIndex((i) => i.id === item.id)
                )

            setOpportunities(uniqueItems)
        } catch (error: any) {
            // Prefer a descriptive message if available
            const message = error?.message || (typeof error === 'string' ? error : 'Erro ao carregar tarefas')
            console.error('Error loading tasks:', message, error)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Inicialização
    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAdminAccess()
            if (hasAccess) {
                await loadData()
            }
        }
        init()
    }, [checkAdminAccess, loadData])

    // Aplicar filtros
    useEffect(() => {
        let filtered = [...tasks]

        if (filterStatus !== 'all') {
            filtered = filtered.filter((task) => task.status === filterStatus)
        }

        if (filterPriority !== 'all') {
            filtered = filtered.filter((task) => task.priority === filterPriority)
        }

        setFilteredTasks(filtered)
    }, [filterStatus, filterPriority, tasks])

    // Estatísticas
    const stats = {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === 'todo').length,
        doing: tasks.filter((t) => t.status === 'doing').length,
        done: tasks.filter((t) => t.status === 'done').length,
        overdue: tasks.filter(
            (t) =>
                t.due_date &&
                new Date(t.due_date) < new Date() &&
                t.status !== 'done'
        ).length,
    }

    const handleTaskDeleted = (taskId: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId))
    }

    const handleTaskChanged = () => {
        loadData()
    }

    // Converter para formato esperado pelo TaskList
    const taskListData = filteredTasks.map((task) => ({
        id: task.id,
        opportunity_id: task.opportunity_id,
        user_id: task.user_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        created_at: task.created_at,
        updated_at: task.updated_at,
    }))

    // Criar mapa de títulos
    const opportunityTitles = filteredTasks.reduce((acc, task) => {
        if (task.opportunities) {
            acc[task.opportunity_id] = task.opportunities.title
        } else if (task.products) {
            acc[task.opportunity_id] = `📦 ${task.products.title}`
        }
        return acc
    }, {} as Record<string, string>)

    if (loading || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Tarefas</h1>
                    <p className="text-gray-500 mt-2">
                        Organize e acompanhe todas as tarefas vinculadas às oportunidades
                    </p>
                </div>
                <TaskForm
                    onTaskCreated={handleTaskChanged}
                    onTaskUpdated={handleTaskChanged}
                />
            </div>

            {/* Estatísticas */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total de Tarefas</CardDescription>
                        <CardTitle className="text-3xl">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-1">
                            <Circle className="h-3 w-3" />
                            A Fazer
                        </CardDescription>
                        <CardTitle className="text-3xl text-gray-600">{stats.todo}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Em Andamento
                        </CardDescription>
                        <CardTitle className="text-3xl text-blue-600">{stats.doing}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Concluídas
                        </CardDescription>
                        <CardTitle className="text-3xl text-green-600">{stats.done}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Atrasadas
                        </CardDescription>
                        <CardTitle className="text-3xl text-red-600">{stats.overdue}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    <SelectItem value="todo">A Fazer</SelectItem>
                                    <SelectItem value="doing">Em Andamento</SelectItem>
                                    <SelectItem value="done">Concluídas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1">
                            <Select value={filterPriority} onValueChange={setFilterPriority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por prioridade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="low">Baixa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Tarefas */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Tarefas ({filteredTasks.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <TaskList
                        tasks={taskListData}
                        onTaskDeleted={handleTaskDeleted}
                        onTaskEdit={(task) => {
                            setEditingTask(task as TaskWithOpportunity)
                            setIsEditOpen(true)
                        }}
                        showOpportunityTitle={true}
                        opportunityTitles={opportunityTitles}
                    />
                </CardContent>
            </Card>

            {/* Modal de Edição */}
            {editingTask && (
                <TaskForm
                    task={editingTask}
                    open={isEditOpen}
                    onOpenChange={(open) => {
                        setIsEditOpen(open)
                        if (!open) setEditingTask(null)
                    }}
                    onTaskUpdated={() => {
                        handleTaskChanged()
                        setIsEditOpen(false)
                        setEditingTask(null)
                    }}
                />
            )}
        </div>
    )
}
