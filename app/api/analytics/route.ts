import { NextResponse } from 'next/server'
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ warning: 'Database not configured', stats: {} }, { status: 200 })
    }

    const supabase = await supabaseServer()
    if (!supabase) throw new Error('Failed to initialize Supabase client')

    const [{ count: djsCount }, { count: eventsCount }, { count: paymentsCount }] = await Promise.all([
      supabase.from('djs').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('id', { count: 'exact', head: true }),
    ])

    const stats = {
      totalDJs: Number(djsCount) || 0,
      totalEvents: Number(eventsCount) || 0,
      totalPayments: Number(paymentsCount) || 0,
    }

    return NextResponse.json(stats)
  } catch (err: any) {
    console.error('Failed to fetch analytics stats:', err)
    const details = err?.message || (typeof err === 'string' ? err : JSON.stringify(err))
    return NextResponse.json({ error: details || 'Unknown error' }, { status: 500 })
  }
}
