"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { createDJ } from "@/app/actions/djs"
import { motion } from "framer-motion"
import { ArrowLeft, Save, ImageIcon } from "lucide-react"
import Link from "next/link"
import { put } from "@vercel/blob"

export default function NewDJPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [backdropImage, setBackdropImage] = useState<File | null>(null)
  const [backdropImagePreview, setBackdropImagePreview] = useState<string>("")

  const [formData, setFormData] = useState({
    name: "",
    artistic_name: "",
    email: "",
    password: "",
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
  })

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackdropImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBackdropImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackdropImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let profileImageUrl = ""
      let backdropImageUrl = ""

      if (profileImage) {
        const blob = await put(profileImage.name, profileImage, {
          access: "public",
        })
        profileImageUrl = blob.url
      }

      if (backdropImage) {
        const blob = await put(backdropImage.name, backdropImage, {
          access: "public",
        })
        backdropImageUrl = blob.url
      }

      const data = {
        ...formData,
        profile_image_url: profileImageUrl,
        backdrop_url: backdropImageUrl,
        specializations: formData.specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        equipment: formData.equipment
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
      }

      // If user provided only the local-part (ex: "joao"), append @unk
      if (data.email && !String(data.email).includes("@")) {
        ;(data as any).email = `${String(data.email).trim()}@unk`
      }

      const result = await createDJ(data)

      if (result.success) {
        router.push("/dashboard/djs")
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error("[v0] Error creating DJ:", error)
      alert("Erro ao criar DJ")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div>
      <DashboardHeader title="Novo DJ" subtitle="Cadastrar novo DJ ou artista" />

      <div className="p-8">
        <div className="mb-6">
          <Link href="/dashboard/djs">
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
                <h3 className="text-xl font-bold text-foreground mb-4">Imagens</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile image */}
                  <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div
                      className="relative border-2 border-dashed border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById("profile-image-input")?.click()}
                    >
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview || "/placeholder.svg"}
                          alt="Profile preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                          <ImageIcon className="w-12 h-12 mb-2" />
                          <p className="text-sm">Clique para adicionar foto de perfil</p>
                        </div>
                      )}
                      <input
                        id="profile-image-input"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                      />
                    </div>
                  </div>

                  {/* Backdrop image */}
                  <div className="space-y-2">
                    <Label>Foto de Fundo</Label>
                    <div
                      className="relative border-2 border-dashed border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById("backdrop-image-input")?.click()}
                    >
                      {backdropImagePreview ? (
                        <img
                          src={backdropImagePreview || "/placeholder.svg"}
                          alt="Backdrop preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                          <ImageIcon className="w-12 h-12 mb-2" />
                          <p className="text-sm">Clique para adicionar foto de fundo</p>
                        </div>
                      )}
                      <input
                        id="backdrop-image-input"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleBackdropImageChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
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
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={(formData as any).password}
                      onChange={handleChange}
                      required
                      className="glass border-border/50 bg-background/50"
                    />
                    <p className="text-xs text-muted-foreground">Informe apenas o identificador (ex: "joao"). O sistema enviará "@unk" automaticamente se o email não contiver domínio.</p>
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
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Informações Profissionais</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
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
                      placeholder="House, Techno, Electronic"
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
                      placeholder="CDJ-3000, DJM-900, Pioneer"
                      className="glass border-border/50 bg-background/50"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
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
                      placeholder="@djname"
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

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Salvando..." : "Salvar DJ"}
                </Button>
                <Link href="/dashboard/djs">
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
