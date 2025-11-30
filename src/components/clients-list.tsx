"use client"

import React, { useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Contact = {
  id: string
  name: string
  phone?: string | null
  interests?: string | null
  source?: string | null
  status?: string
  user_id?: string | null
  avatar_url?: string | null
}

type Props = {
  initialContacts: Contact[]
}

export default function ClientsList({ initialContacts }: Props) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Contact | null>(null)
  const [favorites, setFavorites] = useState<any[] | null>(null)
  const supabase = createClient()

  const results = useMemo(() => {
    if (!q) return initialContacts ?? []
    const lower = q.toLowerCase()
    return (initialContacts || []).filter(c => (
      c.name?.toLowerCase().includes(lower) ||
      c.phone?.toLowerCase().includes(lower) ||
      c.interests?.toLowerCase().includes(lower) ||
      c.source?.toLowerCase().includes(lower)
    ))
  }, [q, initialContacts])

  async function openProfile(c: Contact) {
    setSelected(c)
    // load favorites for this profile (user_id) — optional, best effort
    if (c.user_id) {
      try {
        const { data } = await supabase.from('favorites').select('*, products(*)').eq('user_id', c.user_id)
        setFavorites(data ?? [])
      } catch (err) {
        setFavorites([])
      }
    } else {
      setFavorites([])
    }
  }

  const cardShadow = '0 10px 30px rgba(212,175,55,0.14)'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, telefone ou interesses..." className="pl-10 w-full border rounded-md py-2 px-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(contact => (
          <div
            key={contact.id}
            onClick={() => openProfile(contact)}
            role="button"
            className="bg-white rounded-lg p-4 cursor-pointer transition-transform transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(212,175,55,0.18)]"
            style={{ boxShadow: cardShadow }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <Avatar style={{ height: 56, width: 56 }} className="border-2 border-white shadow-sm">
                  {contact.avatar_url ? (
                    <AvatarImage src={contact.avatar_url} alt={contact.name} />
                  ) : (
                    <AvatarFallback className="bg-gray-100 text-gray-500">{contact.name?.split(' ').map((n,i)=> i<2 ? n[0] : '').join('').slice(0,2)}</AvatarFallback>
                  )}
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{contact.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{contact.status ?? 'novo'}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">{contact.phone ?? 'Sem telefone'}</div>
                {contact.interests && <div className="text-sm text-muted-foreground mt-2"><span className="font-medium">Interesses:</span> {contact.interests}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 z-10">
            <div className="flex justify-between items-start gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                    <Avatar style={{ height: 64, width: 64 }}>
                    {selected.avatar_url ? <AvatarImage src={selected.avatar_url} alt={selected.name} /> : <AvatarFallback>{selected.name?.split(' ').map(n=>n[0]).slice(0,2).join('')}</AvatarFallback>}
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selected.name}</h3>
                  <div className="text-sm text-muted-foreground">{selected.phone ?? 'Sem telefone'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Navegação (breve)</h4>
                <div className="text-sm text-muted-foreground">Os registros de navegação desse cliente serão exibidos aqui (próxima etapa de implementação).</div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Favoritos</h4>
                {favorites === null ? (
                  <div className="text-sm text-muted-foreground">Carregando…</div>
                ) : favorites.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Nenhum favorito encontrado para esse perfil</div>
                ) : (
                  <ul className="space-y-2">
                    {favorites.map((f:any) => (
                      <li key={f.id} className="text-sm">{f.product_id || f.products?.title || f.id}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
