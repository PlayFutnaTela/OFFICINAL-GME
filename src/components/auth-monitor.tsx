"use client"

import { useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function AuthMonitor() {
  useEffect(() => {
    const supabase = createClient()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.debug('AuthMonitor event:', event, { session })

      if (event === 'SIGNED_OUT') {
        console.info('AuthMonitor: user signed out (event SIGNED_OUT)')
        toast.info('Você foi desconectado. Caso não tenha saído manualmente, verifique sua sessão e tente entrar novamente.')
      } else if (event === 'SIGNED_IN') {
        console.info('AuthMonitor: user signed in')
      } else if (event === 'USER_UPDATED') {
        console.info('AuthMonitor: dados do usuário atualizados')
      } else {
        console.debug('AuthMonitor: other auth event', event)
      }
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  return null
}
