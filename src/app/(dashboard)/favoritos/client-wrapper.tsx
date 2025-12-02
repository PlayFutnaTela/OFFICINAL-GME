'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useRequireInviteValidation } from '@/hooks/use-require-invite-validation'

export function FavoritosClientWrapper({ children }: { children: React.ReactNode }) {
  const { isChecking } = useRequireInviteValidation()

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return <>{children}</>
}
