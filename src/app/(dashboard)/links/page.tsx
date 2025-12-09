import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LinksManager } from "@/components/links-manager"
import { getLinks } from "@/actions/links"

export default async function LinksPage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (!profile || profile.role !== "adm") {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                <h1 className="text-2xl font-bold text-destructive mb-2">Acesso Negado</h1>
                <p className="text-muted-foreground">
                    Você não tem permissão para acessar esta página. Apenas administradores podem visualizar este conteúdo.
                </p>
            </div>
        )
    }

    // Fetch links
    let links: Awaited<ReturnType<typeof getLinks>> = []
    try {
        links = await getLinks()
    } catch (error) {
        console.error("Failed to fetch links:", error)
        // We can still render the manager with empty links, or show an error.
        // The manager handles empty state.
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Suspense fallback={<div>Carregando links...</div>}>
                <LinksManager initialLinks={links} />
            </Suspense>
        </div>
    )
}
