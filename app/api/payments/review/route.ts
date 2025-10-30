import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, status, action, eventId, reason } = body

    // Support both paymentId/status and eventId/action legacy payloads
    const id = paymentId || eventId
    let newStatus = status
    if (!newStatus && action) {
      if (action === 'accept') newStatus = 'paid'
      else if (action === 'reject') newStatus = 'rejected'
    }

    if (!id || !newStatus) {
      return NextResponse.json({ error: "paymentId (or eventId) and status (or action) are required" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const supabase = await supabaseServer()
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const updates: any = { status: newStatus, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    if (reason) updates.review_reason = reason

    const { data, error } = await supabase.from('payments').update(updates).eq('id', id).select()
    if (error) throw error

    if (!data || data.length === 0) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    return NextResponse.json({ success: true, payment: data[0] })
  } catch (error: any) {
    console.error("Error reviewing payment:", error)
    const details = error?.message || (typeof error === 'string' ? error : JSON.stringify(error))
    return NextResponse.json({ error: "Internal server error", details: details || "Unknown error" }, { status: 500 })
  }
}
