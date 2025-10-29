"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loading } from "@/components/ui/loading"
import { DJCardPlayer } from "@/components/dj-card-player"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Search } from "lucide-react"

interface DJ {
  id: string
  artist_name: string
  real_name?: string | null
  email?: string | null
  avatar_url?: string | null
  genre?: string | null
  base_price?: number | null
  status?: string | null
  instagram_url?: string | null
  youtube_url?: string | null
  tiktok_url?: string | null
  soundcloud_url?: string | null
  birth_date?: string | null
  is_active?: boolean | null
}

type DJFormValues = Omit<
  Pick<
    DJ,
    | "artist_name"
    | "real_name"
    | "email"
    | "genre"
    | "base_price"
    | "instagram_url"
    | "youtube_url"
    | "tiktok_url"
    | "soundcloud_url"
    | "birth_date"
    | "status"
    | "is_active"
  >,
  never
>

const getInitials = (name?: string | null) => {
  if (!name) return "DJ"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) {
    return null
  }

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  } catch (error) {
    console.error("Failed to format currency:", error)
    return null
  }
}

const formatDateForInput = (value?: string | null) => {
  if (!value) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
}

const DJManagementPage = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDJ, setSelectedDJ] = useState<DJ | null>(null)

  const {
    data: djsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<{ djs: DJ[] }, Error>({
    queryKey: ["djs"],
    queryFn: async () => {
      const response = await fetch("/api/djs")
      if (!response.ok) {
        throw new Error("Failed to fetch DJs")
      }
      return response.json()
    },
  })

  const djs = djsData?.djs || []

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setSelectedDJ(null)
    }
  }

  const createDJMutation = useMutation({
    mutationFn: async (payload: DJFormValues) => {
      const response = await fetch("/api/djs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create DJ")
      }

      const result = await response.json()
      return result.dj as DJ
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["djs"] })
      handleDialogChange(false)
      toast({ title: "DJ cadastrado com sucesso!" })
    },
    onError: (mutationError: unknown) => {
      const description =
        mutationError instanceof Error ? mutationError.message : "Não foi possível concluir o cadastro."
      toast({
        title: "Erro ao cadastrar DJ",
        description,
        variant: "destructive",
      })
    },
  })

  const updateDJMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & DJFormValues) => {
      const response = await fetch("/api/djs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update DJ")
      }

      const result = await response.json()
      return result.dj as DJ
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["djs"] })
      handleDialogChange(false)
      toast({ title: "DJ atualizado com sucesso!" })
    },
    onError: (mutationError: unknown) => {
      const description = mutationError instanceof Error ? mutationError.message : "Tente novamente mais tarde."
      toast({
        title: "Erro ao atualizar DJ",
        description,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const parseBasePrice = () => {
      const basePrice = formData.get("base_price")
      if (!basePrice) {
        return null
      }

      const numeric = Number(basePrice)
      return Number.isFinite(numeric) ? numeric : null
    }

    const birthRaw = formData.get("birth_date")?.toString().trim() || ""

    const payload: DJFormValues = {
      artist_name: (formData.get("artist_name")?.toString() ?? "").trim(),
      real_name: formData.get("real_name")?.toString().trim() || null,
      email: formData.get("email")?.toString().trim() || null,
      genre: formData.get("genre")?.toString().trim() || null,
      base_price: parseBasePrice(),
      instagram_url: formData.get("instagram_url")?.toString().trim() || null,
      youtube_url: formData.get("youtube_url")?.toString().trim() || null,
      tiktok_url: formData.get("tiktok_url")?.toString().trim() || null,
      soundcloud_url: formData.get("soundcloud_url")?.toString().trim() || null,
      birth_date: birthRaw ? birthRaw : null,
      status: selectedDJ?.status ?? "Ativo",
      is_active: selectedDJ?.is_active ?? true,
    }

    if (selectedDJ) {
      updateDJMutation.mutate({ id: selectedDJ.id, ...payload })
    } else {
      createDJMutation.mutate({ ...payload, status: "Ativo", is_active: true })
    }
  }

  const filteredDJs = useMemo(() => {
    if (!searchTerm) {
      return djs
    }

    const normalizedTerm = searchTerm.toLowerCase()

    return djs.filter((dj) => {
      const candidates = [dj.artist_name, dj.real_name, dj.genre, dj.email, dj.status]
      return candidates.some((value) => value?.toLowerCase?.().includes(normalizedTerm))
    })
  }, [djs, searchTerm])

  const isSaving = createDJMutation.isPending || updateDJMutation.isPending

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Gerenciar DJs
          </h1>
          <p className="mt-2 text-muted-foreground">Cadastre e gerencie os DJs da assessoria</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setSelectedDJ(null)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 border-0 transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo DJ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDJ ? "Editar DJ" : "Cadastrar Novo DJ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="artist_name">Nome Artístico *</Label>
                  <Input id="artist_name" name="artist_name" defaultValue={selectedDJ?.artist_name ?? ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="real_name">Nome Real</Label>
                  <Input id="real_name" name="real_name" defaultValue={selectedDJ?.real_name ?? ""} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={selectedDJ?.email ?? ""} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    defaultValue={formatDateForInput(selectedDJ?.birth_date ?? null)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="genre">Gênero Musical</Label>
                  <Input id="genre" name="genre" defaultValue={selectedDJ?.genre ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_price">Cachê Base (R$)</Label>
                  <Input
                    id="base_price"
                    name="base_price"
                    type="number"
                    step="0.01"
                    defaultValue={selectedDJ?.base_price?.toString() ?? ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram URL</Label>
                <Input id="instagram_url" name="instagram_url" defaultValue={selectedDJ?.instagram_url ?? ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube_url">YouTube URL</Label>
                <Input id="youtube_url" name="youtube_url" defaultValue={selectedDJ?.youtube_url ?? ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok_url">TikTok URL</Label>
                <Input id="tiktok_url" name="tiktok_url" defaultValue={selectedDJ?.tiktok_url ?? ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="soundcloud_url">SoundCloud URL</Label>
                <Input id="soundcloud_url" name="soundcloud_url" defaultValue={selectedDJ?.soundcloud_url ?? ""} />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {selectedDJ ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, gênero..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="pl-10 bg-muted/50 border-purple-500/20 focus:border-purple-500/40"
        />
      </div>

      {/* DJ Cards Grid */}
      {isLoading ? (
        <Loading message="Carregando DJs..." className="min-h-[60vh]" />
      ) : isError ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
          <p className="text-lg font-semibold text-destructive">Não foi possível carregar os DJs.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDJs.map((dj, index) => (
            <div
              key={dj.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <DJCardPlayer
                dj={dj}
                onEdit={(dj) => {
                  setSelectedDJ(dj)
                  handleDialogChange(true)
                }}
              />
            </div>
          ))}
        </div>
      )}

      {filteredDJs.length === 0 && !isLoading && (
        <div className="py-12 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 opacity-50">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <p className="text-muted-foreground">{searchTerm ? "Nenhum DJ encontrado" : "Nenhum DJ cadastrado ainda"}</p>
        </div>
      )}
    </div>
  )
}

export default DJManagementPage
