import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const supabase = await supabaseServer()
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const resetToken = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase.from('profiles').update({ reset_token: resetToken, reset_token_expires: expires }).eq('email', email).select()

    if (error) throw error

    if (data && data.length > 0) {
      return NextResponse.json({ success: true, message: 'Reset link sent to your email' })
    }

    return NextResponse.json({ error: 'Email not found' }, { status: 404 })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
