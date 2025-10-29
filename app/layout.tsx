import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SessionProvider } from "@/components/session-provider"
import { ClientLayoutWrapper } from "./client-layout-wrapper"
import { QueryClientProviderWrapper } from "./query-client-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Portal UNK",
  description: "Sistema de gerenciamento de eventos e DJs",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Portal UNK",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/192.png", sizes: "192x192", type: "image/png" },
      { url: "/256.png", sizes: "256x256", type: "image/png" },
      { url: "/512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/192.png", sizes: "192x192", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="application-name" content="Portal UNK" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Portal UNK" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#8b5cf6" />
        <link rel="apple-touch-icon" href="/192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/192.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/256.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/512.png" />
      </head>
      <body className={`${inter.className} dark bg-background text-foreground antialiased`}>
        <QueryClientProviderWrapper>
          <SessionProvider>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </SessionProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  )
}
