"use client"

import React, { useEffect, useState } from "react"

export default function MorphingText({ texts, interval = 2000, className = "" }: { texts: string[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % texts.length)
        setVisible(true)
      }, 250)
    }, interval)

    return () => clearInterval(t)
  }, [texts.length, interval])

  return (
    <span className={className} style={{ display: "inline-block" }}>
      <span
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 240ms ease",
          display: "inline-block",
        }}
      >
        {texts[index]}
      </span>
    </span>
  )
}
