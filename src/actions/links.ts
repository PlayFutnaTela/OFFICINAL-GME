"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Link = {
    id: string
    title: string
    url: string
    thumbnail_url: string | null
    abbreviation: string | null
    created_at: string
}

export type CreateLinkData = {
    title: string
    url: string
    thumbnail_url?: string
    abbreviation?: string
}

export type UpdateLinkData = {
    title?: string
    url?: string
    thumbnail_url?: string
    abbreviation?: string
}

async function checkAdmin() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (!profile || profile.role !== "adm") {
        throw new Error("Acesso negado: Apenas administradores podem realizar esta ação")
    }

    return supabase
}

async function fetchMetadata(url: string): Promise<string | null> {
    try {
        const targetUrl = url.startsWith('http') ? url : `https://${url}`
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'bot-crawler',
            },
            next: { revalidate: 3600 }
        })

        if (!response.ok) return null

        const html = await response.text()

        const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
        if (ogImageMatch && ogImageMatch[1]) {
            return ogImageMatch[1]
        }

        const twitterImageMatch = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i)
        if (twitterImageMatch && twitterImageMatch[1]) {
            return twitterImageMatch[1]
        }

        // Try to find apple-touch-icon or icon
        const iconMatch = html.match(/<link\s+rel="(?:shortcut )?icon"\s+href="([^"]+)"/i)
        if (iconMatch && iconMatch[1]) {
            const iconUrl = iconMatch[1]
            if (iconUrl.startsWith('http')) return iconUrl
            // Handle relative URLs
            const urlObj = new URL(targetUrl)
            return `${urlObj.protocol}//${urlObj.host}${iconUrl.startsWith('/') ? '' : '/'}${iconUrl}`
        }

        return null
    } catch (error) {
        console.error("Error fetching metadata for URL:", url, error)
        return null
    }
}

export async function getLinks(): Promise<Link[]> {
    const supabase = await checkAdmin()

    const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching links:", error)
        throw new Error("Erro ao buscar links")
    }

    return data as Link[]
}

export async function createLink(data: CreateLinkData): Promise<Link> {
    const supabase = await checkAdmin()

    // Auto-fetch thumbnail
    const fetchedThumbnail = await fetchMetadata(data.url)
    const thumbnail_url = fetchedThumbnail || data.thumbnail_url || null

    const { data: inserted, error } = await supabase
        .from("links")
        .insert({
            ...data,
            thumbnail_url
        })
        .select()
        .single()

    if (error) {
        console.error("Error creating link:", error)
        throw new Error("Erro ao criar link")
    }

    revalidatePath("/links")
    return inserted as Link
}

export async function updateLink(id: string, data: UpdateLinkData): Promise<Link> {
    const supabase = await checkAdmin()

    let updateData: any = { ...data }

    // If URL is being updated, re-fetch thumbnail
    if (data.url) {
        const fetchedThumbnail = await fetchMetadata(data.url)
        if (fetchedThumbnail) {
            updateData.thumbnail_url = fetchedThumbnail
        }
    }

    const { data: updated, error } = await supabase
        .from("links")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

    if (error) {
        console.error("Error updating link:", error)
        throw new Error("Erro ao atualizar link")
    }

    revalidatePath("/links")
    return updated as Link
}

export async function deleteLink(id: string): Promise<void> {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting link:", error)
        throw new Error("Erro ao deletar link")
    }

    revalidatePath("/links")
}
