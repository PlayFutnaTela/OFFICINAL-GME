"use client"

import { useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function AuthMonitor() {
  useEffect(() => {
    const supabase = createClient()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.debug('AuthMonitor event:', event, { session })

      switch (event) {
        case 'SIGNED_OUT':
          console.info('AuthMonitor: user signed out (event SIGNED_OUT)')
          toast.info('Você foi desconectado. Caso não tenha saído manualmente, verifique sua sessão e tente entrar novamente.')
          break
        case 'USER_DELETED':
          console.warn('AuthMonitor: user account deleted from auth provider')
          toast.error('Conta removida. Contacte o administrador se isso foi um erro.')
          break
        case 'SIGNED_IN':
          console.info('AuthMonitor: user signed in')
          break
        default:
          // debug for other events
          if (event === 'TOKEN_REFRESHED') {
            console.info('AuthMonitor: session token refreshed com sucesso')
          } else {
            console.debug('AuthMonitor: other auth event', event)
          }
      }
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  return null
}
