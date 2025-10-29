// Client-side wrappers that call the app API routes (server uses Supabase)

const makeCollectionWrapper = (baseApiPath: string) => ({
  async getAll() {
    const res = await fetch(baseApiPath)
    if (!res.ok) return []
    const json = await res.json().catch(() => null)
    return json?.djs || json?.producers || json?.prospeccoes || json || []
  },
  async getById(id: string) {
    const res = await fetch(`${baseApiPath}/${id}`)
    if (!res.ok) return null
    const json = await res.json().catch(() => null)
    return json || null
  },
  async create(payload: any) {
    const res = await fetch(baseApiPath, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    return res.json()
  },
  async update(id: string, payload: any) {
    const res = await fetch(baseApiPath, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...payload }) })
    return res.json()
  },
  async delete(id: string) {
    const res = await fetch(baseApiPath, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    return res.json()
  },
})

export const djService = makeCollectionWrapper('/api/djs')
export const producerService = makeCollectionWrapper('/api/producers')
export const eventService = makeCollectionWrapper('/api/events')
export const paymentService = makeCollectionWrapper('/api/payments')
export const contractService = makeCollectionWrapper('/api/contracts')
export const prospeccaoService = makeCollectionWrapper('/api/prospeccoes')

export const analyticsService = {
  async getStats() {
    const res = await fetch('/api/analytics')
    if (!res.ok) return {}
    return res.json()
  },
  async getRevenueByMonth() {
    const res = await fetch('/api/analytics/revenue')
    if (!res.ok) return []
    return res.json()
  }
}

export const storageService = {
  // storage operations should be implemented server-side (Supabase storage or Vercel Blob)
}

export default {
  djService,
  producerService,
  eventService,
  paymentService,
  contractService,
  prospeccaoService,
  analyticsService,
  storageService,
}
