"use server"

import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"
import { revalidatePath } from "next/cache"

export interface ShareLink {
  id: string
  resource_type: string
  resource_id: number
  expires_at?: string
  created_at?: string
}

export async function createShareLink(resourceType: string, resourceId: number, expiresInDays?: number): Promise<{ success: boolean; error?: string; shareId?: string; shareUrl?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    let expiresAt = null
    if (expiresInDays) {
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + expiresInDays)
      expiresAt = expirationDate.toISOString()
    }

    const { data, error } = await supabase
      .from('share_links')
      .insert([{
        id: shareId,
        resource_type: resourceType,
        resource_id: resourceId,
        expires_at: expiresAt,
      }])
      .select()

    if (error) throw error

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/share/${shareId}`

    return { success: true, shareId, shareUrl }
  } catch (error) {
    console.error("Failed to create share link:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create share link"
    }
  }
}

export async function revokeShareLink(shareId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { error } = await supabase
      .from('share_links')
      .delete()
      .eq('id', shareId)

    if (error) throw error

    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error("Failed to revoke share link:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke share link"
    }
  }
}

export async function getShareLinkData(shareId: string): Promise<{ success: boolean; error?: string; data?: ShareLink }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Database not configured" }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const { data, error } = await supabase
      .from('share_links')
      .select('*')
      .eq('id', shareId)
      .single()

    if (error) throw error

    if (!data) {
      return { success: false, error: "Share link not found" }
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { success: false, error: "Share link has expired" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Failed to get share link data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get share link data"
    }
  }
}
