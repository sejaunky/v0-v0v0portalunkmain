"use server"

import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase.server"

export interface AnalyticsStats {
  totalDJs: number
  totalEvents: number
  totalPayments: number
  totalRevenue?: number
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Database not configured")
      return {
        totalDJs: 0,
        totalEvents: 0,
        totalPayments: 0,
        totalRevenue: 0,
      }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    const [
      { count: djsCount },
      { count: eventsCount },
      { count: paymentsCount }
    ] = await Promise.all([
      supabase.from('djs').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('id', { count: 'exact', head: true }),
    ])

    const stats: AnalyticsStats = {
      totalDJs: Number(djsCount) || 0,
      totalEvents: Number(eventsCount) || 0,
      totalPayments: Number(paymentsCount) || 0,
    }

    return stats
  } catch (error) {
    console.error("Failed to fetch analytics stats:", error)
    return {
      totalDJs: 0,
      totalEvents: 0,
      totalPayments: 0,
      totalRevenue: 0,
    }
  }
}

export async function getRevenueAnalytics(startDate?: string, endDate?: string): Promise<{ revenue: number; count: number }> {
  try {
    if (!isSupabaseConfigured()) {
      return { revenue: 0, count: 0 }
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error("Failed to initialize Supabase client")

    let query = supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    const revenue = data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
    const count = data?.length || 0

    return { revenue, count }
  } catch (error) {
    console.error("Failed to fetch revenue analytics:", error)
    return { revenue: 0, count: 0 }
  }
}
