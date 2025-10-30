"use server"

export interface DJ {
  id: number
  name: string
  artistic_name: string
  email?: string
  phone?: string
  cpf?: string
  bio?: string
  specializations?: string[]
  equipment?: string[]
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  spotify?: string
  soundcloud?: string
  status?: string
  profile_image_url?: string
  backdrop_url?: string
  logo_url?: string
  city?: string
  state?: string
  pix_key?: string
  bank_name?: string
  bank_agency?: string
  bank_account?: string
  created_at?: string
  updated_at?: string
}

export async function getDJs(): Promise<DJ[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/djs`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch DJs")
    }

    const data = await response.json()
    return data.djs || []
  } catch (error) {
    console.error("[v0] Error fetching DJs:", error)
    return []
  }
}

export async function getDJById(id: number): Promise<DJ | null> {
  try {
    const djs = await getDJs()
    return djs.find((dj) => dj.id === id) || null
  } catch (error) {
    console.error("[v0] Error fetching DJ:", error)
    return null
  }
}

export async function createDJ(data: Partial<DJ>): Promise<{ success: boolean; error?: string; dj?: DJ }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/djs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        artist_name: data.artistic_name,
        real_name: data.name,
        email: data.email,
        password: (data as any).password,
        phone: data.phone,
        cpf: data.cpf,
        notes: data.bio,
        instagram_url: data.instagram,
        youtube_url: data.youtube,
        soundcloud_url: data.soundcloud,
        avatar_url: data.profile_image_url,
        status: data.status || "ativo",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error || "Failed to create DJ" }
    }

    const result = await response.json()
    return { success: true, dj: result.dj }
  } catch (error) {
    console.error("[v0] Error creating DJ:", error)
    return { success: false, error: "Failed to create DJ" }
  }
}

export async function updateDJ(id: number, data: Partial<DJ>): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/djs`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id.toString(),
        artist_name: data.artistic_name,
        real_name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        notes: data.bio,
        instagram_url: data.instagram,
        youtube_url: data.youtube,
        soundcloud_url: data.soundcloud,
        avatar_url: data.profile_image_url,
        status: data.status,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error || "Failed to update DJ" }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating DJ:", error)
    return { success: false, error: "Failed to update DJ" }
  }
}
