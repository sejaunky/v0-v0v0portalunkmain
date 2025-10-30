"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { login } from "@/app/actions/auth"
import BorderBeam from "@/components/BorderBeam"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // fallback
      window.location.href = '/'
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white overflow-hidden">
      <div className="relative w-64 h-64 mb-8">
        {/* Disco girando */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        >
          <Image
            src="/1df9fe09-30b0-4378-92d4-01368c5016ba.png"
            alt="Disco"
            width={250}
            height={250}
            className="rounded-full opacity-80"
          />
        </motion.div>

        {/* Logo central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={90}
            height={90}
            className="opacity-90"
          />
        </div>
      </div>

      {/* Campo de Login */}
      <BorderBeam>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-72">
          <input
            type="text"
            placeholder="Email (somente nome)"
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black rounded-xl py-2 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </BorderBeam>
    </div>
  )
}
