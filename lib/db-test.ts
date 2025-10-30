// Database connection test utility
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"

export async function testDatabaseConnection() {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "DATABASE_URL not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) return { success: false, error: "Failed to initialize Supabase client" }

    // Try a simple select against a common table
    const { data, error } = await supabase.from('djs').select('id').limit(1)
    if (error) throw error

    return {
      success: true,
      data: data?.[0] || null,
      message: "Database connection successful!",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function checkTablesExist() {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "DATABASE_URL not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) return { success: false, error: "Failed to initialize Supabase client" }

    const tablesToCheck = ['djs','producers','events','prospeccoes','payments','contracts']
    const found: string[] = []

    for (const t of tablesToCheck) {
      const { error } = await supabase.from(t).select('id').limit(1)
      if (!error) found.push(t)
    }

    return {
      success: true,
      tables: found,
      message: `Found ${found.length} known tables`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
