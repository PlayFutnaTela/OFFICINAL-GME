"use server"

import { createClient } from '@/lib/supabase/server'

export type UserProfile = {
    id: string
    full_name: string | null
}

/**
 * Busca todos os usuários para seleção (apenas perfis básicos)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Usuário não autenticado')
    }

    // Busca todos os perfis
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name', { ascending: true })

    if (error) {
        console.error('Error fetching users:', error)
        throw error
    }

    return profiles || []
}

/**
 * Busca todas as oportunidades para seleção
 */
export async function getAllOpportunities(): Promise<Array<{ id: string; title: string; category: string }>> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('opportunities')
        .select('id, title, category')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching opportunities:', error)
        throw error
    }

    return data || []
}
