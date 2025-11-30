import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createClient()

    // Fetch contact record
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, user_id, name, phone, source, interests, status, created_at')
      .eq('id', id)
      .single()

    if (contactError || !contact) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

    // Try to fetch favorites if contact linked to a user
    let favorites: any[] = []
    if (contact.user_id) {
      const { data: favs, error: favErr } = await supabase
        .from('favorites')
        .select('product:products ( id, title )')
        .eq('user_id', contact.user_id)
        .order('created_at', { ascending: false })

      if (!favErr && Array.isArray(favs)) {
        favorites = favs.map((f: any) => ({ product_id: f.product?.id, title: f.product?.title }))
      }
    }

    // Navigation events: not yet implemented — return empty array for now
    const navigation: any[] = []

    return NextResponse.json({ contact, favorites, navigation })
  } catch (err) {
    console.error('clients details error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
