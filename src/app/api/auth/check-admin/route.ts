import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Evita tentativa de pre-render e uso estático (usa cookies)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Pegar o usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }
    
    // Verificar o role do usuário na tabela profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
    
    if (error) {
      console.error('Erro ao verificar role:', error)
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }
    
    const profileData = Array.isArray(profile) ? profile[0] : profile
    const isAdmin = profileData?.role === 'adm'
    
    return NextResponse.json({ isAdmin }, { status: 200 })
  } catch (error) {
    console.error('Erro em check-admin:', error)
    return NextResponse.json({ isAdmin: false }, { status: 200 })
  }
}
