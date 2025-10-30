"use client"

"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { login } from "@/app/actions/auth"
import { BorderBeam } from "@/registry/magicui/border-beam"
import MorphingText from "@/registry/magicui/morphing-text"
import { Play, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)

  const handleLogin = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault()
    setError("")
    setLoading(true)

    const emailToUse = String(email).includes("@") ? email : `${email}@unk`

    try {
      const result = await login(emailToUse, password)

      if (!result || !result.success) {
        setError(result?.error || 'Falha ao efetuar login')
        setLoading(false)
        return
      }

      const role = result.user?.role || null

      if (role === 'admin') {
        window.location.href = '/admin/dashboard'
        return
      }

      if (role === 'producer') {
        window.location.href = '/producer-user/dashboard'
        return
      }

      window.location.href = '/'
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = async () => {
    setPlaying((p) => !p)
    // If user provided credentials, play triggers login for quick access
    if (email && password) {
      await handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <Card className="relative w-[350px] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MorphingText texts={["Bem-Vindo(a)"]} />
            <span className="text-lg font-medium">ao Portal UNK</span>
          </CardTitle>
          <CardDescription />
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="h-48 w-48 rounded-lg bg-gradient-to-br from-purple-500 to-gray-500 overflow-hidden flex items-center justify-center">
              <img src="/u branco.png" alt="logo" className="object-contain h-40 w-40" />
            </div>

            <div className="w-full">
              <div className="bg-secondary h-1 w-full rounded-full overflow-hidden">
                <div className="bg-primary h-full w-1/3 rounded-full" />
              </div>
              <div className="text-muted-foreground flex w-full justify-between text-sm mt-2">
                <span>2:45</span>
                <span>8:02</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => {}}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" className="rounded-full" onClick={handlePlay}>
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => {}}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <form onSubmit={handleLogin} className="flex flex-col space-y-3">
              <input
                type="text"
                placeholder="Email (somente nome)"
                className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:outline-none w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:outline-none w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-black rounded-xl py-2 font-semibold hover:bg-gray-300 transition disabled:opacity-50 w-40"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-4" />

        <BorderBeam duration={6} size={420} className="from-transparent via-red-500 to-transparent" />
        <BorderBeam duration={6} delay={3} size={420} borderWidth={2} className="from-transparent via-blue-500 to-transparent" />
      </Card>
    </div>
  )
}
