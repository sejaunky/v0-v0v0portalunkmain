import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const supabase = supabaseServer
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { error } = await supabase.from('users').update({ password: hashedPassword, updated_at: new Date().toISOString() }).eq('email', email)
    if (error) throw error

    return NextResponse.json({ success: true, message: "Password reset successfully", tempPassword })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
