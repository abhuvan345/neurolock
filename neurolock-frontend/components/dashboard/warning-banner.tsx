"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WarningBannerProps {
  onReAuth: () => void
}

export function WarningBanner({ onReAuth }: WarningBannerProps) {
  return (
    <div className="bg-amber-500/10 border-t border-b border-amber-500/30 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <p className="text-sm text-amber-300">Unusual behavior detected. Please re-authenticate to continue.</p>
      </div>
      <Button
        onClick={onReAuth}
        size="sm"
        className="bg-amber-500 hover:bg-amber-600 text-background font-semibold flex-shrink-0"
      >
        Re-authenticate
      </Button>
    </div>
  )
}
