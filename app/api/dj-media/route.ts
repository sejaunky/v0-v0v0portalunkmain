import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ media: [] }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const djId = searchParams.get("djId")

    if (!djId) {
      return NextResponse.json({ error: "DJ ID is required" }, { status: 400 })
    }

    const supabase = supabaseServer
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data: media, error } = await supabase.from('dj_media').select('*').eq('dj_id', djId).order('created_at', { ascending: false })
    if (error) throw error

    return NextResponse.json({ media: media || [] })
  } catch (error) {
    console.error("Failed to fetch DJ media:", error)
    return NextResponse.json({ media: [] }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const payload = await request.json()
    const supabase = supabaseServer
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data: result, error } = await supabase.from('dj_media').insert([{
      dj_id: payload.dj_id,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      file_url: payload.file_url,
      external_link: payload.external_link,
    }]).select()

    if (error) throw error

    return NextResponse.json({ media: result && result[0] })
  } catch (error) {
    console.error("Failed to create DJ media:", error)
    return NextResponse.json(
      {
        error: "Failed to create DJ media",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 })
    }

    const supabase = supabaseServer
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { error } = await supabase.from('dj_media').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete DJ media:", error)
    return NextResponse.json(
      {
        error: "Failed to delete DJ media",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
