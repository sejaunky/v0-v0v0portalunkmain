"use server"

import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import { eventService } from "@/services/supabaseService"
import { revalidatePath } from "next/cache"

export interface Event {
  id: number
  name?: string
  title?: string
  event_date: string
  event_time?: string
  venue?: string
  location?: string
  status?: string
  notes?: string
  djs?: Array<{
    id: number
    fee?: number
    set_time?: string
    set_duration?: number
  }>
}

export async function getEvents(): Promise<Event[]> {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured")
      return []
    }

    const events = await eventService.getAll()
    return events || []
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return []
  }
}

export async function getEventById(id: number): Promise<Event | null> {
  try {
    if (!isSupabaseConfigured()) {
      return null
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching event:", error)
    return null
  }
}

export async function createEvent(payload: Partial<Event>): Promise<{ success: boolean; error?: string; event?: Event }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    if (!payload.title && !payload.name) {
      return { success: false, error: "Title is required" }
    }

    if (!payload.event_date) {
      return { success: false, error: "Event date is required" }
    }

    const data: any = {
      title: payload.title || payload.name,
      event_date: payload.event_date,
      location: payload.location || payload.venue || null,
      status: payload.status || 'scheduled',
      notes: payload.notes || null,
    }

    const created = await eventService.create(data)

    if (!created) {
      return { success: false, error: "Failed to create event" }
    }

    revalidatePath('/admin/dashboard/agenda-manager')

    return { success: true, event: created }
  } catch (error) {
    console.error("Failed to create event:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create event" }
  }
}

export async function updateEvent(id: number, payload: Partial<Event>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const updateData: any = {}

    if (payload.title || payload.name) {
      updateData.title = payload.title || payload.name
    }
    if (payload.event_date) {
      updateData.event_date = payload.event_date
    }
    if (payload.location || payload.venue) {
      updateData.location = payload.location || payload.venue
    }
    if (payload.status) {
      updateData.status = payload.status
    }
    if (payload.notes !== undefined) {
      updateData.notes = payload.notes
    }

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      return { success: false, error: "Event not found" }
    }

    revalidatePath('/admin/dashboard/agenda-manager')

    return { success: true }
  } catch (error) {
    console.error("Failed to update event:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update event" }
  }
}

export async function deleteEvent(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard/agenda-manager')

    return { success: true }
  } catch (error) {
    console.error("Failed to delete event:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete event" }
  }
}

export async function markEventAsPaid(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('events')
      .update({ status: 'paid' })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/dashboard/agenda-manager')

    return { success: true }
  } catch (error) {
    console.error("Failed to mark event as paid:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to mark event as paid" }
  }
}
