"use client"

"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, Search, Filter, Grid3x3, List, Clock, AlertCircle, User, Users, MapPin, DollarSign, Trash2, Edit as EditIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type AgendaItem = {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  status: "todo" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  category: "instagram" | "music_project" | "set_release" | "event" | "personal"
}

type Prospeccao = {
  id: string
  title: string
  description?: string | null
  location?: string | null
  data?: string | null
  budget?: number | null
  client_name?: string | null
  client_contact?: string | null
  dj_id?: string | null
  dj_name?: string | null
  producer_name?: string | null
  status?: "prospecção" | "negociação" | "fechado" | "perdido"
  created_at: string
}

const statusOptions = [
  { value: "todo", label: "A Fazer", color: "bg-gray-500" },
  { value: "in_progress", label: "Em Andamento", color: "bg-yellow-500" },
  { value: "completed", label: "Concluído", color: "bg-green-500" },
]

const priorityOptions = [
  { value: "low", label: "Baixa", color: "bg-blue-500" },
  { value: "medium", label: "Média", color: "bg-orange-500" },
  { value: "high", label: "Alta", color: "bg-red-500" },
]

const categoryOptions = [
  { value: "personal", label: "Pessoal", icon: "👤" },
  { value: "event", label: "Evento", icon: "🎉" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "music_project", label: "Projeto Musical", icon: "🎵" },
  { value: "set_release", label: "Lançamento", icon: "🚀" },
]

export default function AgendaManagerPage() {
  const [items, setItems] = useState<AgendaItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "kanban">("grid")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProspeccaoOpen, setIsProspeccaoOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("agenda-items")
      if (stored) {
        try {
          setItems(JSON.parse(stored))
        } catch (error) {
          console.error("Error loading agenda items:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && items.length > 0) {
      localStorage.setItem("agenda-items", JSON.stringify(items))
    }
  }, [items])

  const handleAddItem = (formData: Partial<AgendaItem>) => {
    if (editingItem) {
      setItems(items.map((item) => (item.id === editingItem.id ? { ...item, ...formData } : item)))
      toast({ title: "Item atualizado com sucesso!" })
    } else {
      const newItem: AgendaItem = {
        id: Date.now().toString(),
        title: formData.title || "",
        description: formData.description,
        date: formData.date || new Date().toISOString().split("T")[0],
        time: formData.time,
        status: formData.status || "todo",
        priority: formData.priority || "medium",
        category: formData.category || "personal",
      }
      setItems([...items, newItem])
      toast({ title: "Item adicionado com sucesso!" })
    }
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    toast({ title: "Item removido com sucesso!" })
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const groupedByStatus = {
    todo: filteredItems.filter((item) => item.status === "todo"),
    in_progress: filteredItems.filter((item) => item.status === "in_progress"),
    completed: filteredItems.filter((item) => item.status === "completed"),
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Agenda Manager
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie suas tarefas e compromissos</p>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingItem(null)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <AgendaItemDialog
                item={editingItem}
                onSave={handleAddItem}
                onClose={() => {
                  setIsDialogOpen(false)
                  setEditingItem(null)
                }}
              />
            </Dialog>

            <Dialog open={isProspeccaoOpen} onOpenChange={setIsProspeccaoOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Prospecção</Button>
              </DialogTrigger>
              <ProspeccaoDialog
                onClose={() => setIsProspeccaoOpen(false)}
                onSave={() => {
                  setIsProspeccaoOpen(false)
                  toast({ title: "Prospecção salva com sucesso!" })
                }}
              />
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="glass-card border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("kanban")}
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusOptions.map((status) => (
              <Card key={status.value} className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", status.color)} />
                    {status.label}
                    <Badge variant="secondary" className="ml-auto">
                      {groupedByStatus[status.value as keyof typeof groupedByStatus].length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {groupedByStatus[status.value as keyof typeof groupedByStatus].map((item) => (
                    <AgendaItemCard
                      key={item.id}
                      item={item}
                      onEdit={() => {
                        setEditingItem(item)
                        setIsDialogOpen(true)
                      }}
                      onDelete={() => handleDeleteItem(item.id)}
                    />
                  ))}
                  {groupedByStatus[status.value as keyof typeof groupedByStatus].length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhuma tarefa</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div
            className={cn(viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3")}
          >
            {filteredItems.length === 0 ? (
              <Card className="glass-card border-primary/20 col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <AgendaItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => {
                    setEditingItem(item)
                    setIsDialogOpen(true)
                  }}
                  onDelete={() => handleDeleteItem(item.id)}
                  compact={viewMode === "list"}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AgendaItemCard({
  item,
  onEdit,
  onDelete,
  compact = false,
}: {
  item: AgendaItem
  onEdit: () => void
  onDelete: () => void
  compact?: boolean
}) {
  const status = statusOptions.find((s) => s.value === item.status)
  const priority = priorityOptions.find((p) => p.value === item.priority)
  const category = categoryOptions.find((c) => c.value === item.category)

  return (
    <Card
      className={cn(
        "glass-card border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
        compact && "flex items-center",
      )}
    >
      <CardContent className={cn("p-4", compact && "flex-1 flex items-center gap-4")}>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                ✏️
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                🗑️
              </Button>
            </div>
          </div>

          {item.description && !compact && <p className="text-sm text-muted-foreground">{item.description}</p>}

          <div className="flex flex-wrap gap-2">
            <Badge className={cn("text-white", status?.color)}>{status?.label}</Badge>
            <Badge className={cn("text-white", priority?.color)}>{priority?.label}</Badge>
            <Badge variant="outline">
              {category?.icon} {category?.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date(item.date).toLocaleDateString("pt-BR")}
            {item.time && (
              <>
                <Clock className="w-4 h-4 ml-2" />
                {item.time}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AgendaItemDialog({
  item,
  onSave,
  onClose,
}: {
  item: AgendaItem | null
  onSave: (data: Partial<AgendaItem>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState<Partial<AgendaItem>>(
    item || {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      status: "todo",
      priority: "medium",
      category: "personal",
    },
  )

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{item ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        <DialogDescription>Preencha os detalhes da tarefa</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Nome da tarefa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detalhes da tarefa"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(value: any) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={() => onSave(formData)}
          disabled={!formData.title}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {item ? "Atualizar" : "Criar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function ProspeccaoDialog({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Prospeccao>>({
    title: "",
    description: "",
    location: "",
    data: new Date().toISOString().split("T")[0],
    budget: undefined,
    client_name: "",
    client_contact: "",
    dj_id: "",
    dj_name: "",
    producer_name: "",
  })

  const [djs, setDjs] = useState<{ id: string; label: string }[]>([])
  const [producers, setProducers] = useState<{ id: string; label: string }[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return

    let mounted = true

    const loadFromLocalStorage = () => {
      try {
        const rawProfiles = localStorage.getItem("profiles")
        if (rawProfiles) {
          const parsed = JSON.parse(rawProfiles)
          if (Array.isArray(parsed)) {
            const map = parsed
              .filter((p: any) => p && p.id)
              .map((p: any) => ({ id: p.id, label: p.artist_name || p.full_name || p.email || "DJ sem nome" }))
            setDjs(map)
          }
        }
      } catch (e) {
        // ignore
      }

      try {
        const rawProducers = localStorage.getItem("producers")
        if (rawProducers) {
          const parsed = JSON.parse(rawProducers)
          if (Array.isArray(parsed)) {
            const map = parsed.map((p: any) => ({ id: p.id || p.name || String(p), label: p.name || p }))
            setProducers(map)
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const fetchLists = async () => {
      try {
        const [djsRes, producersRes] = await Promise.all([
          fetch('/api/djs').then((r) => r.json()).catch((e) => ({ error: String(e) })),
          fetch('/api/producers').then((r) => r.json()).catch((e) => ({ error: String(e) })),
        ])

        if (!mounted) return

        // DJs
        if (djsRes && Array.isArray((djsRes as any).djs)) {
          const rows = (djsRes as any).djs
          setDjs(rows.map((p: any) => ({ id: p.id, label: p.artist_name || p.name || p.real_name || p.full_name || p.email || 'DJ sem nome' })))
        } else if (Array.isArray(djsRes)) {
          setDjs((djsRes as any).map((p: any) => ({ id: p.id, label: p.artist_name || p.name || p.real_name || p.full_name || p.email || 'DJ sem nome' })))
        } else {
          // fallback to localStorage
          loadFromLocalStorage()
        }

        // Producers
        if (producersRes && Array.isArray((producersRes as any).producers)) {
          const rows = (producersRes as any).producers
          setProducers(rows.map((p: any) => ({ id: p.id, label: p.name || p.company || p.email || 'Produtor sem nome' })))
        } else if (Array.isArray(producersRes)) {
          setProducers((producersRes as any).map((p: any) => ({ id: p.id || p.name || String(p), label: p.name || p })))
        } else {
          // fallback
          const rawProducers = localStorage.getItem('producers')
          if (rawProducers) {
            try {
              const parsed = JSON.parse(rawProducers)
              if (Array.isArray(parsed)) {
                setProducers(parsed.map((p: any) => ({ id: p.id || p.name || String(p), label: p.name || p })))
              }
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch DJs or producers from API, falling back to localStorage', err)
        loadFromLocalStorage()
      }
    }

    fetchLists()

    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async () => {
    if (!formData.title || !formData.client_name) {
      toast({ title: "Preencha título e cliente", variant: "destructive" })
      return
    }

    const payload = {
      title: formData.title,
      description: formData.description || null,
      location: formData.location || null,
      data: formData.data || null,
      budget: typeof formData.budget === 'number' ? formData.budget : formData.budget ? Number(formData.budget) : null,
      client_name: formData.client_name || null,
      client_contact: formData.client_contact || null,
      dj_id: formData.dj_id || null,
      dj_name: formData.dj_name || null,
      status: 'prospecção',
    }

    try {
      const res = await fetch('/api/prospeccoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to save')
      }

      await res.json()
      toast({ title: 'Prospecção salva' })
      onSave()
    } catch (err) {
      console.error('Failed to save prospecção to API, falling back to localStorage', err)
      try {
        const raw = localStorage.getItem('prospeccoes')
        const existing: Prospeccao[] = raw ? JSON.parse(raw) : []
        const newRow: Prospeccao = {
          id: Date.now().toString(),
          title: payload.title || '',
          description: payload.description || null,
          location: payload.location || null,
          data: payload.data || null,
          budget: payload.budget || null,
          client_name: payload.client_name || null,
          client_contact: payload.client_contact || null,
          dj_id: payload.dj_id || null,
          dj_name: payload.dj_name || null,
          status: 'prospecção',
          created_at: new Date().toISOString(),
        }
        const updated = [newRow, ...existing]
        localStorage.setItem('prospeccoes', JSON.stringify(updated))
        toast({ title: 'Prospecção salva localmente (fallback)' })
        onSave()
      } catch (e) {
        console.error(e)
        toast({ title: 'Erro ao salvar prospecção', variant: 'destructive' })
      }
    }
  }

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Nova Prospecção</DialogTitle>
        <DialogDescription>Crie uma prospecção de data de evento</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Título *</Label>
          <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Cliente *</Label>
            <Input value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
          </div>

          <div>
            <Label>Contato</Label>
            <Input value={formData.client_contact} onChange={(e) => setFormData({ ...formData, client_contact: e.target.value })} placeholder="Telefone ou email" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>DJ (Selecione ou digite)</Label>
            {djs.length > 0 ? (
              <Select value={formData.dj_id || ""} onValueChange={(v) => setFormData({ ...formData, dj_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um DJ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {djs.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={formData.dj_name} onChange={(e) => setFormData({ ...formData, dj_name: e.target.value })} placeholder="Nome do DJ" />
            )}
          </div>

          <div>
            <Label>Produtor (Selecione ou digite)</Label>
            {producers.length > 0 ? (
              <Select value={formData.producer_name || ""} onValueChange={(v) => setFormData({ ...formData, producer_name: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produtor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {producers.map((p) => (
                    <SelectItem key={p.id} value={p.label}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={formData.producer_name} onChange={(e) => setFormData({ ...formData, producer_name: e.target.value })} placeholder="Nome do produtor" />
            )}
          </div>

          <div>
            <Label>Data</Label>
            <Input type="date" value={formData.data || ""} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Local</Label>
            <Input value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          </div>
          <div>
            <Label>Orçamento (R$)</Label>
            <Input type="number" value={formData.budget ? String(formData.budget) : ""} onChange={(e) => setFormData({ ...formData, budget: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
          <div>
            <Label>Contato do cliente</Label>
            <Input value={formData.client_contact || ""} onChange={(e) => setFormData({ ...formData, client_contact: e.target.value })} />
          </div>
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-500 to-pink-500">Salvar</Button>
      </DialogFooter>
    </DialogContent>
  )
}
