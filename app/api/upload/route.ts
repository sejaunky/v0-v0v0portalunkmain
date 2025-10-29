import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo foi enviado" }, { status: 400 })
    }

    // Validar tipo de arquivo (apenas imagens)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 })
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 5MB" }, { status: 400 })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split(".").pop()
    const filename = `${timestamp}-${randomString}.${extension}`

    // Upload para Vercel Blob
    const blob = await put(`${folder}/${filename}`, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
    })
  } catch (error) {
    console.error("Erro no upload:", error)
    return NextResponse.json({ error: "Erro ao fazer upload do arquivo" }, { status: 500 })
  }
}
