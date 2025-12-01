"use client"

import React, { useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null)
  const [favorites, setFavorites] = useState<any[] | null>(null)

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
    setSelectedProfile(null)
    setFavorites(null)

    try {
      // Fetch detailed info via server API which returns contact, favorites and profile
      const res = await fetch(`/api/clients/${c.id}/details`)
      if (!res.ok) {
        setFavorites([])
        return
      }

      const data = await res.json()
      // favorites from API: { product_id, title }
      setFavorites(data.favorites ?? [])
      setSelectedProfile(data.profile ?? null)
    } catch (err) {
      setFavorites([])
      setSelectedProfile(null)
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
                      {/* priority: profile avatar -> contact avatar -> default public icon */}
                      <AvatarImage src={selectedProfile?.avatar_url || selected.avatar_url || '/icone-perfil-padrao.png'} alt={selected.name} />
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
                    {favorites.map((f:any, idx:number) => (
                      <li key={f.product_id ?? f.id ?? idx} className="text-sm">
                        {f.product_id ? (
                          // link to product detail
                          <a href={`/oportunidades/${f.product_id}`} className="text-blue-600 hover:underline">{f.title || `Ver produto ${f.product_id}`}</a>
                        ) : (
                          // fallback: product data inside nested products or generic id
                          f.products?.title ? (
                            <a href={`/oportunidades/${f.products.id}`} className="text-blue-600 hover:underline">{f.products.title}</a>
                          ) : (
                            <span>{f.title || f.product_id || f.id}</span>
                          )
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Profile interests */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Interesses</h4>
                  {selectedProfile?.interests && Array.isArray(selectedProfile.interests) && selectedProfile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.interests.map((it: string) => (
                        <span key={it} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-800">{it}</span>
                      ))}
                    </div>
                  ) : selected.interests ? (
                    <div className="text-sm text-muted-foreground">{selected.interests}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nenhum interesse definido</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
