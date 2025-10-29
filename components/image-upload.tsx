"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageUploaded: (url: string) => void
  folder?: string
  label?: string
  fallbackText?: string
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  folder = "avatars",
  label = "Foto de Perfil",
  fallbackText = "?",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione apenas imagens")
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem muito grande. Máximo 5MB")
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Criar preview local
      const localPreview = URL.createObjectURL(file)
      setPreviewUrl(localPreview)

      // Fazer upload para Vercel Blob
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao fazer upload")
      }

      const data = await response.json()

      // Limpar preview local
      URL.revokeObjectURL(localPreview)

      // Atualizar com URL real do Vercel Blob
      setPreviewUrl(data.url)
      onImageUploaded(data.url)
    } catch (err) {
      console.error("Erro no upload:", err)
      setError(err instanceof Error ? err.message : "Erro ao fazer upload")
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onImageUploaded("")
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium">{label}</label>

      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={previewUrl || undefined} />
          <AvatarFallback>{fallbackText}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => document.getElementById(`file-input-${folder}`)?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher Imagem
                </>
              )}
            </Button>

            {previewUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={uploading}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <input
            id={`file-input-${folder}`}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="text-xs text-muted-foreground">PNG, JPG ou GIF. Máximo 5MB.</p>
        </div>
      </div>
    </div>
  )
}
