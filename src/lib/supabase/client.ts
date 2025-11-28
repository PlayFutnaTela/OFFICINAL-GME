import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Create the browser client without initial session
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return null
          const match = document.cookie.split('; ').find(row => row.startsWith(name + '='))
          const value = match ? match.split('=').slice(1).join('=') : null
          const decoded = value ? decodeURIComponent(value) : null
          if (process.env.NODE_ENV !== 'production') {
            console.debug('supabase: cookie.get', { name, value: decoded })
          }
          return decoded
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return
          const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
          const maxAge = options?.maxAge ?? 31536000
          const parts = [`${name}=${value}`, `path=/`, `max-age=${maxAge}`, `samesite=lax`]
          if (isSecure || process.env.NODE_ENV === 'production') parts.push('secure')
          const cookieString = parts.join('; ')
          if (process.env.NODE_ENV !== 'production') console.debug('supabase: cookie.set', { name, value, options, cookieString })
          document.cookie = cookieString
        },
        remove(name: string) {
          if (typeof document === 'undefined') return
          if (process.env.NODE_ENV !== 'production') console.debug('supabase: cookie.remove', { name })
          document.cookie = `${name}=; path=/; max-age=0`
        },
      },
    }
  )
}
