"use server"

import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import { revalidatePath } from "next/cache"

export interface Contract {
  id: number
  event_id?: number
  dj_id?: number
  producer_id?: number
  contract_number?: string
  contract_date?: string
  contract_amount?: number
  payment_terms?: string
  status: string
  signed_at?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export async function getContracts(): Promise<Contract[]> {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured")
      return []
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Failed to load contracts:", error)
    return []
  }
}

export async function getContractById(id: number): Promise<Contract | null> {
  try {
    if (!isSupabaseConfigured()) {
      return null
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching contract:", error)
    return null
  }
}

export async function createContract(payload: Partial<Contract>): Promise<{ success: boolean; error?: string; contract?: Contract }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('contracts')
      .insert([{
        event_id: payload.event_id,
        dj_id: payload.dj_id,
        producer_id: payload.producer_id,
        contract_number: payload.contract_number,
        contract_date: payload.contract_date,
        contract_amount: payload.contract_amount,
        payment_terms: payload.payment_terms,
        status: payload.status || 'draft',
        signed_at: payload.signed_at,
        notes: payload.notes,
      }])
      .select()

    if (error) throw error

    revalidatePath('/admin/dashboard')

    return { success: true, contract: data && data[0] }
  } catch (error) {
    console.error("Failed to create contract:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create contract" }
  }
}

export async function createEventContracts(eventId: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) throw eventError

    if (!event) {
      return { success: false, error: "Event not found" }
    }

    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error("Failed to create event contracts:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create event contracts" }
  }
}

export async function updateContract(id: number, payload: Partial<Contract>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('contracts')
      .update(payload)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error("Failed to update contract:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update contract" }
  }
}

export async function deleteContract(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error("Failed to delete contract:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete contract" }
  }
}
