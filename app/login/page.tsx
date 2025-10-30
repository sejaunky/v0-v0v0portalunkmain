"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"
import BorderBeam from "@/components/BorderBeam"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // If the user provided only the local-part, append @unk
    const emailToUse = String(email).includes("@") ? email : `${email}@unk`

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailToUse, password })
      if (error) {
        setError(error.message)
        return
      }

      const userId = data?.user?.id
      if (!userId) {
        setError('Falha ao obter usuário após login')
        return
      }

      // Fetch profile role via internal API
      try {
        const res = await fetch(`/api/auth/profile?userId=${encodeURIComponent(userId)}`)
        if (res.ok) {
          const json = await res.json()
          const role = json?.profile?.role || null
          if (role === 'admin') {
            window.location.href = '/admin/dashboard'
            return
          }
          if (role === 'producer') {
            window.location.href = '/producer-user/dashboard'
            return
          }
          // fallback: go to root or DJ area
          window.location.href = '/'
          return
        } else {
          // If profile fetch failed, fallback to root
          window.location.href = '/'
          return
        }
      } catch (err) {
        console.error('Failed to fetch profile role:', err)
        window.location.href = '/'
        return
      }
    } catch (err: any) {
      setError(err?.message || String(err))
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
            className="bg-white text-black rounded-xl py-2 font-semibold hover:bg-gray-300 transition"
          >
            Entrar
          </button>
        </form>
      </BorderBeam>
    </div>
  )
}
