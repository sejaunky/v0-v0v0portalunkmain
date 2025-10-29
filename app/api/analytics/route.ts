import { NextResponse } from 'next/server'
import { analyticsService } from '@/services/neonService'

export async function GET() {
  try {
    const stats = await analyticsService.getStats()
    return NextResponse.json(stats)
  } catch (err: any) {
    console.error('Failed to fetch analytics stats:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
