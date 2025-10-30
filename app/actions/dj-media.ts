"use server"

import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import { revalidatePath } from "next/cache"

export interface DJMedia {
  id: number
  dj_id: number
  title: string
  description?: string
  category: string
  file_url?: string
  external_link?: string
  created_at?: string
  updated_at?: string
}

export async function getDJMedia(djId: number): Promise<DJMedia[]> {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured")
      return []
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data: media, error } = await supabase
      .from('dj_media')
      .select('*')
      .eq('dj_id', djId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return media || []
  } catch (error) {
    console.error("Failed to fetch DJ media:", error)
    return []
  }
}

export async function createDJMedia(payload: Partial<DJMedia>): Promise<{ success: boolean; error?: string; media?: DJMedia }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data: result, error } = await supabase
      .from('dj_media')
      .insert([{
        dj_id: payload.dj_id,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        file_url: payload.file_url,
        external_link: payload.external_link,
      }])
      .select()

    if (error) throw error

    revalidatePath('/admin/dashboard/djs')

    return { success: true, media: result && result[0] }
  } catch (error) {
    console.error("Failed to create DJ media:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create DJ media"
    }
  }
}

export async function updateDJMedia(id: number, payload: Partial<DJMedia>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('dj_media')
      .update({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        file_url: payload.file_url,
        external_link: payload.external_link,
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard/djs')

    return { success: true }
  } catch (error) {
    console.error("Failed to update DJ media:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update DJ media"
    }
  }
}

export async function deleteDJMedia(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('dj_media')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard/djs')

    return { success: true }
  } catch (error) {
    console.error("Failed to delete DJ media:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete DJ media"
    }
  }
}
