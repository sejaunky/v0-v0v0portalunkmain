"use client"

import React from "react"

export function BorderBeam({ children, duration = 6, delay = 0, size = 400, borderWidth = 4, className = "" }: {
  children?: React.ReactNode
  duration?: number
  delay?: number
  size?: number
  borderWidth?: number
  className?: string
}) {
  // Decorative animated beams using gradients
  const style: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: `${size}px`,
    height: `${size}px`,
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    pointerEvents: "none",
    mixBlendMode: "screen",
    opacity: 0.6,
    background: "linear-gradient(90deg, rgba(255,0,150,0.08), rgba(0,120,255,0.08))",
    boxShadow: `0 0 ${borderWidth * 4}px rgba(255,255,255,0.02)`,
    animation: `borderbeam-rotate ${duration}s linear ${delay}s infinite`,
  }

  return (
    <>
      <div className={className} style={style} />
      <style>{`
        @keyframes borderbeam-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
      {children}
    </>
  )
}

export default BorderBeam
