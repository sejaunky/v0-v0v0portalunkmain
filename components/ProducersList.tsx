'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProducerProfile from './ProducerProfile'
import {
  Briefcase, Search, Plus, Mail, Phone, MapPin, Star,
  Calendar, DollarSign
} from 'lucide-react'

interface Producer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  location: string
  rating: number
  events_count: number
  total_revenue: number
  specialties: string[]
  image: string
}

export default function ProducersList() {
  const [producers, setProducers] = useState<Producer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducers = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('producers').select('*')
      if (error) console.error('Erro ao buscar produtores:', error)
      else setProducers(data || [])
      setLoading(false)
    }
    fetchProducers()
  }, [])

  const filtered = producers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalEvents = producers.reduce((sum, p) => sum + (p.events_count || 0), 0)
  const totalRevenue = producers.reduce((sum, p) => sum + (p.total_revenue || 0), 0)
  const avgRating =
    producers.length > 0
      ? producers.reduce((sum, p) => sum + (p.rating || 0), 0) / producers.length
      : 0

  if (selectedProducerId)
    return <ProducerProfile producerId={selectedProducerId} onBack={() => setSelectedProducerId(null)} />

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white text-neon">Produtores</h1>
        <p className="text-white/70 text-lg">Gerencie sua rede de produtores de eventos</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Briefcase />} label="Total de Produtores" value={producers.length} />
        <StatCard icon={<Calendar />} label="Eventos Realizados" value={totalEvents} />
        <StatCard icon={<DollarSign />} label="Receita Total" value={`R$ ${totalRevenue.toLocaleString()}`} />
        <StatCard icon={<Star />} label="Avaliação Média" value={avgRating.toFixed(1)} />
      </div>

      {/* Busca */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar produtor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-surface pl-10 pr-4 py-3 rounded-lg text-white placeholder-white/40 border-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-6 py-3 rounded-lg text-white font-medium flex items-center space-x-2 neon-glow transition-all">
          <Plus className="w-4 h-4" />
          <span>Adicionar Produtor</span>
        </button>
      </div>

      {/* Lista de produtores */}
      {loading ? (
        <p className="text-center text-white/60">Carregando...</p>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="glass-card p-6 hover:neon-glow transition-all duration-300 cursor-pointer border-2 border-purple-500/40"
              onClick={() => setSelectedProducerId(p.id)}
            >
              <div className="flex items-start space-x-4">
                <img src={p.image} alt={p.name} className="w-20 h-20 rounded-full object-cover border-2 border-white/30" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-purple-400 font-medium">{p.company}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < (p.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1 mt-3 text-white/60 text-sm">
                    <p className="flex items-center space-x-2"><Mail className="w-3 h-3" /><span>{p.email}</span></p>
                    <p className="flex items-center space-x-2"><Phone className="w-3 h-3" /><span>{p.phone}</span></p>
                    <p className="flex items-center space-x-2"><MapPin className="w-3 h-3" /><span>{p.location}</span></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-white/60">Nenhum produtor encontrado</p>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="glass-card p-6 hover:neon-glow transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 text-white">{icon}</div>
      </div>
      <p className="text-white/60 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white text-neon">{value}</p>
    </div>
  )
}
