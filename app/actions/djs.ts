"use server"

import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export interface DJ {
  id: number
  name: string
  artistic_name: string
  email?: string
  phone?: string
  cpf?: string
  bio?: string
  specializations?: string[]
  equipment?: string[]
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  spotify?: string
  soundcloud?: string
  status?: string
  profile_image_url?: string
  backdrop_url?: string
  logo_url?: string
  city?: string
  state?: string
  pix_key?: string
  bank_name?: string
  bank_agency?: string
  bank_account?: string
  created_at?: string
  updated_at?: string
}

export async function getDJs(): Promise<DJ[]> {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured.")
      return []
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    let { data, error } = await supabase
      .from('djs')
      .select('*')
      .order('artist_name', { ascending: true })

    if (error && String(error.message || '').toLowerCase().includes('column')) {
      const fallback = await supabase
        .from('djs')
        .select('*, name as artist_name')
        .order('name', { ascending: true })
      data = fallback.data
    }

    return data || []
  } catch (error) {
    console.error("Failed to fetch DJs:", error)
    return []
  }
}

export async function getDJById(id: number): Promise<DJ | null> {
  try {
    if (!isSupabaseConfigured()) {
      return null
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('djs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching DJ:", error)
    return null
  }
}

export async function createDJ(data: Partial<DJ> & { password?: string }): Promise<{ success: boolean; error?: string; dj?: DJ }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const statusMap: Record<string, string> = {
      ativo: "ativo",
      inativo: "inativo",
      ocupado: "ocupado",
      active: "ativo",
      inactive: "inativo",
      busy: "ocupado",
    }

    const normalizedStatus = data.status ?
      (statusMap[data.status.toLowerCase()] || "ativo") :
      "ativo"

    if (data.email && data.password) {
      try {
        const { data: existingUsers } = await supabase
          .from('users')
          .select('id')
          .eq('email', data.email)
          .limit(1)

        if (!existingUsers || existingUsers.length === 0) {
          const passwordHash = await bcrypt.hash(data.password, 10)
          const { error: userErr } = await supabase
            .from('users')
            .insert([{
              email: data.email,
              password_hash: passwordHash,
              name: data.name || data.artistic_name,
              role: 'dj'
            }])

          if (userErr) {
            console.error('Failed to create user for DJ:', userErr)
          }
        }
      } catch (err) {
        console.error('Error creating user for DJ:', err)
      }
    }

    const { data: result, error } = await supabase
      .from('djs')
      .insert([{
        artist_name: data.artistic_name,
        real_name: data.name,
        email: data.email,
        genre: (data as any).genre,
        base_price: (data as any).base_price,
        instagram_url: data.instagram,
        youtube_url: data.youtube,
        tiktok_url: (data as any).tiktok,
        soundcloud_url: data.soundcloud,
        birth_date: (data as any).birth_date,
        status: normalizedStatus,
        is_active: (data as any).is_active !== false,
        avatar_url: data.profile_image_url || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        pix_key: data.pix_key || null,
        bank_name: data.bank_name || null,
        bank_agency: data.bank_agency || null,
        bank_account: data.bank_account || null,
        notes: data.bio || null,
      }])
      .select()

    if (error) throw error

    revalidatePath('/admin/dashboard/djs')

    return { success: true, dj: result && result[0] }
  } catch (error) {
    console.error("Error creating DJ:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create DJ" }
  }
}

export async function updateDJ(id: number, data: Partial<DJ>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const statusMap: Record<string, string> = {
      ativo: "ativo",
      inativo: "inativo",
      ocupado: "ocupado",
      active: "ativo",
      inactive: "inativo",
      busy: "ocupado",
    }

    const normalizedStatus = data.status ?
      (statusMap[data.status.toLowerCase()] || data.status) :
      undefined

    const { data: result, error } = await supabase
      .from('djs')
      .update({
        artist_name: data.artistic_name,
        real_name: data.name,
        email: data.email,
        genre: (data as any).genre,
        base_price: (data as any).base_price,
        instagram_url: data.instagram,
        youtube_url: data.youtube,
        tiktok_url: (data as any).tiktok,
        soundcloud_url: data.soundcloud,
        birth_date: (data as any).birth_date,
        status: normalizedStatus,
        is_active: (data as any).is_active,
        avatar_url: data.profile_image_url,
        phone: data.phone,
        cpf: data.cpf,
        pix_key: data.pix_key,
        bank_name: data.bank_name,
        bank_agency: data.bank_agency,
        bank_account: data.bank_account,
        notes: data.bio,
      })
      .eq('id', id)
      .select()

    if (error) throw error

    if (!result || result.length === 0) {
      return { success: false, error: "DJ not found" }
    }

    revalidatePath('/admin/dashboard/djs')

    return { success: true }
  } catch (error) {
    console.error("Error updating DJ:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update DJ" }
  }
}

export async function deleteDJ(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('djs')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard/djs')

    return { success: true }
  } catch (error) {
    console.error("Error deleting DJ:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete DJ" }
  }
}
