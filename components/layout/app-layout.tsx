"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import ModernNav from "./modern-nav"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, role } = useAuth()

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <ModernNav />
      <main className="pt-[100px] sm:pt-[100px] pb-20 sm:pb-8 px-4 sm:px-6 lg:px-8 transition-all">
        <div className="container mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
