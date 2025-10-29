import { type NextRequest, NextResponse } from "next/server"
import { getSql, isNeonConfigured } from "@/lib/neon"

export async function GET() {
  try {
    if (!isNeonConfigured()) {
      return NextResponse.json({ prospeccoes: [], warning: "Database not configured" }, { status: 200 })
    }

    const sql = getSql()
    if (!sql) throw new Error("Failed to initialize database connection")

    const rows = await sql`SELECT * FROM prospeccoes ORDER BY created_at DESC`

    return NextResponse.json({ prospeccoes: rows })
  } catch (error) {
    console.error("Failed to fetch prospeccoes:", error)
    return NextResponse.json(
      { error: "Failed to fetch prospeccoes", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isNeonConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const payload = await request.json()
    const sql = getSql()
    if (!sql) throw new Error("Failed to initialize database connection")

    const result = await sql`
      INSERT INTO prospeccoes (
        title, description, location, data, budget, client_name, client_contact,
        dj_id, dj_name, status, created_at
      ) VALUES (
        ${payload.title}, ${payload.description || null}, ${payload.location || null}, ${payload.data || null}, ${payload.budget || null},
        ${payload.client_name || null}, ${payload.client_contact || null}, ${payload.dj_id || null}, ${payload.dj_name || null},
        ${payload.status || 'prospecção'}, NOW()
      ) RETURNING *
    `

    return NextResponse.json({ prospeccao: result[0] })
  } catch (error) {
    console.error("Failed to create prospeccao:", error)
    return NextResponse.json(
      { error: "Failed to create prospeccao", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    )
  }
}
