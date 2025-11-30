"use client"

import { useState } from 'react'
import { Check, Circle, Loader2, Clock } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { updateTaskStatus } from '@/backend/actions/tasks'
import { toast } from 'sonner'

type TaskStatus = 'todo' | 'doing' | 'done'

interface TaskStatusDropdownProps {
    taskId: string
    currentStatus: TaskStatus
    onStatusChange?: (newStatus: TaskStatus) => void
}

const statusConfig = {
    todo: {
        label: 'A Fazer',
        icon: Circle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
    },
    doing: {
        label: 'Em Andamento',
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    done: {
        label: 'Concluída',
        icon: Check,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
}

export default function TaskStatusDropdown({
    taskId,
    currentStatus,
    onStatusChange,
}: TaskStatusDropdownProps) {
    const [status, setStatus] = useState<TaskStatus>(currentStatus)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (newStatus === status) return

        setIsUpdating(true)
        try {
            await updateTaskStatus(taskId, newStatus)
            setStatus(newStatus)
            toast.success(`Status atualizado para "${statusConfig[newStatus].label}"`)

            if (onStatusChange) {
                onStatusChange(newStatus)
            }
        } catch (error) {
            console.error('Error updating task status:', error)
            toast.error('Erro ao atualizar status da tarefa')
        } finally {
            setIsUpdating(false)
        }
    }

    const CurrentIcon = statusConfig[status].icon

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    className={`${statusConfig[status].bgColor} ${statusConfig[status].color} border-0 hover:opacity-80`}
                >
                    {isUpdating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <CurrentIcon className="h-4 w-4 mr-2" />
                    )}
                    {statusConfig[status].label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.entries(statusConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                        <DropdownMenuItem
                            key={key}
                            onClick={() => handleStatusChange(key as TaskStatus)}
                            className="cursor-pointer"
                        >
                            <Icon className={`h-4 w-4 mr-2 ${config.color}`} />
                            {config.label}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
