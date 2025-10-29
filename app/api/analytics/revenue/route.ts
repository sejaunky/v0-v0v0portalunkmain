import { NextResponse } from 'next/server'
import { analyticsService } from '@/services/neonService'

export async function GET() {
  try {
    const data = await analyticsService.getRevenueByMonth()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Failed to fetch revenue by month:', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
