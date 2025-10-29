import { NextResponse } from "next/server"
import { testDatabaseConnection, checkTablesExist } from "@/lib/db-test"

export async function GET() {
  try {
    const connectionTest = await testDatabaseConnection()
    const tablesCheck = await checkTablesExist()

    return NextResponse.json({
      connection: connectionTest,
      tables: tablesCheck,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to test database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
