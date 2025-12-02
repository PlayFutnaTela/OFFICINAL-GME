// Lazy-load admin client at runtime to avoid bundling server-only libs into client bundles
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase service role environment variables')
  }

  // require at runtime so bundlers don't include the server-only library into client code
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require('@supabase/supabase-js');

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
