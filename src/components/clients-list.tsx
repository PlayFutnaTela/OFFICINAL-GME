"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, User } from 'lucide-react'

type Contact = {
  id: string
  user_id?: string | null
  name: string
  phone?: string | null
  source?: string | null
  interests?: string | null
  status?: string
  created_at?: string
}

export default function ClientsList({ initialContacts }: { initialContacts: Contact[] }) {
  const [selected, setSelected] = useState<Contact | null>(null)
  const [details, setDetails] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  async function openDetails(contact: Contact) {
    setSelected(contact)
    setDetails(null)
    setLoading(true)
    try {
      const r = await fetch(`/api/clients/${contact.id}/details`)
      if (r.ok) setDetails(await r.json())
      else setDetails({ error: 'Falha ao obter detalhes' })
    } catch (err) {
      setDetails({ error: String(err) })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'quente': return 'bg-red-500'
      case 'morno': return 'bg-yellow-500'
      case 'frio': return 'bg-blue-500'
      default: return 'bg-slate-500'
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {initialContacts.map(contact => (
        <div key={contact.id}>
          <Card className="cursor-pointer" onClick={() => openDetails(contact)}>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <CardTitle className="text-base font-medium">{contact.name}</CardTitle>
              </div>
              <Badge className={getStatusColor(contact.status)}>{contact.status || 'novo'}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{contact.phone || 'Sem telefone'}</div>
                <div className="mt-2"><span className="font-medium">Interesses: </span>{contact.interests || '-'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Modal */}
      {selected && (
        <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) { setSelected(null); setDetails(null) } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected.name}</DialogTitle>
              <DialogDescription>
                Visualize a navegação (quando disponível) e os favoritos associados a este cliente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium">Informações básicas</h4>
                <div className="text-sm text-muted-foreground mt-2">
                  <div><strong>Telefone:</strong> {selected.phone || '—'}</div>
                  <div><strong>Origem:</strong> {selected.source || '—'}</div>
                  <div><strong>Interesses:</strong> {selected.interests || '—'}</div>
                  <div><strong>Status:</strong> {selected.status || '—'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium">Favoritos</h4>
                <div className="mt-2 text-sm text-muted-foreground">
                  {loading ? (
                    <div>Carregando favoritos…</div>
                  ) : details?.favorites && details.favorites.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {details.favorites.map((f: any) => (
                        <li key={f.product_id}>{f.title || f.product_id}</li>
                      ))}
                    </ul>
                  ) : (
                    <div>Nenhum favorito encontrado.</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium">Navegação</h4>
                <div className="mt-2 text-sm text-muted-foreground">
                  {loading ? (
                    <div>Carregando navegação…</div>
                  ) : details?.navigation && details.navigation.length > 0 ? (
                    <ul className="list-decimal pl-5">
                      {details.navigation.map((n: any, idx: number) => (
                        <li key={idx}>{n.path} <span className="text-xs text-muted-foreground ml-2">{n.ts}</span></li>
                      ))}
                    </ul>
                  ) : (
                    <div>Navegação ainda não implementada.</div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setSelected(null); setDetails(null) }}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
