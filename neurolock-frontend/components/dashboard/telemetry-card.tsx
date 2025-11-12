"use client"

import { Activity, Keyboard, Mouse, Zap, Clock, Scroll } from "lucide-react"

interface TelemetryCardProps {
  label: string
  value: string
  unit: string
  icon: string
}

export function TelemetryCard({ label, value, unit, icon }: TelemetryCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "keyboard":
        return <Keyboard className="w-4 h-4" />
      case "mouse":
        return <Mouse className="w-4 h-4" />
      case "click":
        return <Zap className="w-4 h-4" />
      case "variance":
        return <Activity className="w-4 h-4" />
      case "entropy":
        return <Zap className="w-4 h-4" />
      case "scroll":
        return <Scroll className="w-4 h-4" />
      case "time":
        return <Clock className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="glass rounded-lg p-4 hover:border-cyan-500/50 transition-colors group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground group-hover:text-cyan-400 transition-colors">{label}</p>
        <div className="text-cyan-400/60 group-hover:text-cyan-400 transition-colors">{getIcon()}</div>
      </div>
      <p className="text-lg lg:text-xl font-heading font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{unit}</p>
    </div>
  )
}
