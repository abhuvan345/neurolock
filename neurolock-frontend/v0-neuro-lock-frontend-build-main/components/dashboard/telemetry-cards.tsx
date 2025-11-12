"use client"

import { TelemetryCard } from "./telemetry-card"

interface TelemetryData {
  avg_key_interval: number
  avg_key_hold: number
  mouse_speed: number
  click_rate: number
  click_variance: number
  scroll_rate: number
  nav_entropy: number
  time_on_page: number
}

interface TelemetryCardsProps {
  telemetry: TelemetryData
  isMonitoring: boolean
}

export function TelemetryCards({ telemetry, isMonitoring }: TelemetryCardsProps) {
  const metrics = [
    {
      label: "Avg Key Interval",
      value: `${Math.round(telemetry.avg_key_interval)}`,
      unit: "ms",
      icon: "keyboard",
    },
    {
      label: "Avg Key Hold",
      value: `${Math.round(telemetry.avg_key_hold)}`,
      unit: "ms",
      icon: "hold",
    },
    {
      label: "Mouse Speed",
      value: `${Math.round(telemetry.mouse_speed)}`,
      unit: "px/s",
      icon: "mouse",
    },
    {
      label: "Click Variance",
      value: `${telemetry.click_variance}`,
      unit: "ms²",
      icon: "variance",
    },
    {
      label: "Click Rate",
      value: `${Math.round(telemetry.click_rate * 100)}`,
      unit: "clicks",
      icon: "click",
    },
    {
      label: "Nav Entropy",
      value: `${telemetry.nav_entropy}`,
      unit: "bits",
      icon: "entropy",
    },
    {
      label: "Scroll Rate",
      value: `${Math.round(telemetry.scroll_rate * 100)}`,
      unit: "scrolls",
      icon: "scroll",
    },
    {
      label: "Time on Page",
      value: `${Math.round(telemetry.time_on_page)}`,
      unit: "s",
      icon: "time",
    },
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-2 h-2 rounded-full ${isMonitoring ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`}
        />
        <h2 className="text-lg font-heading font-semibold text-foreground">Live Telemetry</h2>
        <span className="text-xs text-muted-foreground">
          {isMonitoring ? "(Monitoring active)" : "(Monitoring paused)"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
        {metrics.map((metric) => (
          <TelemetryCard key={metric.label} {...metric} />
        ))}
      </div>
    </div>
  )
}
