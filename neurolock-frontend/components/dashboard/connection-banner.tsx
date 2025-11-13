"use client"

import { Wifi } from "lucide-react"

export function ConnectionBanner() {
  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-3 flex items-center gap-3">
      <Wifi className="w-4 h-4 text-yellow-400 flex-shrink-0 animate-pulse" />
      <p className="text-sm text-yellow-300">Connection issue detected — retrying to sync with backend...</p>
    </div>
  )
}
