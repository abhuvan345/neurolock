"use client"

import { useEffect, useRef } from "react"

interface TrustMeterProps {
  score: number
  status: "active" | "warning" | "locked"
  summary: string
}

export function TrustMeter({ score, status, summary }: TrustMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 80

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = "#2d3f5c"
    ctx.lineWidth = 4
    ctx.stroke()

    // Determine color based on status
    let color = "#00d9ff" // active
    if (status === "warning") color = "#ffa500"
    if (status === "locked") color = "#ff0055"

    // Draw progress arc
    const angle = (score / 100) * Math.PI * 2 - Math.PI / 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, angle)
    ctx.strokeStyle = color
    ctx.lineWidth = 6
    ctx.lineCap = "round"
    ctx.stroke()

    // Draw center text
    ctx.fillStyle = "#f0f4f8"
    ctx.font = "bold 48px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${Math.round(score)}%`, centerX, centerY)

    // Draw label
    ctx.font = "14px Inter"
    ctx.fillStyle = "#a0b5d1"
    ctx.fillText("Trust Score", centerX, centerY + 60)
  }, [score, status])

  const statusLabel = status === "active" ? "✓ Normal" : status === "warning" ? "⚠ Warning" : "🔒 Locked"
  const statusColor = status === "active" ? "text-green-400" : status === "warning" ? "text-amber-400" : "text-red-400"

  return (
    <div
      className={`glass rounded-xl p-6 lg:p-8 glow-${status === "active" ? "cyan" : status === "warning" ? "amber" : "red"}`}
    >
      <h2 className="text-lg font-heading font-semibold mb-6 text-foreground">Trust Status</h2>

      <div className="flex flex-col items-center justify-center py-4">
        <canvas ref={canvasRef} width={240} height={220} className="w-full max-w-xs" />
      </div>

      <div
        className={`text-center mt-6 px-4 py-3 rounded-lg ${
          status === "active"
            ? "bg-green-500/10 border border-green-500/30"
            : status === "warning"
              ? "bg-amber-500/10 border border-amber-500/30"
              : "bg-red-500/10 border border-red-500/30"
        }`}
      >
        <p className={`font-heading font-semibold text-sm ${statusColor} mb-2`}>{statusLabel}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {summary || "Normal behavioral patterns detected"}
        </p>
      </div>
    </div>
  )
}
