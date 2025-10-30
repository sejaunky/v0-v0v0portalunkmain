"use server"

import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export interface Producer {
  id: number
  name: string
  email?: string
  company?: string
  company_name?: string
  phone?: string
  status?: string
  avatar_url?: string
  cnpj?: string
  address?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export async function getProducers(): Promise<Producer[]> {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured")
      return []
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const normalized = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name || p.name,
      email: p.email || null,
      company: p.company_name || p.company || null,
      company_name: p.company_name || p.company || null,
      phone: p.phone || null,
      status: p.status || "active",
      avatar_url: p.avatar_url || null,
      cnpj: p.cnpj || null,
      address: p.address || null,
      notes: p.notes || null,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }))

    return normalized
  } catch (error) {
    console.error("Failed to fetch producers:", error)
    return []
  }
}

export async function getProducerById(id: number): Promise<Producer | null> {
  try {
    if (!isSupabaseConfigured()) {
      return null
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    const normalized = {
      id: data.id,
      name: data.name,
      email: data.email || null,
      company: data.company_name || data.company || null,
      company_name: data.company_name || data.company || null,
      phone: data.phone || null,
      status: data.status || "active",
      avatar_url: data.avatar_url || null,
      cnpj: data.cnpj || null,
      address: data.address || null,
      notes: data.notes || null,
    }

    return normalized
  } catch (error) {
    console.error("Error fetching producer:", error)
    return null
  }
}

export async function createProducer(payload: Partial<Producer> & { password?: string }): Promise<{ success: boolean; error?: string; producer?: Producer }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    if (payload.email && payload.password) {
      try {
        const { data: existingUsers } = await supabase
          .from('users')
          .select('id')
          .eq('email', payload.email)
          .limit(1)

        if (!existingUsers || existingUsers.length === 0) {
          const passwordHash = await bcrypt.hash(payload.password, 10)
          const { error: userErr } = await supabase
            .from('users')
            .insert([{
              email: payload.email,
              password_hash: passwordHash,
              name: payload.name,
              role: 'producer'
            }])

          if (userErr) {
            console.error('Failed to create user for producer:', userErr)
          }
        }
      } catch (err) {
        console.error('Error creating user for producer:', err)
      }
    }

    const { data: result, error } = await supabase
      .from('producers')
      .insert([{
        name: payload.name,
        email: payload.email || null,
        company_name: payload.company || payload.company_name || null,
        phone: payload.phone || null,
        status: payload.status || 'active',
        avatar_url: payload.avatar_url || null,
        cnpj: payload.cnpj || null,
        address: payload.address || null,
        notes: payload.notes || null,
      }])
      .select()

    if (error) throw error

    const created = result && result[0]

    const normalized = {
      id: created.id,
      name: created.name,
      email: created.email || null,
      company: created.company_name || null,
      company_name: created.company_name || null,
      phone: created.phone || null,
      status: created.status || "active",
      avatar_url: created.avatar_url || null,
      cnpj: created.cnpj || null,
      address: created.address || null,
      notes: created.notes || null,
    }

    revalidatePath('/admin/dashboard/producers')

    return { success: true, producer: normalized }
  } catch (error) {
    console.error("Failed to create producer:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create producer" }
  }
}

export async function updateProducer(id: number, payload: Partial<Producer>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data: result, error } = await supabase
      .from('producers')
      .update({
        name: payload.name,
        email: payload.email,
        company_name: payload.company || payload.company_name,
        phone: payload.phone,
        status: payload.status,
        avatar_url: payload.avatar_url,
        cnpj: payload.cnpj,
        address: payload.address,
        notes: payload.notes,
      })
      .eq('id', id)
      .select()

    if (error) throw error

    if (!result || result.length === 0) {
      return { success: false, error: "Producer not found" }
    }

    revalidatePath('/admin/dashboard/producers')

    return { success: true }
  } catch (error) {
    console.error("Failed to update producer:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update producer" }
  }
}

export async function deleteProducer(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('producers')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard/producers')

    return { success: true }
  } catch (error) {
    console.error("Failed to delete producer:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete producer" }
  }
}
