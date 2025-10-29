"use client"

import type React from "react"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

function LocationProvider({ children }: { children: (location: string) => React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const location = useMemo(() => {
    const queryString = searchParams?.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  }, [pathname, searchParams])

  return <>{children(location)}</>
}

export function useLocation(): [string, (path: string) => void] {
  const router = useRouter()
  const pathname = usePathname()

  const location = pathname

  const setLocation = useCallback(
    (path: string) => {
      router.push(path)
    },
    [router],
  )

  return [location, setLocation]
}

// Hash-based location hook for backwards compatibility
export function useHashLocation(): [string, (path: string) => void] {
  const router = useRouter()
  const pathname = usePathname()

  // In Next.js, we don't use hash-based routing by default
  // This is a fallback that converts to path-based routing
  const location = pathname

  const setLocation = useCallback(
    (path: string) => {
      // Remove hash if present
      const cleanPath = path.startsWith("#") ? path.slice(1) : path
      router.push(cleanPath)
    },
    [router],
  )

  return [location, setLocation]
}
