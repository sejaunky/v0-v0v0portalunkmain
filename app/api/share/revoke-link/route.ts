import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"

export async function POST(request: NextRequest) {
  try {
    const { shareId } = await request.json()

    if (!shareId) {
      return NextResponse.json({ error: "shareId is required" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const supabase = await supabaseServer()
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data, error } = await supabase.from('share_links').update({ revoked: true, updated_at: new Date().toISOString() }).eq('id', shareId).select()
    if (error) throw error

    if (!data || data.length === 0) return NextResponse.json({ error: 'Share link not found' }, { status: 404 })

    return NextResponse.json({ success: true, shareLink: data[0] })
  } catch (error) {
    console.error("Error revoking share link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
