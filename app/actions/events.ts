"use server"

export interface Event {
  id: number
  name: string
  event_date: string
  event_time?: string
  venue?: string
  status?: string
  djs?: Array<{
    id: number
    fee?: number
    set_time?: string
    set_duration?: number
  }>
}

export async function getEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/events`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch events")
    }

    const data = await response.json()
    return data.events || []
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    return []
  }
}
