"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { put } from "@vercel/blob"

interface AddMediaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  djId: number
  onMediaAdded: () => void
}

export function AddMediaModal({ open, onOpenChange, djId, onMediaAdded }: AddMediaModalProps) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "logo",
    external_link: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let fileUrl = ""

      if (file) {
        const blob = await put(file.name, file, {
          access: "public",
        })
        fileUrl = blob.url
      }

      const response = await fetch("/api/dj-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dj_id: djId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          file_url: fileUrl,
          external_link: formData.external_link,
        }),
      })

      if (response.ok) {
        onMediaAdded()
        onOpenChange(false)
        setFormData({ title: "", description: "", category: "logo", external_link: "" })
        setFile(null)
      }
    } catch (error) {
      console.error("[v0] Error adding media:", error)
      alert("Erro ao adicionar mídia")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Mídia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logo">Logo</SelectItem>
                <SelectItem value="presskit">Press Kit</SelectItem>
                <SelectItem value="backdrop">Backdrop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <Input
              id="file"
              type="file"
              accept="image/*,video/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_link">Link Externo</Label>
            <Input
              id="external_link"
              type="url"
              placeholder="https://..."
              value={formData.external_link}
              onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Upload className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
