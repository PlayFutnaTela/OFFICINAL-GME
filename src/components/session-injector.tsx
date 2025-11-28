'use client'

import { useEffect } from 'react'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

// Componente para injetar a sessão inicial no cliente de forma assíncrona
export default function SessionInjector() {
  useEffect(() => {
    // Fetch session and inject it into the window object
    const fetchAndInjectSession = async () => {
      try {
        const supabase = createServerSupabase()
        const { data } = await supabase.auth.getSession()
        const initialSession = data?.session ?? null
        
        // Inject initial session for client to consume when createClient() is called without explicit initialSession
        if (initialSession) {
          (window as any).__SUPABASE_INITIAL_SESSION = initialSession
        }
      } catch (e) {
        console.error('Error fetching session:', e)
      }
    }

    fetchAndInjectSession()
  }, [])

  return null
}