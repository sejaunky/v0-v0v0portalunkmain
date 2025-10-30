"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDJs, type DJ } from "@/app/actions/djs"
import { motion } from "framer-motion"
import { Plus, Search, Music } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function DJsPage() {
  const [djs, setDjs] = useState<DJ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadDJs()
  }, [])

  const loadDJs = async () => {
    const data = await getDJs()
    setDjs(data)
    setLoading(false)
  }

  const filteredDJs = djs.filter((dj) => {
    const search = searchTerm.toLowerCase()
    return (
      dj.artistic_name?.toLowerCase().includes(search) ||
      dj.name?.toLowerCase().includes(search) ||
      dj.email?.toLowerCase().includes(search)
    )
  })

  return (
    <div>
      <DashboardHeader
        title="DJs"
        subtitle="Gerencie os DJs da sua assessoria"
        action={
          <Link href="/admin/dashboard/djs/new">
            <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Plus className="w-4 h-4" />
              Novo DJ
            </Button>
          </Link>
        }
      />

      <div className="p-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar DJs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="glass-strong border-border/50 p-6 animate-pulse">
                <div className="h-32 bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : filteredDJs.length === 0 ? (
          <Card className="glass-strong border-border/50 p-12 text-center">
            <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{searchTerm ? "Nenhum DJ encontrado" : "Nenhum DJ cadastrado"}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDJs.map((dj, index) => (
              <motion.div
                key={dj.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/admin/dashboard/djs/${dj.id}`}>
                  <Card className="glass-strong border-border/50 p-6 hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                        {dj.artistic_name?.charAt(0) || "DJ"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {dj.artistic_name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{dj.name}</p>
                      </div>
                    </div>
                    {dj.specializations && dj.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {dj.specializations.slice(0, 2).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {dj.specializations.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{dj.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={dj.status === "active" ? "default" : "secondary"}>{dj.status || "active"}</Badge>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
