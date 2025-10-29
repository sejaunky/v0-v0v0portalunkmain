import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

let _supabase: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase client (server) should only be used on the server side')
  }

  if (!_supabase) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return null as any
    }
    _supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  }

  return _supabase
}

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY)

export const supabaseServer = (() => {
  try {
    return getSupabase()
  } catch {
    return null as any
  }
})()

export default supabaseServer
