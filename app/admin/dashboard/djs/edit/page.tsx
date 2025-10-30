"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { getDJById, updateDJ, type DJ } from "@/app/actions/djs"
import { motion } from "framer-motion"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function EditDJPage() {
  const router = useRouter()
  const params = useParams()
  const djId = Number(params.id)
  const [loading, setLoading] = useState(false)
  const [dj, setDj] = useState<DJ | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    artistic_name: "",
    email: "",
    phone: "",
    cpf: "",
    bio: "",
    specializations: "",
    equipment: "",
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
    spotify: "",
    soundcloud: "",
    status: "active",
  })

  useEffect(() => {
    loadDJ()
  }, [djId])

  const loadDJ = async () => {
    const data = await getDJById(djId)
    if (data) {
      setDj(data)
      setFormData({
        name: data.name || "",
        artistic_name: data.artistic_name || "",
        email: data.email || "",
        phone: data.phone || "",
        cpf: data.cpf || "",
        bio: data.bio || "",
        specializations: data.specializations?.join(", ") || "",
        equipment: data.equipment?.join(", ") || "",
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        twitter: data.twitter || "",
        youtube: data.youtube || "",
        spotify: data.spotify || "",
        soundcloud: data.soundcloud || "",
        status: data.status || "active",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = {
      ...formData,
      specializations: formData.specializations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      equipment: formData.equipment
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
    }

    const result = await updateDJ(djId, data)

    if (result.success) {
      router.push(`/dashboard/djs/${djId}`)
    } else {
      alert(result.error)
    }

    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (!dj) {
    return (
      <div>
        <DashboardHeader title="Carregando..." subtitle="Aguarde" />
        <div className="p-8">
          <div className="glass-strong rounded-xl h-96 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader title={`Editar ${dj.artistic_name}`} subtitle="Atualizar informações do DJ" />

      <div className="p-8">
        <div className="mb-6">
          <Link href={`/dashboard/djs/${djId}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-strong border-border/50 p-8 max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artistic_name">Nome Artístico *</Label>
                    <Input
                      id="artistic_name"
                      name="artistic_name"
                      value={formData.artistic_name}
                      onChange={handleChange}
                      required
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specializations">Especializações (separadas por vírgula)</Label>
                    <Input
                      id="specializations"
                      name="specializations"
                      value={formData.specializations}
                      onChange={handleChange}
                      placeholder="House, Techno, Deep House"
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipamentos (separados por vírgula)</Label>
                    <Input
                      id="equipment"
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleChange}
                      placeholder="CDJ-3000, DJM-900"
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Redes Sociais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@username"
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spotify">Spotify</Label>
                    <Input
                      id="spotify"
                      name="spotify"
                      value={formData.spotify}
                      onChange={handleChange}
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soundcloud">SoundCloud</Label>
                    <Input
                      id="soundcloud"
                      name="soundcloud"
                      value={formData.soundcloud}
                      onChange={handleChange}
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Link href={`/dashboard/djs/${djId}`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
