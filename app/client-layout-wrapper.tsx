"use client"

import type { ReactNode } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { usePathname } from "next/navigation"

interface ClientLayoutWrapperProps {
  children: ReactNode
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname()

  // Don't show the dashboard/navigation on the login page (and its subroutes).
  // This keeps the login UI clean even if a session exists.
  if (pathname && (pathname === "/login" || pathname.startsWith("/login/"))) {
    return <>{children}</>
  }

  return <AppLayout>{children}</AppLayout>
}
