import { type NextRequest, NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/supabase"
import { eventService } from "@/services/supabaseService"

export async function GET() {
  try {
    if (!isNeonConfigured()) {
      return NextResponse.json({ events: [], warning: "Database not configured" }, { status: 200 })
    }

    const events = await eventService.getAll()
    return NextResponse.json({ events })
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return NextResponse.json({ error: "Failed to fetch events", details: error instanceof Error ? error.message : "Unknown" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isNeonConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const payload = await request.json()

    // Basic validation
    if (!payload.title || !payload.event_date) {
      return NextResponse.json({ error: "Missing required fields: title or event_date" }, { status: 400 })
    }

    // Map frontend fields to DB columns
    const data: any = {
      title: payload.title,
      event_date: payload.event_date,
      location: payload.location || null,
      status: payload.status || 'scheduled',
      notes: payload.notes || null,
    }

    const created = await eventService.create(data)

    if (!created) {
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }

    return NextResponse.json({ event: created })
  } catch (error) {
    console.error("Failed to create event:", error)
    return NextResponse.json({ error: "Failed to create event", details: error instanceof Error ? error.message : "Unknown" }, { status: 500 })
  }
}
