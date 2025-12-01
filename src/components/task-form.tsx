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
import { createTask, updateTask } from '@/actions/tasks'
import { getAllUsers, getAllItems } from '@/actions/users'
import { toast } from 'sonner'

type TaskFormData = {
    title: string
    description: string
    status: 'todo' | 'doing' | 'done'
    priority: 'low' | 'normal' | 'high'
    due_date: string
    opportunity_id: string
    assigned_user_id: string
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
    onTaskCreated?: () => void
    onTaskUpdated?: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export default function TaskForm({
    trigger,
    task = null,
    onTaskCreated,
    onTaskUpdated,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: TaskFormProps) {
    const [internalOpen, setInternalOpen] = useState(false)

    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? setControlledOpen! : setInternalOpen
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [users, setUsers] = useState<Array<{ id: string; full_name: string | null }>>([])
    const [opportunities, setOpportunities] = useState<Array<{ id: string; title: string; category: string; type: 'opportunity' | 'product' }>>([])

    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        status: 'todo',
        priority: 'normal',
        due_date: '',
        opportunity_id: '',
        assigned_user_id: '',
    })

    // Carregar usuários e oportunidades quando o modal abre
    useEffect(() => {
        if (open) {
            loadFormData()
        }
    }, [open])

    const loadFormData = async () => {
        try {
            setIsLoadingData(true)
            const [usersData, itemsData] = await Promise.all([
                getAllUsers(),
                getAllItems()
            ])
            setUsers(usersData)
            setOpportunities(itemsData)
        } catch (error) {
            console.error('Error loading form data:', error)
            toast.error('Erro ao carregar dados do formulário')
        } finally {
            setIsLoadingData(false)
        }
    }

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
                assigned_user_id: task.user_id,
            })
        } else {
            // Reset form
            setFormData({
                title: '',
                description: '',
                status: 'todo',
                priority: 'normal',
                due_date: '',
                opportunity_id: '',
                assigned_user_id: '',
            })
        }
    }, [task, open])

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

        if (!formData.assigned_user_id) {
            toast.error('Selecione um usuário responsável')
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
        } catch (error: any) {
            const message = error?.message || (typeof error === 'string' ? error : 'Erro ao salvar tarefa')
            console.error('Error saving task:', message, error)
            toast.error(message)
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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
                        </DialogTitle>
                        <DialogDescription>
                            {task
                                ? 'Atualize as informações da tarefa'
                                : 'Crie uma nova tarefa vinculada a uma oportunidade e atribua a um usuário'}
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingData ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            {/* Oportunidade e Usuário - SEMPRE VISÍVEIS */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="opportunity">
                                        Oportunidade / Produto <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.opportunity_id}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, opportunity_id: value })
                                        }
                                        required
                                        disabled={!!task}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {opportunities.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.type === 'product' ? '📦 ' : '💼 '}
                                                    {item.title} ({item.category})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {opportunities.length === 0 && (
                                        <p className="text-xs text-red-500">Nenhum item disponível</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned_user">
                                        Usuário Responsável <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.assigned_user_id}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, assigned_user_id: value })
                                        }
                                        required
                                        disabled={!!task}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um usuário" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.full_name || 'Sem nome'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {users.length === 0 && (
                                        <p className="text-xs text-red-500">Nenhum usuário disponível</p>
                                    )}
                                </div>
                            </div>

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
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving || isLoadingData} className="bg-blue-600 hover:bg-blue-700">
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
