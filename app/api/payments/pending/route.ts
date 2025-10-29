import { NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured. Please connect to Supabase.")
      return NextResponse.json({ payments: [], warning: "Database not configured" }, { status: 200 })
    }

    const supabase = supabaseServer
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data, error } = await supabase.from('payments').select('*').eq('status', 'pending').order('created_at', { ascending: false })
    if (error) throw error

    return NextResponse.json({ payments: data || [] })
  } catch (error) {
    console.error("Failed to load pending payments:", error)
    return NextResponse.json({
      error: "Failed to load pending payments",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
