"use client"

import { useEffect } from 'react'
import type { AuthChangeEvent } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type ExtendedAuthEvent = AuthChangeEvent | 'USER_DELETED' | 'TOKEN_REFRESH_FAILED'

export default function AuthMonitor() {
  useEffect(() => {
    const supabase = createClient()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const authEvent = event as ExtendedAuthEvent
      console.debug('AuthMonitor event:', authEvent, { session })

      switch (authEvent) {
        case 'SIGNED_OUT':
          console.info('AuthMonitor: user signed out (event SIGNED_OUT)')
          toast.info('Você foi desconectado. Caso não tenha saído manualmente, verifique sua sessão e tente entrar novamente.')
          break
        case 'SIGNED_IN':
          console.info('AuthMonitor: user signed in')
          break
        case 'TOKEN_REFRESHED':
          console.info('AuthMonitor: session token refreshed')
          break
        case 'TOKEN_REFRESH_FAILED':
          console.warn('AuthMonitor: token refresh failed — session pode ter expirado')
          toast.error('Sua sessão expirou. Por favor, faça login novamente.')
          break
        case 'USER_UPDATED':
          console.info('AuthMonitor: dados do usuário atualizados')
          break
        case 'USER_DELETED':
          console.warn('AuthMonitor: conta de usuário removida do provedor de autenticação')
          toast.error('Conta removida. Contacte o administrador se isso foi um engano.')
          break
        default:
          console.debug('AuthMonitor: other auth event', authEvent)
      }
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  return null
}
