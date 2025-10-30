"use server"

import { put } from "@vercel/blob"

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
}

export async function uploadFile(formData: FormData): Promise<{ success: boolean; error?: string; data?: UploadResult }> {
  try {
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return { success: false, error: "Nenhum arquivo foi enviado" }
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Apenas imagens são permitidas" }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Arquivo muito grande. Máximo 5MB" }
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split(".").pop()
    const filename = `${timestamp}-${randomString}.${extension}`

    const blob = await put(`${folder}/${filename}`, file, {
      access: "public",
    })

    return {
      success: true,
      data: {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
      }
    }
  } catch (error) {
    console.error("Erro no upload:", error)
    return { success: false, error: "Erro ao fazer upload do arquivo" }
  }
}
