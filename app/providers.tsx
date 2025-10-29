"use client"

import type React from "react"

import { useEffect } from "react"

// Lista de mensagens de erro para suprimir
const SUPPRESSED_ERROR_MESSAGES = [
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications.",
  "Cannot read properties of null (reading 'postMessage')",
]

// Suprime erros de evento global
const suppressError = (event: ErrorEvent) => {
  if (event?.message && SUPPRESSED_ERROR_MESSAGES.some((msg) => event.message.includes(msg))) {
    event.stopImmediatePropagation()
    event.preventDefault()
  }
}

// Suprime erros de promessas não tratadas
const suppressRejection = (event: PromiseRejectionEvent) => {
  const reason = event?.reason
  const message = typeof reason === "string" ? reason : typeof reason?.message === "string" ? reason.message : null

  if (message && SUPPRESSED_ERROR_MESSAGES.some((msg) => message.includes(msg))) {
    event.preventDefault()
  }
}

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add error listeners
    window.addEventListener("error", suppressError)
    window.addEventListener("unhandledrejection", suppressRejection)

    // Register Service Worker for PWA
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // Service worker registration failed silently
        })
      })
    }

    // Cleanup
    return () => {
      window.removeEventListener("error", suppressError)
      window.removeEventListener("unhandledrejection", suppressRejection)
    }
  }, [])

  return children
}
