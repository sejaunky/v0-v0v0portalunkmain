"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Instagram,
  Youtube,
  Music,
  Headphones,
  Eye,
  Edit,
} from "lucide-react"
import Link from "next/link"

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

interface DJCardPlayerProps {
  dj: DJ
  onEdit?: (dj: DJ) => void
}

export function DJCardPlayer({ dj, onEdit }: DJCardPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const getInitials = (name?: string | null) => {
    if (!name) return "DJ"
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 100)
    }
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 group">
      {/* Album Art / Avatar */}
      <div className="relative aspect-square overflow-hidden">
        {dj.avatar_url ? (
          <img
            src={dj.avatar_url || "/placeholder.svg"}
            alt={dj.artist_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">{getInitials(dj.artist_name)}</span>
          </div>
        )}

        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Link href={`/dj-profile/${dj.id}`}>
            <Button size="sm" variant="secondary" className="rounded-full">
              <Eye className="w-4 h-4 mr-1" />
              Ver Perfil
            </Button>
          </Link>
          {onEdit && (
            <Button size="sm" variant="secondary" onClick={() => onEdit(dj)} className="rounded-full">
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          )}
        </div>

        {/* Status Badge */}
  <div className="absolute top-2 right-2">
          <Badge
            variant={dj.is_active ? "default" : "secondary"}
            className={cn(
              "backdrop-blur-sm",
              dj.is_active
                ? "bg-green-500/80 text-white border-green-400/50"
                : "bg-gray-500/80 text-white border-gray-400/50",
            )}
          >
            {dj.status ?? (dj.is_active ? "Ativo" : "Inativo")}
          </Badge>
        </div>
      </div>

      {/* Player Info */}
  <div className="p-3 space-y-2">
        {/* Artist Name */}
        <div className="space-y-1">
          <h3 className="font-bold text-base text-white truncate">{dj.artist_name}</h3>
          {dj.real_name && <p className="text-xs text-gray-400 truncate">{dj.real_name}</p>}
        </div>

        {/* Genre Badge */}
        {dj.genre && (
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Music className="w-3 h-3 mr-1" />
            {dj.genre}
          </Badge>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>0:00</span>
            <span>3:45</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-2 py-1">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md shadow-purple-500/40 transition-all hover:scale-105"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Social Links & Volume */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            {dj.instagram_url && (
              <a href={dj.instagram_url} target="_blank" rel="noopener noreferrer">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                >
                  <Instagram className="w-4 h-4" />
                </Button>
              </a>
            )}
            {dj.youtube_url && (
              <a href={dj.youtube_url} target="_blank" rel="noopener noreferrer">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Youtube className="w-4 h-4" />
                </Button>
              </a>
            )}
            {dj.soundcloud_url && (
              <a href={dj.soundcloud_url} target="_blank" rel="noopener noreferrer">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                >
                  <Headphones className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>

          <Button size="icon" variant="ghost" className="w-7 h-7 text-gray-400 hover:text-white hover:bg-white/10">
            <Volume2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
