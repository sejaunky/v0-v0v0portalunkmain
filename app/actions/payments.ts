"use server"

import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import { revalidatePath } from "next/cache"

export interface Payment {
  id: number
  event_id?: number
  dj_id?: number
  amount: number
  status: string
  payment_date?: string
  payment_method?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export async function getPayments(): Promise<Payment[]> {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured")
      return []
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Failed to load payments:", error)
    return []
  }
}

export async function getPendingPayments(): Promise<Payment[]> {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured")
      return []
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Failed to load pending payments:", error)
    return []
  }
}

export async function createPayment(payload: Partial<Payment>): Promise<{ success: boolean; error?: string; payment?: Payment }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('payments')
      .insert([{
        event_id: payload.event_id,
        dj_id: payload.dj_id,
        amount: payload.amount,
        status: payload.status || 'pending',
        payment_date: payload.payment_date,
        payment_method: payload.payment_method,
        notes: payload.notes,
      }])
      .select()

    if (error) throw error

    revalidatePath('/admin/dashboard')

    return { success: true, payment: data && data[0] }
  } catch (error) {
    console.error("Failed to create payment:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create payment" }
  }
}

export async function updatePaymentStatus(id: number, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error("Failed to update payment status:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update payment status" }
  }
}

export async function reviewPayment(id: number, approved: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const newStatus = approved ? 'approved' : 'rejected'

    const { error } = await supabase
      .from('payments')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error("Failed to review payment:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to review payment" }
  }
}
