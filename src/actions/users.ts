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
 * Busca todas as oportunidades e produtos para seleção
 */
export async function getAllItems(): Promise<Array<{ id: string; title: string; category: string; type: 'opportunity' | 'product' }>> {
    const supabase = createClient()

    const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('id, title, category')
        .order('created_at', { ascending: false })

    if (oppError) {
        console.error('Error fetching opportunities:', oppError)
        throw oppError
    }

    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, title, category')
        .order('created_at', { ascending: false })

    if (prodError) {
        console.error('Error fetching products:', prodError)
        throw prodError
    }

    const formattedOpportunities = (opportunities || []).map(opp => ({
        ...opp,
        type: 'opportunity' as const
    }))

    const formattedProducts = (products || []).map(prod => ({
        ...prod,
        type: 'product' as const
    }))

    return [...formattedOpportunities, ...formattedProducts]
}
