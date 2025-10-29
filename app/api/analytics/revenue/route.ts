import { NextResponse } from 'next/server'
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ warning: 'Database not configured', data: [] }, { status: 200 })
    }

    const supabase = supabaseServer
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    // Fetch paid payments in the last 6 months
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const { data: payments, error } = await supabase
      .from('payments')
      .select('amount, paid_at')
      .gte('paid_at', start.toISOString())
      .eq('status', 'paid')

    if (error) throw error

    const monthly: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString('pt-BR', { month: 'short' })
      monthly[key] = 0
    }

    (payments || []).forEach((p: any) => {
      const dt = new Date(p.paid_at)
      const key = dt.toLocaleDateString('pt-BR', { month: 'short' })
      if (monthly[key] !== undefined) monthly[key] += Number.parseFloat(p.amount || 0)
    })

    return NextResponse.json(Object.entries(monthly).map(([name, value]) => ({ name, value })))
  } catch (err: any) {
    console.error('Failed to fetch revenue by month:', err)
    const details = err?.message || (typeof err === 'string' ? err : JSON.stringify(err))
    return NextResponse.json({ error: details || 'Unknown error' }, { status: 500 })
  }
}
