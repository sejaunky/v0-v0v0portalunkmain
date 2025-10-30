import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, djId, producerId } = body

    if (!eventId || !djId || !producerId) {
      return NextResponse.json({ error: "eventId, djId, and producerId are required" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const supabase = await supabaseServer()
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data: result, error } = await supabase.from('contract_instances').insert([{ event_id: eventId, dj_id: djId, producer_id: producerId, signature_status: 'pending' }]).select()
    if (error) throw error

    return NextResponse.json({ success: true, contract: result && result[0] })
  } catch (error) {
    console.error("Error creating contracts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
