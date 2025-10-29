import { getSql } from "@/lib/neon"
import { put, del } from "@vercel/blob"

// Base Service Class
class BaseService {
  constructor(protected tableName: string) {}

  async getAll() {
    const sql = getSql()
    const result = await sql(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`)
    return result
  }

  async getById(id: string) {
    const sql = getSql()
    const result = await sql(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id])
    return result[0] || null
  }

  async create(data: Record<string, any>) {
    const sql = getSql()
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")
    const columns = keys.join(", ")

    const result = await sql(`INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`, values)
    return result[0]
  }

  async update(id: string, data: Record<string, any>) {
    const sql = getSql()
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(", ")

    const result = await sql(
      `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values],
    )
    return result[0]
  }

  async delete(id: string) {
    const sql = getSql()
    await sql(`DELETE FROM ${this.tableName} WHERE id = $1`, [id])
    return { success: true }
  }
}

// DJ Service
class DJService extends BaseService {
  constructor() {
    super("djs")
  }

  async getAll() {
    const sql = getSql()
    const result = await sql(`
      SELECT 
        id, name, artist_name, email, phone, cpf, pix_key,
        bank_name, bank_agency, bank_account, notes, avatar_url,
        created_at, updated_at
      FROM ${this.tableName}
      ORDER BY created_at DESC
    `)
    return result
  }
}

// Producer Service
class ProducerService extends BaseService {
  constructor() {
    super("producers")
  }

  async getAll() {
    const sql = getSql()
    const result = await sql(`
      SELECT 
        id, name, company_name, email, phone, cnpj, address, notes, avatar_url,
        created_at, updated_at
      FROM ${this.tableName}
      ORDER BY created_at DESC
    `)
    return result
  }
}

// Event Service
class EventService extends BaseService {
  constructor() {
    super("events")
  }

  async getAll() {
    const sql = getSql()
    const result = await sql(`
      SELECT 
        e.*,
        d.name as dj_name,
        d.artist_name as dj_artist_name,
        p.name as producer_name,
        p.company_name as producer_company_name
      FROM ${this.tableName} e
      LEFT JOIN djs d ON e.dj_id = d.id
      LEFT JOIN producers p ON e.producer_id = p.id
      ORDER BY e.event_date DESC
    `)
    return result
  }

  async getByDJ(djId: string) {
    const sql = getSql()
    const result = await sql(
      `
      SELECT e.*, p.name as producer_name
      FROM ${this.tableName} e
      LEFT JOIN producers p ON e.producer_id = p.id
      WHERE e.dj_id = $1
      ORDER BY e.event_date DESC
    `,
      [djId],
    )
    return result
  }

  async getByProducer(producerId: string) {
    const sql = getSql()
    const result = await sql(
      `
      SELECT e.*, d.name as dj_name, d.artist_name as dj_artist_name
      FROM ${this.tableName} e
      LEFT JOIN djs d ON e.dj_id = d.id
      WHERE e.producer_id = $1
      ORDER BY e.event_date DESC
    `,
      [producerId],
    )
    return result
  }
}

// Payment Service
class PaymentService extends BaseService {
  constructor() {
    super("payments")
  }

  async getAll() {
    const sql = getSql()
    const result = await sql(`
      SELECT 
        p.*,
        e.title as event_title,
        e.event_date,
        e.location,
        d.name as dj_name,
        d.artist_name as dj_artist_name,
        pr.name as producer_name
      FROM ${this.tableName} p
      LEFT JOIN events e ON p.event_id = e.id
      LEFT JOIN djs d ON e.dj_id = d.id
      LEFT JOIN producers pr ON e.producer_id = pr.id
      ORDER BY p.created_at DESC
    `)
    return result
  }

  async getPending() {
    const sql = getSql()
    const result = await sql(`
      SELECT 
        p.*,
        e.title as event_title,
        e.event_date,
        e.location,
        d.name as dj_name,
        pr.name as producer_name
      FROM ${this.tableName} p
      LEFT JOIN events e ON p.event_id = e.id
      LEFT JOIN djs d ON e.dj_id = d.id
      LEFT JOIN producers pr ON e.producer_id = pr.id
      WHERE p.status = 'pending'
      ORDER BY e.event_date ASC
    `)
    return result
  }
}

// Contract Service
class ContractService extends BaseService {
  constructor() {
    super("contracts")
  }

  async getByEvent(eventId: string) {
    const sql = getSql()
    const result = await sql(
      `
      SELECT * FROM ${this.tableName}
      WHERE event_id = $1
      ORDER BY created_at DESC
    `,
      [eventId],
    )
    return result
  }
}

// Analytics Service
class AnalyticsService {
  async getStats() {
    const sql = getSql()

    const [totalEvents] = await sql(`SELECT COUNT(*) as count FROM events`)
    const [totalDJs] = await sql(`SELECT COUNT(*) as count FROM djs`)
    const [totalProducers] = await sql(`SELECT COUNT(*) as count FROM producers`)
    const [totalRevenue] = await sql(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'paid'`)
    const [pendingPayments] = await sql(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'pending'`,
    )

    return {
      totalEvents: totalEvents.count,
      totalDJs: totalDJs.count,
      totalProducers: totalProducers.count,
      totalRevenue: totalRevenue.total,
      pendingPayments: pendingPayments.total,
    }
  }

  async getRevenueByMonth() {
    const sql = getSql()
    const result = await sql(`
      SELECT 
        DATE_TRUNC('month', payment_date) as month,
        SUM(amount) as revenue
      FROM payments
      WHERE status = 'paid' AND payment_date IS NOT NULL
      GROUP BY DATE_TRUNC('month', payment_date)
      ORDER BY month DESC
      LIMIT 12
    `)
    return result
  }
}

// Storage Service
class StorageService {
  async upload(bucket: string, path: string, file: File) {
    try {
      const blob = await put(`${bucket}/${path}`, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      return {
        path: blob.pathname,
        url: blob.url,
      }
    } catch (error) {
      throw new Error("Falha ao fazer upload do arquivo")
    }
  }

  async getPublicUrl(bucket: string, path: string) {
    return `https://blob.vercel-storage.com/${bucket}/${path}`
  }

  async delete(url: string) {
    try {
      await del(url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }
}

// Export service instances
export const djService = new DJService()
export const producerService = new ProducerService()
export const eventService = new EventService()
export const paymentService = new PaymentService()
export const contractService = new ContractService()
export const analyticsService = new AnalyticsService()
export const storageService = new StorageService()

// Export wrapper for compatibility
export const djServiceWrapper = djService

// Export default for backward compatibility
export default {
  djService,
  producerService,
  eventService,
  paymentService,
  contractService,
  analyticsService,
  storageService,
}
