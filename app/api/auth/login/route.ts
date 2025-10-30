import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data: users, error } = await supabase.from('users').select('id, email, password_hash, role, name').eq('email', email).limit(1)
    if (error) throw error

    if (!users || users.length === 0) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const user = users[0]

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
