# Como Usar o Vercel Blob Storage

O Vercel Blob Storage está configurado e pronto para uso no projeto. Aqui está como usar:

## 1. Variável de Ambiente

Certifique-se de que a variável `BLOB_READ_WRITE_TOKEN` está configurada no seu projeto Vercel:

\`\`\`
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_c6Cr9m6yScsD3uEB_JD2YxBDkwl2Vl924SHTJs9z2aU83vP"
\`\`\`

## 2. Executar Script SQL

Execute o script para adicionar as colunas de imagem nas tabelas:

\`\`\`bash
# O script será executado automaticamente no próximo deploy
# Ou execute manualmente via Neon SQL Editor
\`\`\`

Arquivo: `scripts/003_add_image_columns.sql`

## 3. Upload de Imagens no Frontend

Use o componente `ImageUpload` para fazer upload de imagens:

\`\`\`tsx
import { ImageUpload } from "@/components/image-upload"

function MeuFormulario() {
  const [avatarUrl, setAvatarUrl] = useState<string>("")

  return (
    <form>
      <ImageUpload
        currentImageUrl={avatarUrl}
        onImageUploaded={setAvatarUrl}
        folder="djs" // ou "producers", "avatars", etc.
        label="Foto do DJ"
        fallbackText="DJ"
      />
      
      {/* Outros campos do formulário */}
    </form>
  )
}
\`\`\`

## 4. Salvar no Banco de Dados

Ao criar ou atualizar um DJ/Producer, inclua o `avatar_url`:

\`\`\`typescript
// Criar DJ com avatar
const response = await fetch("/api/djs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    artist_name: "DJ Example",
    email: "dj@example.com",
    avatar_url: avatarUrl, // URL do Vercel Blob
    // ... outros campos
  })
})

// Atualizar DJ com avatar
const response = await fetch("/api/djs", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: "dj-id",
    avatar_url: avatarUrl,
    // ... outros campos
  })
})
\`\`\`

## 5. Exibir Imagens

Use o componente `Avatar` do shadcn/ui:

\`\`\`tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function DJCard({ dj }) {
  return (
    <div>
      <Avatar>
        <AvatarImage src={dj.avatar_url || "/placeholder.svg"} />
        <AvatarFallback>{dj.artist_name[0]}</AvatarFallback>
      </Avatar>
      <h3>{dj.artist_name}</h3>
    </div>
  )
}
\`\`\`

## 6. Onde as Imagens São Usadas

- **DJs**: `avatar_url` - Foto do perfil do DJ
- **Producers**: `avatar_url` - Foto do perfil do produtor
- **Payments**: `payment_proof_url` - Comprovante de pagamento
- **Users**: `avatar` - Foto do perfil do usuário (tabela user_profiles)

## 7. API de Upload

A rota `/api/upload` aceita:

- **Método**: POST
- **Body**: FormData com:
  - `file`: Arquivo de imagem
  - `folder`: Pasta de destino (opcional, padrão: "uploads")

**Resposta**:
\`\`\`json
{
  "url": "https://blob.vercel-storage.com/...",
  "pathname": "/folder/filename.jpg",
  "contentType": "image/jpeg"
}
\`\`\`

## 8. Validações

O upload tem as seguintes validações:
- ✅ Apenas imagens (image/*)
- ✅ Tamanho máximo: 5MB
- ✅ Nome único gerado automaticamente
- ✅ Armazenamento público no Vercel Blob

## 9. Deletar Imagens (Opcional)

Para deletar uma imagem do Vercel Blob:

\`\`\`typescript
import { storageService } from "@/services/neonService"

await storageService.delete(imageUrl)
\`\`\`

## Pronto!

Agora você pode fazer upload de imagens para DJs, Produtores e Comprovantes de Pagamento usando o Vercel Blob Storage! 🎉
