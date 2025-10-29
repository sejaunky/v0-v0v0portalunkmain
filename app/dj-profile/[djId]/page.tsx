"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Music2,
  Upload,
  Calendar,
  TrendingUp,
  ImageIcon,
  FileText,
  Video,
  Trash2,
} from "lucide-react"
import { djService } from "@/services/neonService"
import { useRouter } from "next/navigation"

export default function DJProfilePage({
  params,
}: {
  params: Promise<{ djId: string }> | { djId: string }
}) {
  const router = useRouter()
  const [djId, setDjId] = useState<string>("")
  const [dj, setDj] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [medias, setMedias] = useState<any[]>([])

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const generalMediaInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const presskitInputRef = useRef<HTMLInputElement>(null)
  const backdropInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve(params)
      setDjId(resolvedParams.djId)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (djId) {
      loadDJProfile()
    }
  }, [djId])

  const loadDJProfile = async () => {
    try {
      if (djId) {
        const data = await djService.getById(djId)
        setDj(data)
        setFormData(data || {})
        setMedias([])
      }
    } catch (err) {
      console.error("[v0] Failed to load DJ profile", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingMedia(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()
      setFormData((prev: any) => ({ ...prev, avatar_url: url }))
    } catch (err) {
      console.error("[v0] Failed to upload avatar", err)
      alert("Erro ao fazer upload da imagem")
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingMedia(true)
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error("Upload failed")

        const { url } = await response.json()
        return { url, category, name: file.name, type: file.type }
      })

      const uploadedMedias = await Promise.all(uploadPromises)
      setMedias((prev) => [...prev, ...uploadedMedias])
    } catch (err) {
      console.error("[v0] Failed to upload media", err)
      alert("Erro ao fazer upload das mídias")
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await djService.update(dj.id, formData)
      setDj(formData)
      setIsEditing(false)
      alert("Perfil atualizado com sucesso!")
    } catch (err) {
      console.error("[v0] Failed to save DJ profile", err)
      alert("Erro ao salvar perfil")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <div className="text-white">Carregando perfil...</div>
      </div>
    )
  }

  if (!dj) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8">
        <Button onClick={() => router.back()} variant="ghost" className="text-white mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center text-white">Não foi possível carregar o perfil do DJ.</div>
      </div>
    )
  }

  const getInitials = (name?: string) => {
    if (!name) return "DJ"
    return name
      .split(" ")
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-slate-950">
          {formData.backdrop_url ? (
            <img
              src={formData.backdrop_url || "/placeholder.svg"}
              alt="Backdrop"
              className="w-full h-full object-cover opacity-40"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
          )}
        </div>

        <div className="absolute top-6 left-6">
          <Button onClick={() => router.back()} variant="ghost" className="text-white backdrop-blur-sm bg-black/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-950 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url || "/placeholder.svg"}
                    alt={formData.artist_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">{getInitials(formData.artist_name)}</span>
                )}
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-white" />
                </button>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 pb-2">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    name="artist_name"
                    value={formData.artist_name || ""}
                    onChange={handleInputChange}
                    className="text-3xl font-bold bg-black/40 border-purple-500/30 text-white"
                    placeholder="Nome Artístico"
                  />
                  <Input
                    name="real_name"
                    value={formData.real_name || ""}
                    onChange={handleInputChange}
                    className="text-lg bg-black/40 border-purple-500/30 text-gray-300"
                    placeholder="Nome Real"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {formData.artist_name || "DJ"}
                  </h1>
                  {formData.real_name && <p className="text-lg text-gray-300 mt-1">{formData.real_name}</p>}
                </>
              )}

              <div className="mt-3">
                {isEditing ? (
                  <Input
                    name="genre"
                    value={formData.genre || ""}
                    onChange={handleInputChange}
                    className="w-48 bg-black/40 border-purple-500/30 text-white"
                    placeholder="Gênero Musical"
                  />
                ) : (
                  <Badge className="bg-purple-600/80 text-white border-purple-500/50">
                    <Music2 className="w-3 h-3 mr-1" />
                    {formData.genre || "Não informado"}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                {isEditing ? (
                  <>
                    <Input
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      className="w-64 bg-black/40 border-purple-500/30 text-white"
                      placeholder="Email"
                    />
                    <Input
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      className="w-48 bg-black/40 border-purple-500/30 text-white"
                      placeholder="Telefone"
                    />
                    <Input
                      name="location"
                      value={formData.location || ""}
                      onChange={handleInputChange}
                      className="w-48 bg-black/40 border-purple-500/30 text-white"
                      placeholder="Localização"
                    />
                  </>
                ) : (
                  <>
                    {formData.email && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4" />
                        <span>{formData.email}</span>
                      </div>
                    )}
                    {formData.phone && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4" />
                        <span>{formData.phone}</span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {isEditing ? (
                  <>
                    <Input
                      name="instagram_url"
                      value={formData.instagram_url || ""}
                      onChange={handleInputChange}
                      className="w-48 bg-black/40 border-purple-500/30 text-white"
                      placeholder="Instagram URL"
                    />
                    <Input
                      name="tiktok_url"
                      value={formData.tiktok_url || ""}
                      onChange={handleInputChange}
                      className="w-48 bg-black/40 border-purple-500/30 text-white"
                      placeholder="TikTok URL"
                    />
                    <Input
                      name="soundcloud_url"
                      value={formData.soundcloud_url || ""}
                      onChange={handleInputChange}
                      className="w-48 bg-black/40 border-purple-500/30 text-white"
                      placeholder="SoundCloud URL"
                    />
                  </>
                ) : (
                  <>
                    {formData.instagram_url && (
                      <a
                        href={formData.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-pink-600 text-white hover:bg-pink-700 h-9 px-4 py-2"
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </a>
                    )}
                    {formData.tiktok_url && (
                      <a
                        href={formData.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-cyan-600 text-white hover:bg-cyan-700 h-9 px-4 py-2"
                      >
                        <Music2 className="w-4 h-4" />
                        TikTok
                      </a>
                    )}
                    {formData.soundcloud_url && (
                      <a
                        href={formData.soundcloud_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-orange-600 text-white hover:bg-orange-700 h-9 px-4 py-2"
                      >
                        <Music2 className="w-4 h-4" />
                        SoundCloud
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="pb-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="text-white border-white/20">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/80 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total de Eventos</p>
                  <p className="text-3xl font-bold text-white mt-1">0</p>
                  <p className="text-gray-500 text-xs mt-1">0 realizados</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Ganhos Líquidos</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mt-1">
                    R$ 0,00
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Após comissão UNK (15%)</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Mídias</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mt-1">
                    {medias.length}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Arquivos cadastrados</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-600/20 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/80 border-b border-purple-500/20 w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none px-6 py-4"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none px-6 py-4"
            >
              Eventos
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none px-6 py-4"
            >
              Financeiro
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none px-6 py-4"
            >
              Mídias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/80 border-purple-500/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Informações Pessoais</h3>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">CPF</label>
                        <Input
                          name="cpf"
                          value={formData.cpf || ""}
                          onChange={handleInputChange}
                          className="bg-black/40 border-purple-500/30 text-white"
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Data de Nascimento</label>
                        <Input
                          name="birth_date"
                          type="date"
                          value={formData.birth_date || ""}
                          onChange={handleInputChange}
                          className="bg-black/40 border-purple-500/30 text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-gray-300">
                      <div>
                        <span className="text-gray-500 text-sm">CPF:</span>{" "}
                        <span>{formData.cpf || "Não informado"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Data de Nascimento:</span>{" "}
                        <span>{formData.birth_date || "Não informado"}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-purple-500/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Dados Bancários</h3>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Chave PIX</label>
                        <Input
                          name="pix_key"
                          value={formData.pix_key || ""}
                          onChange={handleInputChange}
                          className="bg-black/40 border-purple-500/30 text-white"
                          placeholder="email@example.com ou CPF"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Banco</label>
                        <Input
                          name="bank_name"
                          value={formData.bank_name || ""}
                          onChange={handleInputChange}
                          className="bg-black/40 border-purple-500/30 text-white"
                          placeholder="Nome do banco"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400 mb-1 block">Agência</label>
                          <Input
                            name="bank_agency"
                            value={formData.bank_agency || ""}
                            onChange={handleInputChange}
                            className="bg-black/40 border-purple-500/30 text-white"
                            placeholder="0000"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400 mb-1 block">Conta</label>
                          <Input
                            name="bank_account"
                            value={formData.bank_account || ""}
                            onChange={handleInputChange}
                            className="bg-black/40 border-purple-500/30 text-white"
                            placeholder="00000-0"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-gray-300">
                      <div>
                        <span className="text-gray-500 text-sm">Chave PIX:</span>{" "}
                        <span>{formData.pix_key || "Não informado"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Banco:</span>{" "}
                        <span>{formData.bank_name || "Não informado"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Agência:</span>{" "}
                        <span>{formData.bank_agency || "Não informado"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Conta:</span>{" "}
                        <span>{formData.bank_account || "Não informado"}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-purple-500/20 lg:col-span-2">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Biografia</h3>
                  {isEditing ? (
                    <Textarea
                      name="notes"
                      value={formData.notes || ""}
                      onChange={handleInputChange}
                      className="bg-black/40 border-purple-500/30 text-white min-h-32"
                      placeholder="Conte mais sobre o DJ..."
                    />
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.notes || "Biografia não disponível."}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card className="bg-slate-900/80 border-purple-500/20">
              <CardContent className="p-6">
                <p className="text-gray-400 text-center py-12">Nenhum evento cadastrado ainda.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="mt-6">
            <Card className="bg-slate-900/80 border-purple-500/20">
              <CardContent className="p-6">
                <p className="text-gray-400 text-center py-12">Nenhuma transação financeira registrada.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => generalMediaInputRef.current?.click()}
                disabled={uploadingMedia}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingMedia ? "Enviando..." : "Upload de Mídia"}
              </Button>
              <input
                ref={generalMediaInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleMediaUpload(e, "general")}
                className="hidden"
              />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Logo
                    <Badge variant="secondary" className="ml-2">
                      {medias.filter((m) => m.category === "logo").length}
                    </Badge>
                  </h3>
                  <Button
                    onClick={() => logoInputRef.current?.click()}
                    size="sm"
                    variant="outline"
                    className="text-white border-white/20 bg-transparent"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMediaUpload(e, "logo")}
                    className="hidden"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {medias
                    .filter((m) => m.category === "logo")
                    .map((media, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-800">
                        <img
                          src={media.url || "/placeholder.svg"}
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setMedias(medias.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {medias.filter((m) => m.category === "logo").length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">Nenhum logo cadastrado</div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Presskit
                    <Badge variant="secondary" className="ml-2">
                      {medias.filter((m) => m.category === "presskit").length}
                    </Badge>
                  </h3>
                  <Button
                    onClick={() => presskitInputRef.current?.click()}
                    size="sm"
                    variant="outline"
                    className="text-white border-white/20 bg-transparent"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                  <input
                    ref={presskitInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleMediaUpload(e, "presskit")}
                    className="hidden"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {medias
                    .filter((m) => m.category === "presskit")
                    .map((media, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-800">
                        <img
                          src={media.url || "/placeholder.svg"}
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setMedias(medias.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {medias.filter((m) => m.category === "presskit").length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">Nenhum presskit cadastrado</div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Backdrop
                    <Badge variant="secondary" className="ml-2">
                      {medias.filter((m) => m.category === "backdrop").length}
                    </Badge>
                  </h3>
                  <Button
                    onClick={() => backdropInputRef.current?.click()}
                    size="sm"
                    variant="outline"
                    className="text-white border-white/20 bg-transparent"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                  <input
                    ref={backdropInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleMediaUpload(e, "backdrop")}
                    className="hidden"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {medias
                    .filter((m) => m.category === "backdrop")
                    .map((media, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-800">
                        <img
                          src={media.url || "/placeholder.svg"}
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setMedias(medias.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {medias.filter((m) => m.category === "backdrop").length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">Nenhum backdrop cadastrado</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
