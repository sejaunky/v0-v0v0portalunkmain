import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { djId, producerId, expiryDays = 7, password } = body

    if (!djId || !producerId) {
      return NextResponse.json({ error: "djId and producerId are required" }, { status: 400 })
    }

    const shareToken = crypto.randomBytes(32).toString("hex")
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + expiryDays)

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const supabase = await supabaseServer()
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const { data: result, error } = await supabase.from('share_links').insert([{ dj_id: djId, producer_id: producerId, share_token: shareToken, expires_at: expiryDate.toISOString(), password: password || null }]).select()
    if (error) throw error

    return NextResponse.json({ success: true, shareLink: result && result[0], shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/share/${shareToken}` })
  } catch (error) {
    console.error("Error creating share link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
