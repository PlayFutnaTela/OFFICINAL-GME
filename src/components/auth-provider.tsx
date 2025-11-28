'use client'

import { useEffect } from 'react'
import { createClient as createBrowserSupabase } from '@/lib/supabase/client'

// Create a provider component that handles session hydration
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // The session is already provided by the server in window.__SUPABASE_INITIAL_SESSION
    // The Supabase client will automatically pick it up
    const supabase = createBrowserSupabase()

    // Set up auth state change listener to handle session updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
        // Update the global session for any new sessions
        (window as any).__SUPABASE_INITIAL_SESSION = session
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return <>{children}</>
}