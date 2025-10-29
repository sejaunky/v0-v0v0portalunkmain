'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Edit3, Save, X, Camera, Star } from 'lucide-react'

interface ProducerProfileProps {
  producerId: string
  onBack: () => void
}

export default function ProducerProfile({ producerId, onBack }: ProducerProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [producer, setProducer] = useState<any>(null)
  const [editData, setEditData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProducer = async () => {
      const { data, error } = await supabase.from('producers').select('*').eq('id', producerId).single()
      if (error) console.error(error)
      else {
        setProducer(data)
        setEditData(data)
      }
    }
    fetchProducer()
  }, [producerId])

  const handleSave = async () => {
    const { error } = await supabase.from('producers').update(editData).eq('id', producerId)
    if (!error) {
      setProducer(editData)
      setIsEditing(false)
    }
  }

  if (!producer) return <p className="text-white/60 text-center">Carregando...</p>

  const current = isEditing ? editData : producer

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        {isEditing ? (
          <div className="space-x-2">
            <button onClick={handleSave} className="bg-green-600 px-4 py-2 rounded-lg text-white flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-600 px-4 py-2 rounded-lg text-white flex items-center space-x-2">
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg text-white font-medium flex items-center space-x-2">
            <Edit3 className="w-4 h-4" />
            <span>Editar Perfil</span>
          </button>
        )}
      </div>

      {/* Conteúdo */}
      <div className="text-center space-y-6">
        <div className="relative w-32 h-32 mx-auto">
          <img src={current.image} alt={current.name} className="w-full h-full rounded-full object-cover border-4 border-white/30" />
          <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full text-white">
            <Camera className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
        </div>
        <h1 className="text-2xl font-bold text-white">{current.name}</h1>
        <p className="text-purple-400">{current.company}</p>
        <div className="flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < current.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
