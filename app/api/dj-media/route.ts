import { type NextRequest, NextResponse } from "next/server"
import { getSql, isNeonConfigured } from "@/lib/neon"

export async function GET(request: NextRequest) {
  try {
    if (!isNeonConfigured()) {
      return NextResponse.json({ media: [] }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const djId = searchParams.get("djId")

    if (!djId) {
      return NextResponse.json({ error: "DJ ID is required" }, { status: 400 })
    }

    const sql = getSql()
    if (!sql) {
      throw new Error("Failed to initialize database connection")
    }

    const media = await sql`
      SELECT * FROM dj_media
      WHERE dj_id = ${djId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ media })
  } catch (error) {
    console.error("Failed to fetch DJ media:", error)
    return NextResponse.json({ media: [] }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isNeonConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const payload = await request.json()
    const sql = getSql()

    if (!sql) {
      throw new Error("Failed to initialize database connection")
    }

    const result = await sql`
      INSERT INTO dj_media (
        dj_id, title, description, category, file_url, external_link
      )
      VALUES (
        ${payload.dj_id}, ${payload.title}, ${payload.description},
        ${payload.category}, ${payload.file_url}, ${payload.external_link}
      )
      RETURNING *
    `

    return NextResponse.json({ media: result[0] })
  } catch (error) {
    console.error("Failed to create DJ media:", error)
    return NextResponse.json(
      {
        error: "Failed to create DJ media",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isNeonConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 })
    }

    const sql = getSql()
    if (!sql) {
      throw new Error("Failed to initialize database connection")
    }

    await sql`
      DELETE FROM dj_media
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete DJ media:", error)
    return NextResponse.json(
      {
        error: "Failed to delete DJ media",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
