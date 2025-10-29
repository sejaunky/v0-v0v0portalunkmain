import { NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured. Please connect to Supabase.")
      return NextResponse.json({ contracts: [], warning: "Database not configured" }, { status: 200 })
    }

    const supabase = supabaseServer
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false })
    if (error) throw error

    return NextResponse.json({ contracts: data || [] })
  } catch (error: any) {
    console.error("Failed to load contracts:", error)
    const details = error?.message || (typeof error === 'string' ? error : JSON.stringify(error))
    return NextResponse.json({ error: "Failed to load contracts", details: details || "Unknown error" }, { status: 500 })
  }
}
