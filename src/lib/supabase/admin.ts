// Lazy-load admin client at runtime to avoid bundling server-only libs into client bundles
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error('[admin.ts] Missing NEXT_PUBLIC_SUPABASE_URL env var');
    throw new Error('Missing Supabase URL environment variable (NEXT_PUBLIC_SUPABASE_URL)')
  }
  
  if (!key) {
    console.error('[admin.ts] Missing SUPABASE_SERVICE_ROLE_KEY env var');
    throw new Error('Missing Supabase service role key (SUPABASE_SERVICE_ROLE_KEY). This is a server-only secret.')
  }

  // require at runtime so bundlers don't include the server-only library into client code
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require('@supabase/supabase-js');

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
