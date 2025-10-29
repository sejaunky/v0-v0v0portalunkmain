import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, status } = body

    if (!paymentId || !status) {
      return NextResponse.json({ error: "paymentId and status are required" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const supabase = supabaseServer
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data, error } = await supabase.from('payments').update({ status, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', paymentId).select()
    if (error) throw error

    if (!data || data.length === 0) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    return NextResponse.json({ success: true, payment: data[0] })
  } catch (error) {
    console.error("Error reviewing payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
