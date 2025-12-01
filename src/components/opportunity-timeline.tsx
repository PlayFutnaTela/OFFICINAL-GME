"use client"

import { useEffect, useState } from 'react'
import { Clock, User, CheckCircle, AlertCircle, TrendingUp, Info, HelpCircle } from 'lucide-react'
import { getOpportunityLogs } from '@/actions/logs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useCallback } from 'react'

type OpportunityLog = {
    id: string
    opportunity_id: string
    user_id: string | null
    message: string
    created_at: string
    profiles?: {
        full_name: string | null
    } | null
}

interface OpportunityTimelineProps {
    opportunityId: string
}

export default function OpportunityTimeline({ opportunityId }: OpportunityTimelineProps) {
    const [logs, setLogs] = useState<OpportunityLog[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [checkingAdmin, setCheckingAdmin] = useState(true)

    // Verificar se o usuário é admin
    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await fetch('/api/auth/check-admin', { method: 'GET' })
                const data = await response.json()
                setIsAdmin(data.isAdmin || false)
                console.log(`[opportunity-timeline] Usuário é admin: ${data.isAdmin}`)
            } catch (error) {
                console.error('[opportunity-timeline] Erro ao verificar admin status:', error)
                setIsAdmin(false)
            } finally {
                setCheckingAdmin(false)
            }
        }
        
        checkAdminStatus()
    }, [])

    useEffect(() => {
        if (isAdmin) {
            loadLogs()
        } else {
            setLoading(false)
        }
    }, [opportunityId, isAdmin])

    const loadLogs = async () => {
        try {
            setLoading(true)
            console.log(`[opportunity-timeline] Carregando logs para opportunityId: ${opportunityId}`)
            const data = await getOpportunityLogs(opportunityId)
            console.log(`[opportunity-timeline] Logs recebidos:`, data)
            setLogs(data)
        } catch (error) {
            console.error('[opportunity-timeline] Error loading logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const getIcon = (message: string) => {
        if (message.includes('✅') || message.includes('concluída')) {
            return <CheckCircle className="h-5 w-5 text-green-600" />
        }
        if (message.includes('📌') || message.includes('criada')) {
            return <Info className="h-5 w-5 text-blue-600" />
        }
        if (message.includes('⚠️') || message.includes('atrasada')) {
            return <AlertCircle className="h-5 w-5 text-red-600" />
        }
        if (message.includes('📊') || message.includes('Status')) {
            return <TrendingUp className="h-5 w-5 text-purple-600" />
        }
        return <Clock className="h-5 w-5 text-gray-600" />
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 1) {
            const minutes = Math.floor(diffInHours * 60)
            return `Há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
        }
        if (diffInHours < 24) {
            const hours = Math.floor(diffInHours)
            return `Há ${hours} ${hours === 1 ? 'hora' : 'horas'}`
        }
        if (diffInHours < 48) {
            return 'Ontem'
        }

        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Não mostrar o card se o usuário não é admin
    if (!isAdmin && !checkingAdmin) {
        return null
    }

    if (loading || checkingAdmin) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Linha do Tempo
                        </CardTitle>
                        <div className="relative group">
                            <HelpCircle className="h-5 w-5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                            <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10 shadow-lg">
                                <p className="font-semibold mb-1">Atividades registradas:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Criação de tarefas</li>
                                    <li>Conclusão de tarefas</li>
                                    <li>Remoção de tarefas</li>
                                    <li>Alterações de status</li>
                                </ul>
                                <div className="absolute bottom-0 right-4 transform translate-y-full border-8 border-transparent border-t-gray-900"></div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (logs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Linha do Tempo
                        </CardTitle>
                        <div className="relative group">
                            <HelpCircle className="h-5 w-5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                            <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10 shadow-lg">
                                <p className="font-semibold mb-1">Atividades registradas:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Criação de tarefas</li>
                                    <li>Conclusão de tarefas</li>
                                    <li>Remoção de tarefas</li>
                                    <li>Alterações de status</li>
                                </ul>
                                <div className="absolute bottom-0 right-4 transform translate-y-full border-8 border-transparent border-t-gray-900"></div>
                            </div>
                        </div>
                    </div>
                    <CardDescription>
                        Histórico de atividades desta oportunidade
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Nenhuma atividade registrada ainda</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Linha do Tempo
                    </CardTitle>
                    <div className="relative group">
                        <HelpCircle className="h-5 w-5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10 shadow-lg">
                            <p className="font-semibold mb-1">Atividades registradas:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Criação de tarefas</li>
                                <li>Conclusão de tarefas</li>
                                <li>Remoção de tarefas</li>
                                <li>Alterações de status</li>
                            </ul>
                            <div className="absolute bottom-0 right-4 transform translate-y-full border-8 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                </div>
                <CardDescription>
                    Histórico de {logs.length} {logs.length === 1 ? 'atividade' : 'atividades'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative space-y-4">
                    {/* Linha vertical */}
                    <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gray-200" />

                    {logs.map((log, index) => (
                        <div key={log.id} className="relative flex gap-4">
                            {/* Ícone */}
                            <div className="relative z-10 flex-shrink-0">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-gray-200">
                                    {getIcon(log.message)}
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1 pb-4">
                                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        {log.message}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {log.profiles?.full_name || 'Sistema'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(log.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
