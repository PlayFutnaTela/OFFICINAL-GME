import { requireAdminOrRedirect } from '@/lib/server-admin'
import NewContactForm from '@/components/new-contact-form'
import { createClient } from '@/lib/supabase/server'

export default async function NewClientPage() {
  const supabase = createClient()

  // Only admins can create clients
  await requireAdminOrRedirect(supabase)

  return <NewContactForm />
}
