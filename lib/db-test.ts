// Database connection test utility
import { getSql } from "./neon"

export async function testDatabaseConnection() {
  try {
    const sql = getSql()

    if (!sql) {
      return {
        success: false,
        error: "DATABASE_URL not configured",
      }
    }

    // Test basic query
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`

    return {
      success: true,
      data: result[0],
      message: "Database connection successful!",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function checkTablesExist() {
  try {
    const sql = getSql()

    if (!sql) {
      return {
        success: false,
        error: "DATABASE_URL not configured",
      }
    }

    // Check if main tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    return {
      success: true,
      tables: tables.map((t) => t.table_name),
      message: `Found ${tables.length} tables`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
