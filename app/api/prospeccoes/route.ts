import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ prospeccoes: [], warning: "Database not configured" }, { status: 200 })
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase.from('prospeccoes').select('*').order('created_at', { ascending: false })
    if (error) throw error

    return NextResponse.json({ prospeccoes: data || [] })
  } catch (error) {
    console.error("Failed to fetch prospeccoes:", error)
    return NextResponse.json(
      { error: "Failed to fetch prospeccoes", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const payload = await request.json()
    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data: result, error } = await supabase.from('prospeccoes').insert([{
      title: payload.title,
      description: payload.description || null,
      location: payload.location || null,
      data: payload.data || null,
      budget: payload.budget || null,
      client_name: payload.client_name || null,
      client_contact: payload.client_contact || null,
      dj_id: payload.dj_id || null,
      dj_name: payload.dj_name || null,
      status: payload.status || 'prospecção',
    }]).select()

    if (error) throw error

    return NextResponse.json({ prospeccao: result && result[0] })
  } catch (error) {
    console.error("Failed to create prospeccao:", error)
    return NextResponse.json(
      { error: "Failed to create prospeccao", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    )
  }
}
