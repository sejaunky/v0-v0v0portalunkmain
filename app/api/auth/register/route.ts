import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const supabase = supabaseServer
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data: existingUsers, error: existingError } = await supabase.from('users').select('id').eq('email', email).limit(1)
    if (existingError) throw existingError

    if (existingUsers && existingUsers.length > 0) return NextResponse.json({ error: "User already exists" }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 10)

    const { data: newUsers, error } = await supabase.from('users').insert([{ email, password_hash: passwordHash, name: name || email, role: role || 'user' }]).select()
    if (error) throw error

    const user = newUsers && newUsers[0]

    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
