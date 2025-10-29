import type React from "react"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function DashboardHeader({ title, subtitle, action }: DashboardHeaderProps) {
  return (
    <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
