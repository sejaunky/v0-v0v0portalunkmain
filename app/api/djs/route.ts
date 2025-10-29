import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured.")
      return NextResponse.json({ djs: [], warning: "Database not configured" }, { status: 200 })
    }

    const supabase = supabaseServer
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    // Try ordering by artist_name, fallback to name
    let { data, error } = await supabase.from('djs').select('*').order('artist_name', { ascending: true })

    if (error && String(error.message || '').toLowerCase().includes('column') ) {
      const fallback = await supabase.from('djs').select('*, name as artist_name').order('name', { ascending: true })
      data = fallback.data
    }

    return NextResponse.json({ djs: data || [] })
  } catch (error) {
    console.error("Failed to fetch DJs:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch DJs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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
    const supabase = supabaseServer
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    // Normalize status
    if (payload.status && typeof payload.status === "string") {
      const statusMap: Record<string, string> = {
        ativo: "ativo",
        inativo: "inativo",
        ocupado: "ocupado",
        active: "ativo",
        inactive: "inativo",
        busy: "ocupado",
      }
      const normalizedStatus = payload.status.toLowerCase()
      payload.status = statusMap[normalizedStatus] || "ativo"
    }

    const { data: result, error } = await supabase.from('djs').insert([{
      artist_name: payload.artist_name,
      real_name: payload.real_name,
      email: payload.email,
      genre: payload.genre,
      base_price: payload.base_price,
      instagram_url: payload.instagram_url,
      youtube_url: payload.youtube_url,
      tiktok_url: payload.tiktok_url,
      soundcloud_url: payload.soundcloud_url,
      birth_date: payload.birth_date,
      status: payload.status || 'ativo',
      is_active: payload.is_active !== false,
      avatar_url: payload.avatar_url || null,
      phone: payload.phone || null,
      cpf: payload.cpf || null,
      pix_key: payload.pix_key || null,
      bank_name: payload.bank_name || null,
      bank_agency: payload.bank_agency || null,
      bank_account: payload.bank_account || null,
      notes: payload.notes || null,
    }]).select()

    if (error) throw error

    return NextResponse.json({ dj: result && result[0] })
  } catch (error) {
    console.error("Failed to create DJ:", error)
    return NextResponse.json(
      {
        error: "Failed to create DJ",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isNeonConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { id, ...payload } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "DJ ID is required" }, { status: 400 })
    }

    const sql = getSql()

    if (!sql) {
      throw new Error("Failed to initialize database connection")
    }

    // Normalize status
    if (payload.status && typeof payload.status === "string") {
      const statusMap: Record<string, string> = {
        ativo: "ativo",
        inativo: "inativo",
        ocupado: "ocupado",
        active: "ativo",
        inactive: "inativo",
        busy: "ocupado",
      }
      const normalizedStatus = payload.status.toLowerCase()
      payload.status = statusMap[normalizedStatus] || "ativo"
    }

    const result = await sql`
      UPDATE djs
      SET
        artist_name = ${payload.artist_name},
        real_name = ${payload.real_name},
        email = ${payload.email},
        genre = ${payload.genre},
        base_price = ${payload.base_price},
        instagram_url = ${payload.instagram_url},
        youtube_url = ${payload.youtube_url},
        tiktok_url = ${payload.tiktok_url},
        soundcloud_url = ${payload.soundcloud_url},
        birth_date = ${payload.birth_date},
        status = ${payload.status},
        is_active = ${payload.is_active},
        avatar_url = ${payload.avatar_url},
        phone = ${payload.phone},
        cpf = ${payload.cpf},
        pix_key = ${payload.pix_key},
        bank_name = ${payload.bank_name},
        bank_agency = ${payload.bank_agency},
        bank_account = ${payload.bank_account},
        notes = ${payload.notes},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "DJ not found" }, { status: 404 })
    }

    return NextResponse.json({ dj: result[0] })
  } catch (error) {
    console.error("Failed to update DJ:", error)
    return NextResponse.json(
      {
        error: "Failed to update DJ",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
