"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDJById, type DJ } from "@/app/actions/djs"
import { getEvents, type Event } from "@/app/actions/events"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Music,
  Calendar,
  DollarSign,
  MapPin,
  ImageIcon,
  FileText,
  Palette,
  Plus,
  ExternalLink,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { AddMediaModal } from "@/components/add-media-modal"

export default function DJProfilePage() {
  const params = useParams()
  const djId = Number(params.id)
  const [dj, setDj] = useState<DJ | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [djMedia, setDjMedia] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [djId])

  const loadData = async () => {
    setLoading(true)
    const djData = await getDJById(djId)
    const eventsData = await getEvents()

    if (djData) {
      setDj(djData)
      const djEvents = eventsData.filter((event) => event.djs?.some((d) => d.id === djId))
      setEvents(djEvents)

      await loadMedia()
    }
    setLoading(false)
  }

  const loadMedia = async () => {
    try {
      const response = await fetch(`/api/dj-media?djId=${djId}`)
      const data = await response.json()
      setDjMedia(data.media || [])
    } catch (error) {
      console.error("[v0] Error loading media:", error)
    }
  }

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta mídia?")) return

    try {
      const response = await fetch(`/api/dj-media?id=${mediaId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadMedia()
      }
    } catch (error) {
      console.error("[v0] Error deleting media:", error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "logo":
        return <Palette className="w-5 h-5" />
      case "presskit":
        return <FileText className="w-5 h-5" />
      case "backdrop":
        return <ImageIcon className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "logo":
        return "Logo"
      case "presskit":
        return "Press Kit"
      case "backdrop":
        return "Backdrop"
      default:
        return category
    }
  }

  if (loading || !dj) {
    return (
      <div>
        <DashboardHeader title="Carregando..." subtitle="Aguarde" />
        <div className="p-8">
          <div className="glass-strong rounded-xl h-96 animate-pulse" />
        </div>
      </div>
    )
  }

  const totalEarnings = events.reduce((sum, event) => {
    const djInEvent = event.djs?.find((d) => d.id === djId)
    return sum + (djInEvent?.fee || 0)
  }, 0)

  return (
    <div className="min-h-screen">
      <div className="relative h-[400px] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          {dj.backdrop_url || dj.logo_url ? (
            <img
              src={dj.backdrop_url || dj.logo_url || "/placeholder.svg"}
              alt={dj.artistic_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="relative h-full flex flex-col justify-end p-8">
          <Link href="/dashboard/djs">
            <Button
              variant="ghost"
              className="absolute top-4 left-4 gap-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>

          <Link href={`/dashboard/djs/${djId}/edit`}>
            <Button className="absolute top-4 right-4 gap-2 bg-white/90 backdrop-blur-sm hover:bg-white text-black">
              <Edit className="w-4 h-4" />
              Editar Perfil
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto w-full"
          >
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">{dj.artistic_name}</h1>
            <p className="text-xl text-white/90 mb-4 drop-shadow-md">{dj.name}</p>

            {dj.specializations && dj.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {dj.specializations.map((spec) => (
                  <Badge
                    key={spec}
                    className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-sm px-3 py-1"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-white">
              <div>
                <div className="text-2xl font-bold">{events.length}</div>
                <div className="text-sm text-white/80">Eventos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">R$ {totalEarnings.toLocaleString("pt-BR")}</div>
                <div className="text-sm text-white/80">Total Recebido</div>
              </div>
              <div>
                <div className="text-2xl font-bold capitalize">{dj.status}</div>
                <div className="text-sm text-white/80">Status</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="media">Mídias</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card className="glass-strong border-border/50 p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Contato</h3>
                <div className="space-y-3">
                  {dj.email && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="w-5 h-5" />
                      <span>{dj.email}</span>
                    </div>
                  )}
                  {dj.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="w-5 h-5" />
                      <span>{dj.phone}</span>
                    </div>
                  )}
                  {dj.city && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5" />
                      <span>
                        {dj.city}
                        {dj.state && `, ${dj.state}`}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="glass-strong border-border/50 p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Biografia</h3>
                <p className="text-muted-foreground leading-relaxed">{dj.bio || "Nenhuma biografia cadastrada."}</p>
              </Card>

              {dj.equipment && dj.equipment.length > 0 && (
                <Card className="glass-strong border-border/50 p-6 md:col-span-2">
                  <h3 className="text-xl font-bold text-foreground mb-4">Equipamentos</h3>
                  <div className="flex flex-wrap gap-2">
                    {dj.equipment.map((item) => (
                      <Badge key={item} variant="outline" className="text-sm">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {events.length === 0 ? (
                <Card className="glass-strong border-border/50 p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum evento cadastrado</p>
                </Card>
              ) : (
                events.map((event) => {
                  const djInEvent = event.djs?.find((d) => d.id === djId)
                  return (
                    <Card
                      key={event.id}
                      className="glass-strong border-border/50 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-foreground mb-2">{event.name}</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.event_date).toLocaleDateString("pt-BR")}</span>
                              {event.event_time && <span>às {event.event_time}</span>}
                            </div>
                            {event.venue && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{event.venue}</span>
                              </div>
                            )}
                            {djInEvent?.set_time && (
                              <div className="flex items-center gap-2">
                                <Music className="w-4 h-4" />
                                <span>Set: {djInEvent.set_time}</span>
                                {djInEvent.set_duration && <span>({djInEvent.set_duration} min)</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={event.status === "confirmed" ? "default" : "secondary"} className="mb-2">
                            {event.status}
                          </Badge>
                          {djInEvent?.fee && (
                            <div className="text-lg font-bold text-primary">
                              R$ {djInEvent.fee.toLocaleString("pt-BR")}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </motion.div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="glass-strong border-border/50 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-medium text-muted-foreground">Total Recebido</h3>
                </div>
                <p className="text-3xl font-bold text-foreground">R$ {totalEarnings.toLocaleString("pt-BR")}</p>
              </Card>

              <Card className="glass-strong border-border/50 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <h3 className="text-sm font-medium text-muted-foreground">Total de Eventos</h3>
                </div>
                <p className="text-3xl font-bold text-foreground">{events.length}</p>
              </Card>

              <Card className="glass-strong border-border/50 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-accent" />
                  <h3 className="text-sm font-medium text-muted-foreground">Média por Evento</h3>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  R${" "}
                  {events.length > 0
                    ? (totalEarnings / events.length).toLocaleString("pt-BR", { maximumFractionDigits: 0 })
                    : "0"}
                </p>
              </Card>

              {/* Payment Info */}
              {(dj.pix_key || dj.bank_name) && (
                <Card className="glass-strong border-border/50 p-6 md:col-span-3">
                  <h3 className="text-xl font-bold text-foreground mb-4">Dados Bancários</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dj.pix_key && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Chave PIX</p>
                        <p className="text-foreground font-medium">{dj.pix_key}</p>
                      </div>
                    )}
                    {dj.bank_name && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Banco</p>
                        <p className="text-foreground font-medium">{dj.bank_name}</p>
                      </div>
                    )}
                    {dj.bank_agency && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Agência</p>
                        <p className="text-foreground font-medium">{dj.bank_agency}</p>
                      </div>
                    )}
                    {dj.bank_account && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Conta</p>
                        <p className="text-foreground font-medium">{dj.bank_account}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Add media button */}
              <div className="flex justify-end">
                <Button onClick={() => setMediaModalOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4" />
                  Adicionar Mídia
                </Button>
              </div>

              {/* Media categories */}
              {["logo", "presskit", "backdrop"].map((category) => {
                const categoryMedia = djMedia.filter((m) => m.category === category)

                return (
                  <Card key={category} className="glass-strong border-border/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {getCategoryIcon(category)}
                      <h3 className="text-xl font-bold text-foreground">{getCategoryLabel(category)}</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {categoryMedia.length}
                      </Badge>
                    </div>

                    {categoryMedia.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nenhuma mídia cadastrada nesta categoria</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryMedia.map((media) => (
                          <Card key={media.id} className="glass border-border/50 p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-foreground">{media.title}</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteMedia(media.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {media.description && (
                              <p className="text-sm text-muted-foreground mb-3">{media.description}</p>
                            )}

                            <div className="flex gap-2">
                              {media.file_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 bg-transparent"
                                  onClick={() => window.open(media.file_url, "_blank")}
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Arquivo
                                </Button>
                              )}
                              {media.external_link && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 bg-transparent"
                                  onClick={() => window.open(media.external_link, "_blank")}
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Link
                                </Button>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(media.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card>
                )
              })}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <AddMediaModal open={mediaModalOpen} onOpenChange={setMediaModalOpen} djId={djId} onMediaAdded={loadMedia} />
    </div>
  )
}
