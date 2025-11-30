import { createClient } from "@/lib/supabase/server"
import { requireAdminOrRedirect } from '@/lib/server-admin'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Phone, User } from "lucide-react"
import Link from "next/link"
import ClientsList from '@/components/clients-list'

export default async function ClientsPage() {
  const supabase = createClient()

  // Only admins can access clients list
  await requireAdminOrRedirect(supabase)
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quente': return 'bg-red-500 hover:bg-red-600'
      case 'morno': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'frio': return 'bg-blue-500 hover:bg-blue-600'
      default: return 'bg-slate-500 hover:bg-slate-600'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <Link href="/clientes/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <div>
        {/* Client side list with modal details */}
        <ClientsList initialContacts={contacts ?? []} />
      </div>
    </div>
  )
}
