'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient as createBrowserSupabase } from '@/lib/supabase/client'

// Create context for session data
const SessionContext = createContext<any>(null)

// Async component to fetch session
async function fetchSession() {
  try {
    const supabase = createBrowserSupabase()
    const { data } = await supabase.auth.getSession()
    return data?.session ?? null
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}

// Component to handle session fetching with React Suspense
function SessionFetcher() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSession().then((fetchedSession) => {
      setSession(fetchedSession)
      if (fetchedSession) {
        (window as any).__SUPABASE_INITIAL_SESSION = fetchedSession
      }
      setLoading(false)
    })
  }, [])

  if (loading) {
    return null // Render nothing while loading
  }

  return null // This component just fetches and sets up session
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export function SessionProvider({ children }: { children: ReactNode }) {
  // Set up auth state change listener to handle session updates
  useEffect(() => {
    const supabase = createBrowserSupabase()
    
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

  return (
    <SessionContext.Provider value={{ /* session state */ }}>
      <SessionFetcher />
      {children}
    </SessionContext.Provider>
  )
}