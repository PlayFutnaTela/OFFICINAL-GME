"use server"

import { createClient } from '@/lib/supabase/server'

export type OpportunityLog = {
    id: string
    opportunity_id: string
    user_id: string | null
    message: string
    created_at: string
    profiles?: {
        full_name: string | null
    } | null
}

/**
 * Cria um log na linha do tempo de uma oportunidade
 */
export async function createLog(
    opportunity_id: string,
    message: string
): Promise<void> {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('opportunity_logs').insert({
        opportunity_id,
        user_id: user?.id || null,
        message,
    })

    if (error) {
        console.error('Error creating log:', error)
        // Não lançar erro para não quebrar a operação principal
    }
}

/**
 * Busca todos os logs de uma oportunidade
 */
export async function getOpportunityLogs(opportunity_id: string): Promise<any[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('opportunity_logs')
        .select(`
      id,
      opportunity_id,
      user_id,
      message,
      created_at,
      profiles (
        full_name
      )
    `)
        .eq('opportunity_id', opportunity_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching logs:', error)
        return []
    }

    return data || []
}

/**
 * Busca logs recentes de todas as oportunidades (apenas para admins)
 */
export async function getRecentLogs(limit: number = 50): Promise<any[]> {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    // Busca o perfil do usuário para verificar se é admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'adm') {
        return []
    }

    const { data, error } = await supabase
        .from('opportunity_logs')
        .select(`
      id,
      opportunity_id,
      user_id,
      message,
      created_at,
      profiles (
        full_name
      ),
      opportunities (
        title
      )
    `)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent logs:', error)
        return []
    }

    return data || []
}
