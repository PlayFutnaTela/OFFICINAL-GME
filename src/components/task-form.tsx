"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createTask, updateTask } from '@/backend/actions/tasks'
import { toast } from 'sonner'

type TaskFormData = {
    title: string
    description: string
    status: 'todo' | 'doing' | 'done'
    priority: 'low' | 'normal' | 'high'
    due_date: string
    opportunity_id: string
}

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

interface TaskFormProps {
    trigger?: React.ReactNode
    task?: Task | null
    opportunityId?: string
    opportunities?: Array<{ id: string; title: string }>
    onTaskCreated?: () => void
    onTaskUpdated?: () => void
}

export default function TaskForm({
    trigger,
    task = null,
    opportunityId,
    opportunities = [],
    onTaskCreated,
    onTaskUpdated,
}: TaskFormProps) {
    const [open, setOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        status: 'todo',
        priority: 'normal',
        due_date: '',
        opportunity_id: opportunityId || '',
    })

    // Atualiza o formulário quando a tarefa muda
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                due_date: task.due_date || '',
                opportunity_id: task.opportunity_id,
            })
        } else {
            // Reset form
            setFormData({
                title: '',
                description: '',
                status: 'todo',
                priority: 'normal',
                due_date: '',
                opportunity_id: opportunityId || '',
            })
        }
    }, [task, opportunityId, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error('O título da tarefa é obrigatório')
            return
        }

        if (!formData.opportunity_id) {
            toast.error('Selecione uma oportunidade')
            return
        }

        setIsSaving(true)
        try {
            if (task) {
                // Atualizar tarefa existente
                await updateTask(task.id, {
                    title: formData.title,
                    description: formData.description || undefined,
                    status: formData.status,
                    priority: formData.priority,
                    due_date: formData.due_date || undefined,
                })
                toast.success('Tarefa atualizada com sucesso')
                if (onTaskUpdated) onTaskUpdated()
            } else {
                // Criar nova tarefa
                await createTask({
                    title: formData.title,
                    description: formData.description || undefined,
                    status: formData.status,
                    priority: formData.priority,
                    due_date: formData.due_date || undefined,
                    opportunity_id: formData.opportunity_id,
                })
                toast.success('Tarefa criada com sucesso')
                if (onTaskCreated) onTaskCreated()
            }

            setOpen(false)
        } catch (error) {
            console.error('Error saving task:', error)
            toast.error('Erro ao salvar tarefa')
        } finally {
            setIsSaving(false)
        }
    }

    const defaultTrigger = (
        <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
        </Button>
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
                        </DialogTitle>
                        <DialogDescription>
                            {task
                                ? 'Atualize as informações da tarefa'
                                : 'Crie uma nova tarefa para acompanhar suas atividades'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Título <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="Digite o título da tarefa"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Descreva os detalhes da tarefa (opcional)"
                                className="resize-none h-24"
                            />
                        </div>

                        {!opportunityId && opportunities.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="opportunity">
                                    Oportunidade <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.opportunity_id}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, opportunity_id: value })
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma oportunidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {opportunities.map((opp) => (
                                            <SelectItem key={opp.id} value={opp.id}>
                                                {opp.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: 'todo' | 'doing' | 'done') =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">A Fazer</SelectItem>
                                        <SelectItem value="doing">Em Andamento</SelectItem>
                                        <SelectItem value="done">Concluída</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Prioridade</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: 'low' | 'normal' | 'high') =>
                                        setFormData({ ...formData, priority: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Baixa</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="due_date">Prazo</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={formData.due_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, due_date: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>{task ? 'Atualizar' : 'Criar'} Tarefa</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
