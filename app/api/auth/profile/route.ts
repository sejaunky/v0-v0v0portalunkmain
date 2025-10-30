import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase.server"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = await supabaseServer()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    // Try to find role in profiles table (common Supabase pattern: profiles.id references auth.users.id)
    let role: string | null = null
    let profile: any = null

    // Attempt profiles by id
    const { data: profById, error: profByIdErr } = await supabase
      .from("profiles")
      .select("id, role, user_id")
      .eq("id", userId)
      .maybeSingle()

    if (profById && !profByIdErr) {
      profile = profById
      role = (profById as any)?.role ?? null
    }

    // If not found, attempt profiles by user_id (alternate schema)
    if (!profile) {
      const { data: profByUserId } = await supabase
        .from("profiles")
        .select("id, role, user_id")
        .eq("user_id", userId)
        .maybeSingle()
      if (profByUserId) {
        profile = profByUserId
        role = (profByUserId as any)?.role ?? null
      }
    }

    // Fallback to users table if needed
    if (!role) {
      const { data: userRow } = await supabase
        .from("users")
        .select("id, role")
        .eq("id", userId)
        .maybeSingle()
      if (userRow && (userRow as any)?.role) {
        role = (userRow as any).role
      }
    }

    if (!profile && !role) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ profile: { id: profile?.id ?? userId, role: role } }, { status: 200 })
  } catch (err) {
    console.error("/api/auth/profile error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
