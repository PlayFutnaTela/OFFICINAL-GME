"use client"

import { useState } from 'react'
import { Trash2, Edit, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TaskStatusDropdown from './task-status-dropdown'
import { deleteTask } from '@/backend/actions/tasks'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type Task = {
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

interface TaskListProps {
    tasks: Task[]
    onTaskDeleted?: (taskId: string) => void
    onTaskEdit?: (task: Task) => void
    showOpportunityTitle?: boolean
    opportunityTitles?: Record<string, string>
}

const priorityConfig = {
    low: {
        label: 'Baixa',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
    },
    normal: {
        label: 'Normal',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    high: {
        label: 'Alta',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
    },
}

export default function TaskList({
    tasks,
    onTaskDeleted,
    onTaskEdit,
    showOpportunityTitle = false,
    opportunityTitles = {},
}: TaskListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (taskId: string) => {
        setDeletingId(taskId)
        try {
            await deleteTask(taskId)
            toast.success('Tarefa excluída com sucesso')

            if (onTaskDeleted) {
                onTaskDeleted(taskId)
            }
        } catch (error) {
            console.error('Error deleting task:', error)
            toast.error('Erro ao excluir tarefa')
        } finally {
            setDeletingId(null)
        }
    }

    const isOverdue = (dueDate: string | null) => {
        if (!dueDate) return false
        return new Date(dueDate) < new Date()
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Sem prazo'

        const date = new Date(dateString)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Remover hora para comparação apenas de datas
        today.setHours(0, 0, 0, 0)
        tomorrow.setHours(0, 0, 0, 0)
        date.setHours(0, 0, 0, 0)

        if (date.getTime() === today.getTime()) {
            return 'Hoje'
        } else if (date.getTime() === tomorrow.getTime()) {
            return 'Amanhã'
        } else {
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        }
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhuma tarefa encontrada</p>
                <p className="text-sm mt-2">Crie uma nova tarefa para começar</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => {
                const overdue = isOverdue(task.due_date) && task.status !== 'done'

                return (
                    <Card
                        key={task.id}
                        className={`transition-all hover:shadow-md ${overdue ? 'border-red-300 bg-red-50/30' : ''
                            }`}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {showOpportunityTitle && opportunityTitles[task.opportunity_id] && (
                                        <p className="text-xs text-gray-500 mb-1">
                                            📁 {opportunityTitles[task.opportunity_id]}
                                        </p>
                                    )}

                                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                        {task.title}
                                    </h3>

                                    {task.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${priorityConfig[task.priority].bgColor
                                                } ${priorityConfig[task.priority].color} font-medium`}
                                        >
                                            {priorityConfig[task.priority].label}
                                        </span>

                                        {task.due_date && (
                                            <div
                                                className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-gray-600'
                                                    }`}
                                            >
                                                {overdue && <AlertCircle className="h-3 w-3" />}
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(task.due_date)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 items-end">
                                    <TaskStatusDropdown
                                        taskId={task.id}
                                        currentStatus={task.status}
                                    />

                                    <div className="flex gap-1">
                                        {onTaskEdit && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onTaskEdit(task)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit className="h-4 w-4 text-gray-600" />
                                            </Button>
                                        )}

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={deletingId === task.id}
                                                    className="h-8 w-8 p-0 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta ação não pode ser desfeita. A tarefa será permanentemente excluída.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(task.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Excluir
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
