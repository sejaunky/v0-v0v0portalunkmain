"use server"

import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import { revalidatePath } from "next/cache"

export interface Prospeccao {
  id: number
  title: string
  description?: string
  location?: string
  data?: string
  budget?: number
  client_name?: string
  client_contact?: string
  dj_id?: number
  dj_name?: string
  status: string
  created_at?: string
  updated_at?: string
}

export async function getProspeccoes(): Promise<Prospeccao[]> {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured")
      return []
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('prospeccoes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Failed to fetch prospeccoes:", error)
    return []
  }
}

export async function getProspeccaoById(id: number): Promise<Prospeccao | null> {
  try {
    if (!isSupabaseConfigured()) {
      return null
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('prospeccoes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching prospeccao:", error)
    return null
  }
}

export async function createProspeccao(payload: Partial<Prospeccao>): Promise<{ success: boolean; error?: string; prospeccao?: Prospeccao }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data: result, error } = await supabase
      .from('prospeccoes')
      .insert([{
        title: payload.title,
        description: payload.description || null,
        location: payload.location || null,
        data: payload.data || null,
        budget: payload.budget || null,
        client_name: payload.client_name || null,
        client_contact: payload.client_contact || null,
        dj_id: payload.dj_id || null,
        dj_name: payload.dj_name || null,
        status: payload.status || 'prospecção',
      }])
      .select()

    if (error) throw error

    revalidatePath('/admin/dashboard')

    return { success: true, prospeccao: result && result[0] }
  } catch (error) {
    console.error("Failed to create prospeccao:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create prospeccao"
    }
  }
}

export async function updateProspeccao(id: number, payload: Partial<Prospeccao>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('prospeccoes')
      .update({
        title: payload.title,
        description: payload.description,
        location: payload.location,
        data: payload.data,
        budget: payload.budget,
        client_name: payload.client_name,
        client_contact: payload.client_contact,
        dj_id: payload.dj_id,
        dj_name: payload.dj_name,
        status: payload.status,
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error("Failed to update prospeccao:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update prospeccao"
    }
  }
}

export async function deleteProspeccao(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('prospeccoes')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error("Failed to delete prospeccao:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete prospeccao"
    }
  }
}
