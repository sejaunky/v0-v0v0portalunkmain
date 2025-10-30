import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ producers: [], warning: "Database not configured" }, { status: 200 })
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase.from('producers').select('*').order('created_at', { ascending: false })
    if (error) throw error

    const normalized = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name || p.name,
      email: p.email || null,
      company: p.company_name || p.company || null,
      phone: p.phone || null,
      status: p.status || "active",
      avatar_url: p.avatar_url || null,
      cnpj: p.cnpj || null,
      address: p.address || null,
      notes: p.notes || null,
    }))

    return NextResponse.json({ producers: normalized })
  } catch (error) {
    console.error("Failed to fetch producers:", error)
    return NextResponse.json(
      { error: "Failed to fetch producers", details: error instanceof Error ? error.message : "Unknown" },
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

    // If email+password provided, create a user record in users table
    if (payload.email && payload.password) {
      try {
        const { data: existingUsers } = await supabase.from('users').select('id').eq('email', payload.email).limit(1)
        if (!existingUsers || existingUsers.length === 0) {
          const passwordHash = await bcrypt.hash(String(payload.password), 10)
          const { data: newUsers, error: userErr } = await supabase.from('users').insert([{ email: payload.email, password_hash: passwordHash, name: payload.name, role: 'producer' }]).select()
          if (userErr) console.error('Failed to create user for producer:', userErr)
        }
      } catch (err) {
        console.error('Error creating user for producer:', err)
      }
    }

    const { data: result, error } = await supabase.from('producers').insert([{
      name: payload.name,
      email: payload.email || null,
      company_name: payload.company || null,
      phone: payload.phone || null,
      status: payload.status || 'active',
      avatar_url: payload.avatar_url || null,
      cnpj: payload.cnpj || null,
      address: payload.address || null,
      notes: payload.notes || null,
    }]).select()

    if (error) throw error

    const created = result && result[0]

    const normalized = {
      id: created.id,
      name: created.name,
      email: created.email || null,
      company: created.company_name || null,
      phone: created.phone || null,
      status: created.status || "active",
      avatar_url: created.avatar_url || null,
      cnpj: created.cnpj || null,
      address: created.address || null,
      notes: created.notes || null,
    }

    return NextResponse.json({ producer: normalized })
  } catch (error) {
    console.error("Failed to create producer:", error)
    return NextResponse.json(
      { error: "Failed to create producer", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { id, ...payload } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Producer ID is required" }, { status: 400 })
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data: result, error } = await supabase.from('producers').update([{ name: payload.name, email: payload.email, company_name: payload.company, phone: payload.phone, status: payload.status, avatar_url: payload.avatar_url, cnpj: payload.cnpj, address: payload.address, notes: payload.notes }]).eq('id', id).select()
    if (error) throw error

    if (!result || result.length === 0) return NextResponse.json({ error: 'Producer not found' }, { status: 404 })

    const updated = result[0]

    const normalized = {
      id: updated.id,
      name: updated.name,
      email: updated.email || null,
      company: updated.company_name || null,
      phone: updated.phone || null,
      status: updated.status || "active",
      avatar_url: updated.avatar_url || null,
      cnpj: updated.cnpj || null,
      address: updated.address || null,
      notes: updated.notes || null,
    }

    return NextResponse.json({ producer: normalized })
  } catch (error) {
    console.error("Failed to update producer:", error)
    return NextResponse.json(
      { error: "Failed to update producer", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    )
  }
}
