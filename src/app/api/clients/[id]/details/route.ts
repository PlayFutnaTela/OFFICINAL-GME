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
    let profile: any = null
    if (contact.user_id) {
      // get profile info
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, interests')
        .eq('id', contact.user_id)
        .single()

      profile = prof || null
      // If profile has a storage path for avatar, convert to a public URL
      if (profile?.avatar_url) {
        try {
          const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url)
          profile.avatar_url = publicData?.publicUrl || profile.avatar_url
        } catch (e) {
          // ignore — keep original path if getPublicUrl fails
        }
      }

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

    return NextResponse.json({ contact, favorites, navigation, profile })
  } catch (err) {
    console.error('clients details error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
