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

    console.log(`[createLog] Tentando criar log para opportunity_id: ${opportunity_id}, user: ${user?.id}`)

    const { error, data } = await supabase.from('opportunity_logs').insert({
        opportunity_id,
        user_id: user?.id || null,
        message,
    }).select()

    if (error) {
        console.error(`[createLog] ERRO ao criar log para ${opportunity_id}:`, error)
        console.error(`[createLog] Detalhes do erro:`, JSON.stringify(error, null, 2))
        // Não lançar erro para não quebrar a operação principal
    } else {
        console.log(`[createLog] Log criado com sucesso para ${opportunity_id}:`, data)
    }
}

/**
 * Busca todos os logs de uma oportunidade
 */
export async function getOpportunityLogs(opportunity_id: string): Promise<any[]> {
    const supabase = createClient()

    console.log(`[getOpportunityLogs] Buscando logs para opportunity_id: ${opportunity_id}`)

    // Tentar usar a função SQL que ignora RLS
    const { data, error } = await supabase
        .rpc('get_opportunity_logs', { p_opportunity_id: opportunity_id })

    if (error) {
        console.error(`[getOpportunityLogs] ERRO ao buscar logs com RPC para ${opportunity_id}:`, error)
        console.error(`[getOpportunityLogs] Detalhes do erro:`, JSON.stringify(error, null, 2))
        
        // Fallback: tentar query direta (sem RLS)
        console.log(`[getOpportunityLogs] Tentando fallback com query direta...`)
        const { data: fallbackData, error: fallbackError } = await supabase
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
        
        if (fallbackError) {
            console.error(`[getOpportunityLogs] ERRO no fallback também:`, fallbackError)
            return []
        }
        
        console.log(`[getOpportunityLogs] Fallback funcionou! Encontrados ${fallbackData?.length || 0} logs`)
        return fallbackData || []
    }

    console.log(`[getOpportunityLogs] Encontrados ${data?.length || 0} logs para ${opportunity_id}:`, data)
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
