import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const supabase = await supabaseServer()
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data, error } = await supabase.from('events').update({ payment_status: 'paid', updated_at: new Date().toISOString() }).eq('id', eventId).select()
    if (error) throw error

    if (!data || data.length === 0) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    return NextResponse.json({ success: true, event: data[0] })
  } catch (error) {
    console.error("Error marking event as paid:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
