"use client"

import React from "react"

export default function BorderBeam({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/2 to-black/5">
      {children}
    </div>
  )
}
