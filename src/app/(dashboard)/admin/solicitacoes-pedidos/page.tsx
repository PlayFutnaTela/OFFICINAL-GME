'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Eye, CheckCircle, Clock, XCircle, MessageSquare, Loader2 } from 'lucide-react'

type Solicitacao = {
  id: string
  user_id: string
  title: string
  description: string
  specifications: string | null
  category: string
  budget: string
  location: string | null
  contact_preference: string
  additional_notes: string | null
  status: string
  priority: string
  created_at: string
  updated_at: string
  completed_at: string | null
  admin_notes: string | null
  assigned_to: string | null
  profiles: {
    full_name: string
  }
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SolicitacoesPedidosPage() {
  const supabase = createClient()
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [filtroStatus, setFiltroStatus] = useState('all')
  const [filtroPriority, setFiltroPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [newPriority, setNewPriority] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    carregarSolicitacoes()
  }, [])

  const carregarSolicitacoes = async () => {
    try {
      setLoading(true)
      const { data: solicitacoes, error: solError } = await supabase
        .from('solicitar_pedidos')
        .select('*')
        .order('created_at', { ascending: false })

      if (solError) throw solError

      // Buscar dados dos usuários separadamente
      if (solicitacoes && solicitacoes.length > 0) {
        const userIds = [...new Set(solicitacoes.map(s => s.user_id))]
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds)

        if (profileError) throw profileError

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
        
        const solicitacoesComPerfil = solicitacoes.map(sol => ({
          ...sol,
          profiles: {
            full_name: profileMap.get(sol.user_id)?.full_name || 'Desconhecido'
          }
        }))

        setSolicitacoes(solicitacoesComPerfil as Solicitacao[])
      } else {
        setSolicitacoes([])
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
      toast.error('Erro ao carregar solicitações')
    } finally {
      setLoading(false)
    }
  }

  const abrirDetalhes = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao)
    setAdminNotes(solicitacao.admin_notes || '')
    setNewStatus(solicitacao.status)
    setNewPriority(solicitacao.priority)
    setShowDetailModal(true)
  }

  const salvarAlteracoes = async () => {
    if (!selectedSolicitacao) return

    try {
      setUpdatingStatus(true)
      const { error } = await supabase
        .from('solicitar_pedidos')
        .update({
          status: newStatus,
          priority: newPriority,
          admin_notes: adminNotes,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', selectedSolicitacao.id)

      if (error) throw error

      toast.success('Solicitação atualizada com sucesso!')
      carregarSolicitacoes()
      setShowDetailModal(false)
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      toast.error('Erro ao atualizar solicitação')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const solicitacoesFiltradas = solicitacoes.filter(sol => {
    const matchStatus = filtroStatus === 'all' || sol.status === filtroStatus
    const matchPriority = filtroPriority === 'all' || sol.priority === filtroPriority
    const matchSearch = sol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sol.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchStatus && matchPriority && matchSearch
  })

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'in_progress': return <MessageSquare className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      in_progress: 'Em Progresso',
      completed: 'Concluído',
      rejected: 'Rejeitado',
    }
    return labels[status] || status
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: 'Baixa',
      normal: 'Normal',
      high: 'Alta',
    }
    return labels[priority] || priority
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Solicitações de Pedidos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie as solicitações de pedidos dos clientes (Concierge Service)
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{solicitacoes.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
              {solicitacoes.filter(s => s.status === 'pending').length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Em Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {solicitacoes.filter(s => s.status === 'in_progress').length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              {solicitacoes.filter(s => s.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <Input
          placeholder="Buscar por cliente ou item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="col-span-1 md:col-span-2 border-gray-300 dark:border-gray-600"
        />
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="border-gray-300 dark:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em Progresso</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroPriority} onValueChange={setFiltroPriority}>
          <SelectTrigger className="border-gray-300 dark:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Prioridades</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Solicitações Recebidas ({solicitacoesFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
          ) : solicitacoesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma solicitação encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Item</th>
                    <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold">Categoria</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Prioridade</th>
                    <th className="px-4 py-3 text-left font-semibold">Data</th>
                    <th className="px-4 py-3 text-left font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoesFiltradas.map(sol => (
                    <tr 
                      key={sol.id} 
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                        {sol.title}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {sol.profiles.full_name}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">
                        {sol.category}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${STATUS_COLORS[sol.status]} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(sol.status)}
                          <span>{getStatusLabel(sol.status)}</span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${PRIORITY_COLORS[sol.priority]} flex items-center gap-1 w-fit`}>
                          {getPriorityLabel(sol.priority)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {formatDate(sol.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirDetalhes(sol)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes da Solicitação</DialogTitle>
            <DialogDescription>
              {selectedSolicitacao?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedSolicitacao && (
            <div className="space-y-6">
              {/* Informações do Cliente */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">👤 Cliente</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nome:</span> {selectedSolicitacao.profiles.full_name}</p>
                  <p><span className="font-medium">Contato Preferido:</span> {selectedSolicitacao.contact_preference}</p>
                  <p><span className="font-medium">Localização:</span> {selectedSolicitacao.location || 'Não especificado'}</p>
                </div>
              </div>

              {/* Informações da Solicitação */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📋 Solicitação</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Categoria:</span> <span className="capitalize">{selectedSolicitacao.category}</span></p>
                  <p><span className="font-medium">Orçamento:</span> {selectedSolicitacao.budget}</p>
                  <p><span className="font-medium">Localização:</span> {selectedSolicitacao.location || 'Não especificado'}</p>
                  <p><span className="font-medium">Data:</span> {formatDateTime(selectedSolicitacao.created_at)}</p>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📝 Descrição</h3>
                <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedSolicitacao.description}
                </p>
              </div>

              {/* Especificações */}
              {selectedSolicitacao.specifications && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">⚙️ Especificações</h3>
                  <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedSolicitacao.specifications}
                  </p>
                </div>
              )}

              {/* Observações do Cliente */}
              {selectedSolicitacao.additional_notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📌 Observações do Cliente</h3>
                  <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedSolicitacao.additional_notes}
                  </p>
                </div>
              )}

              {/* Status e Prioridade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus} disabled={updatingStatus}>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">Prioridade</label>
                  <Select value={newPriority} onValueChange={setNewPriority} disabled={updatingStatus}>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600">
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

              {/* Notas do Admin */}
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">Notas Internas</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione notas internas sobre esta solicitação..."
                  rows={3}
                  className="border-gray-300 dark:border-gray-600"
                  disabled={updatingStatus}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailModal(false)}
                  disabled={updatingStatus}
                >
                  Fechar
                </Button>
                <Button 
                  onClick={salvarAlteracoes}
                  disabled={updatingStatus}
                  className="bg-black hover:bg-gray-900 text-white"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
